# DrVibe - Real-time AI Conversation

A real-time conversational AI application that enables natural voice conversations with Amazon Bedrock AI. Features live speech-to-text, AI processing, and text-to-speech for seamless interaction.

## Features

- 🎤 **Real-time Speech Recognition** - Continuous voice input using Web Speech API
- 🤖 **Amazon Bedrock Integration** - Powered by Claude AI for intelligent responses
- 🔊 **Text-to-Speech** - Natural AI voice responses
- 💬 **Live Conversation Flow** - No recording needed, just speak naturally
- 🌐 **Web Interface** - Clean, responsive design
- ⚡ **WebSocket Communication** - Real-time bidirectional communication
- 🎛️ **Voice Controls** - Adjustable voice, volume, and speech rate

## Prerequisites

- Node.js (v16 or higher)
- AWS Account with Bedrock access
- Modern web browser (Chrome, Safari, or Edge recommended)
- Microphone access

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure AWS Credentials

1. Copy the environment template:
```bash
copy .env.example .env
```

2. Edit `.env` and add your AWS credentials:
```env
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
PORT=3000
```

### 3. AWS Bedrock Setup

1. Go to AWS Console → Bedrock
2. Request access to Claude models in your region
3. Ensure your AWS credentials have bedrock permissions:
   - `bedrock:InvokeModel`
   - `bedrock:InvokeModelWithResponseStream`

### 4. Start the Application

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### 5. Open the Application

Navigate to `http://localhost:3000` in your browser.

## Usage

1. **Grant Microphone Permission** - Allow microphone access when prompted
2. **Click "Start Conversation"** - Begin the voice interaction
3. **Speak Naturally** - The app will continuously listen and respond
4. **Adjust Settings** - Modify AI voice, volume, and speech rate as needed
5. **Reset Conversation** - Clear chat history with the reset button

## Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Safari
- ✅ Edge
- ❌ Firefox (Limited Speech API support)

## Troubleshooting

### Common Issues

**Microphone Not Working:**
- Ensure microphone permissions are granted
- Check if another application is using the microphone
- Try refreshing the page

**AWS/Bedrock Errors:**
- Verify AWS credentials are correct
- Ensure Bedrock model access is approved
- Check AWS region configuration

**Speech Recognition Issues:**
- Use Chrome or Safari for best compatibility
- Ensure stable internet connection
- Check browser console for error messages

### Browser Permissions

The app requires:
- Microphone access for speech recognition
- Internet connection for AI processing

## Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Web Frontend  │ ◄─────────────► │   Node.js       │
│                 │                 │   Server        │
│ • Speech API    │                 │                 │
│ • WebSocket     │                 │ • Socket.IO     │
│ • TTS           │                 │ • Express       │
└─────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │  Amazon Bedrock │
                                    │                 │
                                    │ • Claude AI     │
                                    │ • Real-time     │
                                    │   Processing    │
                                    └─────────────────┘
```

## File Structure

```
DrVibe/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── .env.example            # Environment template
├── services/
│   ├── bedrockService.js   # Amazon Bedrock integration
│   └── audioProcessor.js   # Audio processing utilities
└── public/
    ├── index.html          # Main web interface
    ├── app.js             # Frontend JavaScript
    └── styles.css         # Styling
```

## Customization

### Changing AI Model

Edit `.env` to use different Bedrock models:
```env
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

### Modifying System Prompt

Edit `services/bedrockService.js`:
```javascript
this.systemPrompt = "Your custom system prompt here...";
```

### Voice Settings

Adjust default voice settings in `public/app.js`:
```javascript
utterance.rate = 1.0;    // Speech rate
utterance.pitch = 1.0;   // Voice pitch
utterance.volume = 0.8;  // Volume level
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Adding New Features

1. **Backend**: Add services in the `services/` directory
2. **Frontend**: Extend `public/app.js` for new UI features
3. **Socket Events**: Define new events in `server.js` and `app.js`

## Security Considerations

- Store AWS credentials securely
- Use environment variables for sensitive data
- Consider implementing rate limiting for production
- Validate all user inputs

## Performance Optimization

- Speech recognition runs locally in the browser
- WebSocket connections enable real-time communication
- Conversation history is limited to prevent memory issues
- Audio processing is minimal for low latency

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify AWS configuration
4. Test with different browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
