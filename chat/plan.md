Below is an example of a simple, modern chat application built with a Node.js backend and a React front end using Material Design (via MUI). In this example, the backend reads a system prompt from a text file, forwards chat messages along with conversation history to the OpenAI Chat API (using a model called `"03-mini-high"`), and saves each conversation as a local JSON file. You can adjust and expand the code as needed.

---

## Project Structure

A suggested project layout is:

```
my-chat-app/
├── client/                // React front-end (e.g., created with create-react-app)
│   └── src/
│       └── App.js       // Main React component
├── conversations/         // Directory to store conversation JSON files
├── system_prompt.txt      // File with your system prompt
├── server.js              // Node/Express backend
├── package.json           // Server package.json (include dependencies)
```

---

## Backend (server.js)

```js
// server.js
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

// Load system prompt from file
const systemPromptPath = path.join(__dirname, 'system_prompt.txt');
const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');

// POST endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
  try {
    const { message, messages } = req.body;
    
    // Build the messages array for the OpenAI API,
    // starting with the system prompt.
    let chatMessages = [
      { role: "system", content: systemPrompt },
    ];
    
    // Include prior conversation messages, if provided.
    if (Array.isArray(messages)) {
      chatMessages = chatMessages.concat(messages);
    }
    
    // Append the new user message.
    chatMessages.push({ role: "user", content: message });
    
    // Call OpenAI Chat API using your API key (set in environment variable)
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "03-mini-high",
        messages: chatMessages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    
    // Get the assistant's reply from the API response.
    const assistantReply = response.data.choices[0].message.content;
    
    // Build the full conversation (including the reply)
    const conversationData = {
      timestamp: new Date().toISOString(),
      messages: chatMessages.concat([{ role: "assistant", content: assistantReply }]),
    };
    
    // Ensure the conversations directory exists.
    const conversationsDir = path.join(__dirname, 'conversations');
    if (!fs.existsSync(conversationsDir)) {
      fs.mkdirSync(conversationsDir);
    }
    
    // Save the conversation as a JSON file.
    const filename = `conversation-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(conversationsDir, filename),
      JSON.stringify(conversationData, null, 2)
    );
    
    // Respond with the assistant's reply.
    res.json({ reply: assistantReply });
  } catch (error) {
    console.error('Error in /api/chat:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while processing the chat request.' });
  }
});

// Fallback: serve React's index.html for any other requests.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

> **Note:** Make sure to set your OpenAI API key in the environment (e.g. by using a `.env` file or your hosting environment’s configuration).

---

## System Prompt File (system_prompt.txt)

Create a text file (in the project root) with your system prompt. For example:

```
You are a friendly and helpful assistant.
```

---

## Front End (client/src/App.js)

Below is a simple React component using MUI components for a clean Material Design look:

```jsx
// client/src/App.js
import React, { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to the conversation.
    const newMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, messages: updatedMessages }),
      });
      const data = await response.json();
      // Append the assistant's reply.
      const assistantMessage = { role: 'assistant', content: data.reply };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6">Chat with OpenAI</Typography>
        </Toolbar>
      </AppBar>
      <Paper sx={{ p: 2, height: '70vh', overflowY: 'auto' }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={msg.role === 'user' ? 'You' : 'Assistant'}
                secondary={msg.content}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ display: 'flex', mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={loading}
          sx={{ ml: 1 }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
}

export default App;
```

> **Tip:** You can create the React app using [Create React App](https://create-react-app.dev/) and then install MUI with:
> ```bash
> npm install @mui/material @emotion/react @emotion/styled
> ```

---

## Running the Application

1. **Backend Setup:**
   - Ensure you have Node.js installed.
   - Create a `package.json` and install dependencies:
     ```bash
     npm init -y
     npm install express body-parser axios
     ```
   - (Optionally) use a package like [dotenv](https://www.npmjs.com/package/dotenv) to manage your API keys.
   - Place your `server.js` and `system_prompt.txt` in the project root.
   - Create a folder named `conversations` (the server will also create it if missing).

2. **Front End Setup:**
   - In the `client` directory, create a React app if you haven’t already:
     ```bash
     npx create-react-app .
     ```
   - Replace the contents of `src/App.js` with the code above.
   - Install MUI as mentioned above.

3. **Build & Run:**
   - Build the React app:
     ```bash
     npm run build
     ```
   - Start the Node server:
     ```bash
     node server.js
     ```
   - Open your browser and navigate to `http://localhost:5000` to use your chat application.

---

This example provides a solid starting point for a chat app that uses modern React with Material Design on the front end and a Node.js backend that integrates with the OpenAI API while storing conversations locally. Adjust styling, error handling, and file management as needed for your production needs.