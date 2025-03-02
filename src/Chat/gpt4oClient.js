const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const logger = require('./logger');
const EventEmitter = require('events');

const openai = new OpenAI({ apiKey: process.env.GPT4O_API_KEY });
const eventEmitter = new EventEmitter();

// Constants for audio processing
const SILENCE_THRESHOLD = 0.008;
const MIN_CHUNK_SIZE = 16000; // 1 second at 16kHz
const MAX_AUDIO_LENGTH = 160000; // 10 seconds at 16kHz
const SILENCE_CHUNKS = 14;

// Track the currently loaded file
let currentFile = {
    name: null,
    content: null
};

// Enhanced system prompt for file operations
const SYSTEM_PROMPT = `You are an intelligent AI assistant with extensive knowledge and capabilities in file management, content creation, and document organization.

Current Context:
{current_context}

CRITICAL CONTEXT RULES:
- ALWAYS use the EXACT content from the current context when targeting content
- The current context shows the ACTUAL state of files
- NEVER assume content exists if not shown in current context
- When editing, match EXACTLY what you see in the current context
- Content matching must be based on the CURRENT file state, not previous states

File Operations Guide:
1. CREATE NEW FILES:
   - Use create_or_update_file only for new files
   - Never recreate existing files
   - When no file is open, first check available files with list_files
   - Suggest existing files when they match the user's request

2. EDIT EXISTING FILES:
   Use edit_file with these operations:
   a) INSERT: Add content after matching content
      {
        "type": "insert_after",
        "target": "[EXACT content to match from current context]",
        "content": "[content to insert]"
      }
   
   b) DELETE: Remove matching content
      {
        "type": "delete",
        "target": "[EXACT content to match from current context]"
      }
   
   c) REPLACE: Change matching content
      {
        "type": "replace",
        "target": "[EXACT content to match from current context]",
        "content": "[new content]"
      }

IMPORTANT:
- Content Matching:
  * Match EXACTLY what appears in the current context
  * Use the CURRENT state of the file, not assumed or remembered states
  * Verify target content exists in current context before operations
  * Content-based operations must match current file state precisely

- Working with Lists:
  * For numbered lists, always start with 1 and increment sequentially
  * The system will handle renumbering automatically
  * Focus on the content after the number, not the number itself
  * Example: When adding to "1. First task", match "First task"
  * ALWAYS verify the exact content in current context

- File Management:
  * Always check if a file exists before attempting to create it
  * When a user requests a file, check the available files first
  * If a requested file doesn't exist, suggest similar existing files
  * Keep track of the currently open file and its content

OPERATION GUIDELINES:
1. Content Matching Rules:
   - CORRECT: target: "content" (matches partial)
   - CORRECT: target: "content\nmore" (matches multiple lines)
   - CORRECT: target: "First task" (matches "1. First task")
   - AVOID: Single-letter matches (use more context for reliable targeting)
   - AVOID: Single-word matches (use the complete phrase or line for context)
   - REQUIRED: Use EXACT content from current context for matching
   - REQUIRED: When replacing text, preserve the original line format
   
2. Handling Content:
   - ALWAYS verify content exists in current context before targeting
   - Match EXACTLY what you see in the current file state
   - When replacing text, use enough context to ensure unique matches
   - IMPORTANT: When replacing, maintain the original line structure
   - For lists: preserve the numbering and formatting
   - VERIFY: Double-check target content exists in current context

3. Making Changes:
   - One operation at a time
   - Be explicit about what to match
   - System handles line numbers automatically
   - Always use enough context to ensure accurate targeting
   - CRITICAL: Never replace a full line with just a word
   - Maintain the original line format in replacements
   - VERIFY: Confirm target content in current context before editing

4. File Handling:
   - List available files when no file is open
   - Suggest similar files when exact match not found
   - Provide clear feedback about file operations
   - Keep track of current file state

Remember:
- The file content in your context is always current and authoritative
- ONLY use content that exists in the current context for targeting
- Make specific, targeted changes based on EXACT current content
- Use high standards for markdown formatting
- Respect existing structure while making edits
- Partial content matching is supported but must match current context
- Always check available files before creating new ones
- NEVER replace formatted content with unformatted content
- When replacing text, preserve the original formatting
- CRITICAL: Base ALL operations on the CURRENT context, not memory`;

// Conversation history with enhanced system prompt
let conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT }
];

// Create necessary directories
const filesDir = path.join(__dirname, '..', 'files');
const tempDir = path.join(__dirname, '..', 'temp');

[filesDir, tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        logger.info('Creating directory', { path: dir });
        fs.mkdirSync(dir, { recursive: true });
    }
});

// File operations helper functions
const createOrUpdateFile = async (filename, content) => {
    try {
        const filePath = path.join(filesDir, filename);
        const isNew = !fs.existsSync(filePath);
        
        if (!isNew) {
            logger.warn('File already exists, should edit instead', { filename });
            return {
                success: false,
                message: `The file "${filename}" already exists. Please use specific edits to modify its content instead of recreating it.`
            };
        }
        
        // Only proceed with creation for new files
        await fs.promises.writeFile(filePath, content);
        logger.info('File created successfully', { filename });
        
        // Update current file
        currentFile = {
            name: filename,
            content: content
        };
        
        // Emit file update event
        eventEmitter.emit('file-updated', {
            fileId: filename,
            filename: filename,
            content: content,
            action: 'created'
        });
        
        return {
            success: true,
            message: `Created new file "${filename}"`
        };
    } catch (error) {
        logger.error('Error creating file', { 
            filename,
            error: error.message 
        });
        return {
            success: false,
            message: `Error creating file: ${error.message}`
        };
    }
};

const readFile = async (filename) => {
    try {
        const filePath = path.join(filesDir, filename);
        logger.debug('Reading file', { filename, path: filePath });
        const content = await fs.promises.readFile(filePath, 'utf8');
        
        // Update current file
        currentFile = {
            name: filename,
            content: content
        };
        
        // Emit file update event with action type and content
        eventEmitter.emit('file-updated', {
            fileId: filename,
            filename: filename,
            content: content,
            action: 'opened'
        });

        // Return content and a success flag
        return {
            success: true,
            content: content
        };
    } catch (error) {
        logger.error('Error reading file', { 
            filename,
            error: error.message 
        });
        return {
            success: false,
            error: error.message
        };
    }
};

function createWavHeader(sampleLength) {
    logger.debug('Creating WAV header', { sampleLength });
    try {
        const numChannels = 1;
        const sampleRate = 16000;
        const bitsPerSample = 16;
        const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
        const blockAlign = (numChannels * bitsPerSample) / 8;
        const subChunk2Size = sampleLength * numChannels * (bitsPerSample / 8);
        const chunkSize = 36 + subChunk2Size;

        const header = Buffer.alloc(44);

        // RIFF chunk descriptor
        header.write('RIFF', 0);
        header.writeUInt32LE(chunkSize, 4);
        header.write('WAVE', 8);

        // fmt sub-chunk
        header.write('fmt ', 12);
        header.writeUInt32LE(16, 16);
        header.writeUInt16LE(1, 20);
        header.writeUInt16LE(numChannels, 22);
        header.writeUInt32LE(sampleRate, 24);
        header.writeUInt32LE(byteRate, 28);
        header.writeUInt16LE(blockAlign, 32);
        header.writeUInt16LE(bitsPerSample, 34);

        // data sub-chunk
        header.write('data', 36);
        header.writeUInt32LE(subChunk2Size, 40);

        logger.debug('WAV header created successfully');
        return header;
    } catch (error) {
        logger.error('Error creating WAV header', { error: error.message });
        throw error;
    }
}

// Add list_files function
const listFiles = async () => {
    try {
        const files = await fs.promises.readdir(filesDir);
        logger.debug('Files listed successfully', { files });
        
        // If no file is loaded, send the file list to the frontend
        if (!currentFile.name) {
            eventEmitter.emit('file-list', {
                files: files
            });
        }
        
        return files;
    } catch (error) {
        logger.error('Error listing files', { error: error.message });
        return [];
    }
};

// Add the edit_file function
const editFile = async (filename, operation) => {
    try {
        const filePath = path.join(filesDir, filename);
        logger.debug('Attempting to edit file', { 
            filename,
            path: filePath,
            operation 
        });

        if (!fs.existsSync(filePath)) {
            logger.warn('File not found for editing', { filename });
            return {
                success: false,
                message: `File "${filename}" does not exist. Please create it first.`
            };
        }

        const currentContent = await fs.promises.readFile(filePath, 'utf8');
        const lines = currentContent.split('\n');
        logger.debug('Current file content', { 
            filename,
            content: currentContent,
            lineCount: lines.length
        });

        // Find matching content
        const targetContent = operation.target.split('\n');
        let startIndex = -1;
        let endIndex = -1;

        // For single-letter or short targets, use word boundaries
        if (targetContent.length === 1 && targetContent[0].length <= 2) {
            startIndex = lines.findIndex(line => {
                const words = line.split(/\s+/);
                return words.some(word => word === targetContent[0]);
            });
            endIndex = startIndex;
        } else if (targetContent.length === 1) {
            // For single-line targets, allow partial matches
            startIndex = lines.findIndex(line => line.includes(targetContent[0]));
            endIndex = startIndex;
        } else {
            // For multi-line targets, find consecutive matches
            for (let i = 0; i <= lines.length - targetContent.length; i++) {
                let matches = true;
                for (let j = 0; j < targetContent.length; j++) {
                    if (!lines[i + j].includes(targetContent[j])) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    startIndex = i;
                    endIndex = i + targetContent.length - 1;
                    break;
                }
            }
        }

        if (startIndex === -1) {
            logger.warn('Target content not found', { 
                target: operation.target,
                operation: operation.type
            });
            return {
                success: false,
                message: `Could not find the content "${operation.target}" in the file.`
            };
        }

        // Apply the operation
        let newLines = [...lines];
        
        // Check if we're working with a numbered list
        const isNumberedList = newLines.some(line => /^\d+\./.test(line.trim()));
        
        // Format new content if we're in a numbered list context
        if (isNumberedList && (operation.type === 'insert_after' || operation.type === 'insert_before')) {
            // If the content doesn't already have a number prefix, add a temporary one
            if (!(/^\d+\./.test(operation.content.trim()))) {
                operation.content = `0. ${operation.content}`;  // Use 0 as temporary number
            }
        }
        
        switch (operation.type) {
            case 'insert_after':
                newLines.splice(endIndex + 1, 0, operation.content);
                break;
            case 'insert_before':
                newLines.splice(startIndex, 0, operation.content);
                break;
            case 'delete':
                newLines.splice(startIndex, endIndex - startIndex + 1);
                break;
            case 'replace':
                newLines.splice(startIndex, endIndex - startIndex + 1, operation.content);
                break;
        }

        // Always check and renumber lists, regardless of operation
        if (isNumberedList) {
            let numberIndex = 1;
            newLines = newLines.map(line => {
                const trimmed = line.trim();
                if (/^\d+\./.test(trimmed)) {
                    return `${numberIndex++}. ${trimmed.replace(/^\d+\.\s*/, '')}`;
                }
                return line;
            });
        }

        const newContent = newLines.join('\n');
        logger.debug('New content generated', {
            filename,
            newContent,
            lineCount: newLines.length
        });

        await fs.promises.writeFile(filePath, newContent);
        logger.info('File written successfully', { 
            filename,
            newSize: newContent.length
        });

        // Update current file
        currentFile = {
            name: filename,
            content: newContent
        };

        // Emit file update event
        const updateEvent = {
            fileId: filename,
            filename: filename,
            content: newContent,
            action: 'updated'
        };
        logger.debug('Emitting file update event', { 
            filename,
            eventType: 'file-updated',
            eventData: updateEvent
        });
        eventEmitter.emit('file-updated', updateEvent);

        return {
            success: true,
            message: `Updated file "${filename}" successfully`
        };
    } catch (error) {
        logger.error('Error editing file', { 
            filename,
            error: error.message,
            errorStack: error.stack,
            errorName: error.name
        });
        return {
            success: false,
            message: `Error editing file: ${error.message}`
        };
    }
};

async function getChatResponse(userMessage, socket) {
    logger.logToFile('\n=== GETTING CHAT RESPONSE ===');
    logger.logToFile('User message: ' + userMessage);
    
    try {
        // Get the current list of files
        const files = await listFiles();
        
        // Create the current context section
        let currentContext = '';
        if (currentFile.name) {
            currentContext = `Currently working with file: ${currentFile.name}\nContent:\n${currentFile.content}`;
        } else {
            currentContext = `No file currently loaded.\nAvailable files: ${files.length > 0 ? files.join(', ') : 'No files found'}`;
        }
        
        // Update system message with current context
        conversationHistory[0] = {
            role: "system",
            content: SYSTEM_PROMPT.replace('{current_context}', currentContext)
        };
        
        // Add user's message to history
        conversationHistory.push({ role: "user", content: userMessage });
        
        // Get response from GPT-4 with enhanced function calling
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: conversationHistory,
            temperature: 0.7,
            max_tokens: 150,
            functions: [
                {
                    name: "list_files",
                    description: "List all available files in the workspace",
                    parameters: {
                        type: "object",
                        properties: {}
                    }
                },
                {
                    name: "create_or_update_file",
                    description: "Create a new file (do not use for existing files)",
                    parameters: {
                        type: "object",
                        properties: {
                            filename: {
                                type: "string",
                                description: "Name of the file to create"
                            },
                            content: {
                                type: "string",
                                description: "Content to write to the file"
                            }
                        },
                        required: ["filename", "content"]
                    }
                },
                {
                    name: "edit_file",
                    description: "Make changes to an existing file using simple operations. For numbered lists, provide the content without numbers - the system will handle numbering automatically.",
                    parameters: {
                        type: "object",
                        properties: {
                            filename: {
                                type: "string",
                                description: "Name of the file to edit"
                            },
                            operation: {
                                type: "object",
                                description: "The edit operation to perform. For numbered lists, provide content without numbers (e.g. 'Buy milk' not '1. Buy milk')",
                                properties: {
                                    type: {
                                        type: "string",
                                        enum: ["insert_after", "insert_before", "delete", "replace"],
                                        description: "Type of edit operation"
                                    },
                                    target: {
                                        type: "string",
                                        description: "The line to target (content to match, without numbers for numbered lists)"
                                    },
                                    content: {
                                        type: "string",
                                        description: "For insert/replace operations, the new content to add (without numbers for numbered lists)"
                                    }
                                },
                                required: ["type", "target"]
                            }
                        },
                        required: ["filename", "operation"]
                    }
                },
                {
                    name: "read_file",
                    description: "Read and load a file into the current context",
                    parameters: {
                        type: "object",
                        properties: {
                            filename: {
                                type: "string",
                                description: "Name of the file to read"
                            }
                        },
                        required: ["filename"]
                    }
                }
            ]
        });

        const response = completion.choices[0].message;
        let responseContent = response.content;

        // Handle function calls if present
        if (response.function_call) {
            const functionName = response.function_call.name;
            const args = JSON.parse(response.function_call.arguments);

            if (functionName === 'list_files') {
                const files = await listFiles();
                if (files.length > 0) {
                    responseContent = `I found these files: ${files.join(', ')}. Which one would you like to work with?`;
                } else {
                    responseContent = "I don't see any files yet. Would you like me to create one?";
                }
            } else if (functionName === 'create_or_update_file') {
                const result = await createOrUpdateFile(args.filename, args.content);
                if (result.success) {
                    eventEmitter.once('file-updated', (data) => {
                        socket.emit('file-updated', data);
                    });
                    responseContent = result.message;
                } else {
                    // Add the error message to conversation history so GPT knows to try editing instead
                    conversationHistory.push({
                        role: "function",
                        name: "create_or_update_file",
                        content: result.message
                    });
                    responseContent = result.message;
                }
            } else if (functionName === 'edit_file') {
                logger.debug('Received edit_file function call', {
                    filename: args.filename,
                    operation: args.operation
                });
                
                const result = await editFile(args.filename, args.operation);
                if (result.success) {
                    logger.debug('Edit operation succeeded', {
                        filename: args.filename,
                        result
                    });
                    eventEmitter.once('file-updated', (data) => {
                        logger.debug('File update event handler triggered', {
                            eventData: data
                        });
                        socket.emit('file-updated', data);
                    });
                    responseContent = result.message;
                } else {
                    logger.warn('Edit operation failed', {
                        filename: args.filename,
                        error: result.message,
                        operation: args.operation
                    });
                    // Add the error message to conversation history so GPT knows to try editing instead
                    conversationHistory.push({
                        role: "function",
                        name: "edit_file",
                        content: result.message
                    });
                    responseContent = result.message;
                }
            } else if (functionName === 'read_file') {
                const result = await readFile(args.filename);
                if (result.success) {
                    // Set the response content for the AI message
                    responseContent = `I've loaded "${args.filename}". What would you like to do with it?`;
                } else {
                    // Check available files
                    const files = await listFiles();
                    const similarFiles = files.filter(f => f.toLowerCase().includes(args.filename.toLowerCase().replace('.txt', '').replace('.md', '')));
                    
                    if (similarFiles.length > 0) {
                        responseContent = `I couldn't find "${args.filename}". Did you mean one of these: ${similarFiles.join(', ')}?`;
                    } else if (files.length > 0) {
                        responseContent = `I couldn't find "${args.filename}". Available files are: ${files.join(', ')}. Would you like to work with one of these or create a new file?`;
                    } else {
                        responseContent = `I couldn't find "${args.filename}" or any other files. Would you like me to create one for you?`;
                    }
                }
            }
        }

        // Add assistant's response to history
        conversationHistory.push({ 
            role: "assistant", 
            content: responseContent || "I understand your request. How can I help you with that?"
        });

        // Keep only last 10 messages to manage context window
        if (conversationHistory.length > 11) {
            conversationHistory = [
                conversationHistory[0],
                ...conversationHistory.slice(-10)
            ];
        }

        return responseContent;
    } catch (error) {
        logger.logToFile('Error getting chat response:');
        logger.logToFile(error);
        return "I apologize, but I encountered an error processing your request. Could you please try again?";
    }
}

async function processAudioChunk(audioBuffer, socket) {
    logger.logToFile('\n=== PROCESSING AUDIO CHUNK ===');
    logger.logToFile(`Input buffer type: ${audioBuffer.constructor.name}`);
    logger.logToFile(`Input buffer size: ${audioBuffer.length} bytes`);
    logger.logToFile(`Audio duration: ${audioBuffer.length / 32000} seconds`);

    const wavPath = path.join(tempDir, `chunk-${Date.now()}.wav`);
    logger.logToFile('Creating WAV file: ' + wavPath);

    try {
        // Create WAV file
        const header = createWavHeader(audioBuffer.length / 2);
        const wavFile = Buffer.concat([header, audioBuffer]);
        
        logger.logToFile(`Writing WAV file (${wavFile.length} bytes)`);
        await fs.promises.writeFile(wavPath, wavFile);
        
        logger.logToFile('Sending to OpenAI for transcription...');
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(wavPath),
            model: "whisper-1",
            language: "en",
            response_format: "text",
            temperature: 0.3,
            prompt: "The audio contains spoken English text that may include programming terms."
        });

        logger.logToFile('Received response from OpenAI');
        logger.logToFile('Raw transcription: ' + JSON.stringify(transcription));
        
        if (transcription && transcription.trim()) {
            logger.logToFile('Transcription successful: ' + transcription);
            
            // Get chat response
            const chatResponse = await getChatResponse(transcription, socket);
            
            // Ensure we always return valid results
            return {
                transcription: transcription,
                response: chatResponse || "I understand what you said, but I'm not sure how to help with that. Could you please rephrase your request?"
            };
        } else {
            logger.logToFile('Empty transcription received');
            return {
                transcription: "I couldn't understand the audio clearly.",
                response: "I couldn't understand what you said. Could you please try speaking again?"
            };
        }
    } catch (error) {
        logger.logToFile('Error in processAudioChunk:');
        logger.logToFile('Error name: ' + error.name);
        logger.logToFile('Error message: ' + error.message);
        logger.logToFile('Error stack: ' + error.stack);
        
        // Return a user-friendly error response instead of throwing
        return {
            transcription: "Error processing audio",
            response: "I encountered an error while processing your speech. Could you please try again?"
        };
    } finally {
        // Clean up the temporary file
        try {
            if (fs.existsSync(wavPath)) {
                logger.debug('Cleaning up temporary WAV file', { path: wavPath });
                fs.unlinkSync(wavPath);
            }
        } catch (cleanupError) {
            logger.error('Error cleaning up WAV file', { 
                path: wavPath,
                error: cleanupError.message 
            });
        }
    }
}

module.exports = {
    processAudioChunk,
    eventEmitter,
    currentFile,
    editFile
}; 