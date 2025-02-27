require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Serve static files from React build (if deployed)
app.use(express.static(path.join(__dirname, 'client/build')));

// Load QQSH.md content
const qqshPath = path.join(__dirname, '..', 'QQSH.md');
const qqshContent = fs.readFileSync(qqshPath, 'utf8');

// Function to process prompt includes recursively
const processPromptIncludes = (promptContent, basePath, processedFiles = new Set()) => {
  // Use regex to find all includes in the format {filename}
  const includeRegex = /\{([^}]+)\}/g;
  let matches;
  let processedContent = promptContent;

  while ((matches = includeRegex.exec(promptContent)) !== null) {
    const [fullMatch, filename] = matches;
    const includePath = path.join(basePath, filename);

    // Prevent infinite recursion
    if (processedFiles.has(includePath)) {
      console.warn(`Circular include detected for ${filename}, skipping`);
      continue;
    }

    try {
      const includeContent = fs.readFileSync(includePath, 'utf8');
      processedFiles.add(includePath);
      // Recursively process includes in the included file
      const processedInclude = processPromptIncludes(includeContent, basePath, processedFiles);
      processedContent = processedContent.replace(fullMatch, processedInclude);
    } catch (error) {
      console.warn(`Failed to load include file ${filename}, leaving placeholder: ${error.message}`);
    }
  }

  return processedContent;
};

// Load and prepare agent prompts
const agents = {
  specialist: {
    name: 'QQSH Specialist',
    description: 'A PhD physicist and neurobiologist specialized in QQSH hypothesis',
    promptPath: path.join(__dirname, '..', 'QQSH_Specialist_prompt.txt')
  },
  sage: {
    name: 'QQSH Sage',
    description: 'A mystic hermetic/hindu sage with deep understanding of QQSH',
    promptPath: path.join(__dirname, '..', 'QQSH_sage_prompt.txt')
  }
};

// Load and prepare system prompts for each agent
for (const agent of Object.values(agents)) {
  const promptTemplate = fs.readFileSync(agent.promptPath, 'utf8');
  const basePath = path.dirname(agent.promptPath);
  agent.systemPrompt = processPromptIncludes(promptTemplate, basePath);
}

// Load sage addendum if it exists
const sageAddendumPath = path.join(__dirname, '..', 'QQSH_sage_addendum.txt');
let sageAddendumContent = '';
try {
  sageAddendumContent = fs.readFileSync(sageAddendumPath, 'utf8');
} catch (error) {
  console.warn('QQSH_sage_addendum.txt not found, continuing without it');
}

// GET endpoint to get available agents
app.get('/api/agents', (req, res) => {
  const agentList = Object.entries(agents).map(([id, agent]) => ({
    id,
    name: agent.name,
    description: agent.description
  }));
  res.json(agentList);
});

// GET endpoint to fetch conversations
app.get('/api/conversations', (req, res) => {
  try {
    const conversationsDir = path.join(__dirname, 'conversations');
    if (!fs.existsSync(conversationsDir)) {
      fs.mkdirSync(conversationsDir);
    }

    const files = fs.readdirSync(conversationsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const fullPath = path.join(conversationsDir, file);
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        // Get the last user message for preview (excluding system messages)
        const userMessages = content.messages.filter(msg => msg.role === 'user');
        const preview = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';
        
        return {
          id: file.replace('.json', ''),
          timestamp: content.timestamp,
          agentId: content.agentId,
          preview: preview,
          agent: agents[content.agentId]?.name || 'Unknown Agent'
        };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(files);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET endpoint to fetch a specific conversation
app.get('/api/conversations/:id', (req, res) => {
  try {
    const conversationPath = path.join(__dirname, 'conversations', `${req.params.id}.json`);
    if (!fs.existsSync(conversationPath)) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = JSON.parse(fs.readFileSync(conversationPath, 'utf8'));
    // Filter out system messages before sending to frontend
    conversation.messages = conversation.messages.filter(msg => msg.role !== 'system');
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// POST endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  console.log('Received chat request:', {
    agentId: req.body.agentId,
    message: req.body.message,
    previousMessagesCount: req.body.messages?.length || 0
  });
  
  try {
    const { message, messages, agentId } = req.body;
    
    if (!message) {
      throw new Error('No message provided');
    }
    
    if (!agentId || !agents[agentId]) {
      throw new Error('Invalid or missing agent ID');
    }
    
    // Get the agent's system prompt
    const systemPrompt = agents[agentId].systemPrompt;

    console.log('Agent system prompt:', systemPrompt);
    
    // Build the messages array for the OpenAI API
    let chatMessages = [
      { role: "system", content: systemPrompt },
    ];
    
    // Include prior conversation messages
    if (Array.isArray(messages)) {
      chatMessages = chatMessages.concat(messages);
    }
    
    // Append the new user message
    chatMessages.push({ role: "user", content: message });
    
    console.log('Sending to OpenAI:', {
      agent: agents[agentId].name,
      messageCount: chatMessages.length,
      lastMessage: message
    });
    
    // Call OpenAI Chat API
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "o1",
        messages: chatMessages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }
    
    const assistantReply = response.data.choices[0].message.content;
    console.log('Received reply from OpenAI:', assistantReply.substring(0, 100) + '...');
    
    // Build the conversation data
    const conversationData = {
      timestamp: new Date().toISOString(),
      agentId,
      messages: chatMessages.concat([{ role: "assistant", content: assistantReply }]),
    };
    
    // Ensure the conversations directory exists
    const conversationsDir = path.join(__dirname, 'conversations');
    if (!fs.existsSync(conversationsDir)) {
      fs.mkdirSync(conversationsDir);
    }
    
    // Save the conversation
    const filename = `conversation-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(conversationsDir, filename),
      JSON.stringify(conversationData, null, 2)
    );
    
    res.json({ reply: assistantReply });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    if (error.response?.data) {
      console.error('OpenAI API error:', error.response.data);
    }
    res.status(500).json({ 
      error: 'An error occurred while processing the chat request.',
      details: error.message
    });
  }
});

// Fallback: serve React's index.html for any other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 