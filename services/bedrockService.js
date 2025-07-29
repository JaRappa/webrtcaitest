const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class BedrockService {
  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
    this.conversationHistory = [];
    this.systemPrompt = "You are DrVibe, a helpful and engaging AI assistant. Keep your responses conversational, natural, and concise as this is a voice conversation. Respond as if you're having a friendly chat.";
  }

  async generateResponse(userMessage) {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Prepare the prompt for Claude
      const messages = [
        {
          role: 'user',
          content: this.buildConversationPrompt()
        }
      ];

      const input = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          messages: messages,
          system: this.systemPrompt
        }),
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);
      
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const aiResponse = responseBody.content[0].text;

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // Keep conversation history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return aiResponse;

    } catch (error) {
      console.error('Error calling Bedrock:', error);
      
      // Fallback response
      return "I'm sorry, I'm having trouble processing your request right now. Could you please try again?";
    }
  }

  buildConversationPrompt() {
    let prompt = "";
    
    for (const message of this.conversationHistory) {
      if (message.role === 'user') {
        prompt += `Human: ${message.content}\n\n`;
      } else {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    return prompt.trim();
  }

  resetConversation() {
    this.conversationHistory = [];
    console.log('Conversation history reset');
  }

  getConversationHistory() {
    return this.conversationHistory;
  }
}

module.exports = BedrockService;
