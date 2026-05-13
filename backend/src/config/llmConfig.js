import * as env from './env.js';

const LLM_PROVIDERS = {
  openai: {
    name: 'openai',
    apiKey: env.OPENAI_API_KEY,
    model: 'gpt-4o',
    fallbackModel: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatPayload: (messages, model, maxTokens, temperature) => ({
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    }),
    extractResponse: (data) => data.choices?.[0]?.message?.content || ''
  },

  anthropic: {
    name: 'anthropic',
    apiKey: env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229',
    fallbackModel: 'claude-3-haiku-20240307',
    endpoint: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }),
    formatPayload: (messages, model, maxTokens, temperature) => ({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: messages.map(m => ({
        role: m.role === 'system' ? 'assistant' : m.role,
        content: m.content
      }))
    }),
    extractResponse: (data) => data.content?.[0]?.text || ''
  },

  google: {
    name: 'google',
    apiKey: env.GOOGLE_API_KEY,
    model: 'gemini-1.5-pro',
    fallbackModel: 'gemini-1.5-flash',
    endpoint: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    headers: () => ({
      'Content-Type': 'application/json'
    }),
    formatPayload: (messages, model, maxTokens, temperature) => {
      const systemMsg = messages.find(m => m.role === 'system');
      const userMsgs = messages.filter(m => m.role !== 'system');
      return {
        contents: userMsgs.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: systemMsg ? `${systemMsg.content}\n\n${m.content}` : m.content }]
        })),
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature
        }
      };
    },
    extractResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }
};

export const getProvider = (providerName = env.LLM_PROVIDER) => {
  const provider = LLM_PROVIDERS[providerName];
  if (!provider) {
    throw new Error(`Unknown LLM provider: ${providerName}`);
  }
  return provider;
};

export const getAvailableProviders = () => Object.keys(LLM_PROVIDERS);
export { LLM_PROVIDERS };