# DrVibe Configuration Guide

## Quick Setup Checklist

### 1. Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version (recommended)
- Restart your terminal after installation

### 2. Configure AWS Credentials

Create a `.env` file in the project root with:

```env
# Required AWS Configuration
AWS_ACCESS_KEY_ID=AKIA...              # Your AWS Access Key ID
AWS_SECRET_ACCESS_KEY=...              # Your AWS Secret Access Key
AWS_REGION=us-east-1                   # AWS region (us-east-1 recommended)

# Bedrock Model Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Server Configuration
PORT=3000                              # Port for the web server
```

### 3. AWS Bedrock Setup

1. **Enable Bedrock Access:**
   - Go to AWS Console → Amazon Bedrock
   - Navigate to "Model access" in the left sidebar
   - Request access to Claude models (Anthropic)
   - Wait for approval (usually immediate)

2. **Required IAM Permissions:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "bedrock:InvokeModel",
           "bedrock:InvokeModelWithResponseStream"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

### 4. Run Setup Script

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Windows (Command Prompt):**
```cmd
setup.bat
```

**Manual Setup:**
```bash
npm install
npm start
```

## Available Bedrock Models

### Claude Models (Anthropic)
- `anthropic.claude-3-haiku-20240307-v1:0` (Fast, cost-effective)
- `anthropic.claude-3-sonnet-20240229-v1:0` (Balanced)
- `anthropic.claude-3-opus-20240229-v1:0` (Most capable)

### Llama Models (Meta)
- `meta.llama3-8b-instruct-v1:0`
- `meta.llama3-70b-instruct-v1:0`

### Titan Models (Amazon)
- `amazon.titan-text-express-v1`
- `amazon.titan-text-lite-v1`

## Browser Support

### Fully Supported
- Google Chrome (recommended)
- Microsoft Edge
- Safari (macOS)

### Limited Support
- Firefox (partial Speech API support)

## Troubleshooting

### Common Issues

**"npm is not recognized"**
- Node.js not installed or not in PATH
- Download from nodejs.org and install
- Restart terminal after installation

**"AWS credentials not found"**
- Missing or incorrect .env file
- Copy .env.example to .env
- Add your AWS credentials

**"Model access denied"**
- Bedrock model access not enabled
- Go to AWS Console → Bedrock → Model access
- Request access to Claude models

**"Microphone not working"**
- Browser permission denied
- Click the microphone icon in browser address bar
- Allow microphone access

**"Speech recognition not working"**
- Use Chrome or Edge browser
- Check internet connection
- Ensure microphone is working

### Browser Permissions

The application requires:
- Microphone access for speech recognition
- Internet connection for AI processing

### Performance Tips

1. **Use Chrome** for best speech recognition
2. **Stable internet** for real-time processing
3. **Good microphone** for accurate transcription
4. **Quiet environment** reduces background noise

## Development Mode

For development with auto-restart:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Production Deployment

### Environment Variables
Set these in your production environment:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `BEDROCK_MODEL_ID`
- `PORT`

### Security Considerations
- Use IAM roles instead of access keys when possible
- Implement rate limiting
- Add authentication for production use
- Use HTTPS in production

### Scaling
- Use a load balancer for multiple instances
- Consider Redis for session storage
- Monitor AWS Bedrock quotas and costs

## Cost Considerations

### Bedrock Pricing (approximate)
- Claude 3 Haiku: ~$0.25 per 1M input tokens
- Claude 3 Sonnet: ~$3 per 1M input tokens
- Claude 3 Opus: ~$15 per 1M input tokens

### Cost Optimization
- Use Haiku for most conversations
- Limit conversation history length
- Implement session timeouts
- Monitor usage in AWS console

## Support

1. Check this configuration guide
2. Review the main README.md
3. Check browser console for errors
4. Verify AWS console for Bedrock access
5. Test with different browsers
