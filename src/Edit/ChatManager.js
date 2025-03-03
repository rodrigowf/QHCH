import { listFiles, currentFile, createOrUpdateFile, editFile, readFile } from './FileManager';
import { CONVERSATION_HISTORY_KEY, SYSTEM_PROMPT } from './config/constants';

// Use your React app's environment variable for the API key.
// IMPORTANT: Exposing your API key is insecure in production.
const API_KEY = process.env.REACT_APP_GPT4O_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

const getConversationHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(CONVERSATION_HISTORY_KEY)) || [
            { role: "system", content: SYSTEM_PROMPT }
        ];
    } catch (error) {
        console.error('Error reading conversation history', error);
        return [{ role: "system", content: SYSTEM_PROMPT }];
    }
};

const saveConversationHistory = (history) => {
    try {
        localStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving conversation history', error);
    }
};

async function getChatResponse(userMessage) {
    console.log('\n=== GETTING CHAT RESPONSE ===');
    console.log('User message: ' + userMessage);

    try {
        const files = await listFiles();

        let currentContext = '';
        if (currentFile.name) {
            currentContext = `Currently working with file: ${currentFile.name}\nContent:\n${currentFile.content}`;
        } else {
            currentContext = `No file currently loaded.\nAvailable files: ${files.length > 0 ? files.join(', ') : 'No files found'}`;
        }

        let conversationHistory = getConversationHistory();

        // Replace the system prompt in the conversation history with the current context.
        conversationHistory[0] = {
            role: "system",
            content: SYSTEM_PROMPT.replace('{current_context}', currentContext)
        };

        conversationHistory.push({ role: "user", content: userMessage });

        // Build the payload to call the OpenAI API.
        const payload = {
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
        };

        // Call the OpenAI API using fetch (this is our client-side replacement).
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });
        const completion = await response.json();

        // Process the response from the OpenAI API.
        const message = completion.choices[0].message;
        let responseContent = message.content;

        if (message.function_call) {
            const functionName = message.function_call.name;
            const args = JSON.parse(message.function_call.arguments);

            if (functionName === 'list_files') {
                const files = await listFiles();
                responseContent = files.length > 0
                    ? `I found these files: ${files.join(', ')}. Which one would you like to work with?`
                    : "I don't see any files yet. Would you like me to create one?";
            } else if (functionName === 'create_or_update_file') {
                const result = await createOrUpdateFile(args.filename, args.content);
                if (result.success) {
                    responseContent = result.message;
                } else {
                    conversationHistory.push({
                        role: "function",
                        name: "create_or_update_file",
                        content: result.message
                    });
                    responseContent = result.message;
                }
            } else if (functionName === 'edit_file') {
                const result = await editFile(args.filename, args.operation);
                if (result.success) {
                    responseContent = result.message;
                } else {
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
                    responseContent = `I've loaded "${args.filename}". What would you like to do with it?`;
                } else {
                    const files = await listFiles();
                    const similarFiles = files.filter(f =>
                        f.toLowerCase().includes(args.filename.toLowerCase().replace('.txt', '').replace('.md', ''))
                    );

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

        conversationHistory.push({
            role: "assistant", 
            content: responseContent || "I understand your request. How can I help you with that?"
        });

        // Keep the last few conversation entries.
        if (conversationHistory.length > 11) {
            conversationHistory = [
                conversationHistory[0],
                ...conversationHistory.slice(-10)
            ];
        }

        saveConversationHistory(conversationHistory);

        return responseContent;
    } catch (error) {
        console.error('Error getting chat response:', error);
        return "I apologize, but I encountered an error processing your request. Could you please try again?";
    }
}

export {
    getChatResponse,
    getConversationHistory,
    saveConversationHistory,
};