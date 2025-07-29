const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const BedrockService = require('./services/bedrockService');
const AudioProcessor = require('./services/audioProcessor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize services
const bedrockService = new BedrockService();
const audioProcessor = new AudioProcessor();

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the diagnostic page
app.get('/diagnostic', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'diagnostic.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle audio stream from client
  socket.on('audio-stream', async (audioData) => {
    try {
      // Process audio stream (this would be real-time speech-to-text)
      // For now, we'll simulate this with the Web Speech API on the frontend
      console.log('Received audio stream chunk');
    } catch (error) {
      console.error('Error processing audio stream:', error);
      socket.emit('error', { message: 'Audio processing failed' });
    }
  });

  // Handle speech-to-text result from client
  socket.on('speech-text', async (data) => {
    try {
      const { text, isFinal } = data;
      
      if (isFinal && text.trim()) {
        console.log('User said:', text);
        
        // Send to Amazon Bedrock
        const response = await bedrockService.generateResponse(text);
        console.log('AI Response:', response);
        
        // Send response back to client for text-to-speech
        socket.emit('ai-response', {
          text: response,
          timestamp: new Date().toISOString()
        });
      } else {
        // Send partial transcript for real-time display
        socket.emit('partial-transcript', { text });
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      socket.emit('error', { message: 'Speech processing failed' });
    }
  });

  // Handle conversation reset
  socket.on('reset-conversation', () => {
    bedrockService.resetConversation();
    socket.emit('conversation-reset');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to start chatting!`);
});
