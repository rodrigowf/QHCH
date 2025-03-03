import logger from './logger';
import { FILES_STORAGE_KEY } from './config/constants';

// Track the currently loaded file
let currentFile = {
    name: null,
    content: null
};

// Initialize storage (in browser environment)
if (typeof window !== 'undefined') {
    if (!localStorage.getItem(FILES_STORAGE_KEY)) {
        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify({}));
    }
}

const createOrUpdateFile = async (filename, content) => {
    try {
        const files = JSON.parse(localStorage.getItem(FILES_STORAGE_KEY));
        const isNew = !files[filename];
        
        if (!isNew) {
            logger.warn('File already exists, should edit instead', { filename });
            return {
                success: false,
                message: `The file "${filename}" already exists. Please use specific edits to modify its content instead of recreating it.`
            };
        }
        
        files[filename] = content;
        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
        logger.info('File created successfully', { filename });
        
        currentFile = { name: filename, content };
        
        return {
            success: true,
            message: `Created new file "${filename}"`
        };
    } catch (error) {
        logger.error('Error creating file', { filename, error: error.message });
        return {
            success: false,
            message: `Error creating file: ${error.message}`
        };
    }
};

const readFile = async (filename) => {
    try {
        const files = JSON.parse(localStorage.getItem(FILES_STORAGE_KEY));
        console.log('Reading file', { filename });
        
        if (!files[filename]) {
            throw new Error('File not found');
        }
        
        const content = files[filename];
        currentFile = { name: filename, content };
        
        return { success: true, content };
    } catch (error) {
        logger.error('Error reading file', { filename, error: error.message });
        return { success: false, error: error.message };
    }
};

const listFiles = async () => {
    try {
        const files = JSON.parse(localStorage.getItem(FILES_STORAGE_KEY));
        const fileList = Object.keys(files);
        console.log('Files listed successfully', { files: fileList });
        
        return fileList;
    } catch (error) {
        logger.error('Error listing files', { error: error.message });
        return [];
    }
};

const editFile = async (filename, operation) => {
    try {
        const files = JSON.parse(localStorage.getItem(FILES_STORAGE_KEY));
        console.log('Attempting to edit file', { filename, operation });
        
        if (!files[filename]) {
            logger.warn('File not found for editing', { filename });
            return {
                success: false,
                message: `File "${filename}" does not exist. Please create it first.`
            };
        }
        
        const currentContent = files[filename];
        const lines = currentContent.split('\n');
        console.log('Current file content', {
            filename,
            content: currentContent,
            lineCount: lines.length
        });
        
        const targetContent = operation.target.split('\n');
        let startIndex = -1;
        let endIndex = -1;
        
        if (targetContent.length === 1 && targetContent[0].length <= 2) {
            startIndex = lines.findIndex(line => {
                const words = line.split(/\s+/);
                return words.some(word => word === targetContent[0]);
            });
            endIndex = startIndex;
        } else if (targetContent.length === 1) {
            startIndex = lines.findIndex(line => line.includes(targetContent[0]));
            endIndex = startIndex;
        } else {
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
            logger.warn('Target content not found', { target: operation.target, operation: operation.type });
            return {
                success: false,
                message: `Could not find the content "${operation.target}" in the file.`
            };
        }
        
        let newLines = [...lines];
        const isNumberedList = newLines.some(line => /^\d+\./.test(line.trim()));
        if (isNumberedList && (operation.type === 'insert_after' || operation.type === 'insert_before')) {
            if (!(/^\d+\./.test(operation.content.trim()))) {
                operation.content = `0. ${operation.content}`;
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
        console.log('New content generated', { filename, newContent, lineCount: newLines.length });
        
        files[filename] = newContent;
        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
        logger.info('File written successfully', { filename, newSize: newContent.length });
        
        currentFile = { name: filename, content: newContent };
        
        return { success: true, message: `Updated file "${filename}" successfully` };
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

function getCurrentFile() {
    return currentFile;
}

export {
    createOrUpdateFile,
    readFile,
    listFiles,
    editFile,
    getCurrentFile
};

