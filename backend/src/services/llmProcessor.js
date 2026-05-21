import axios from 'axios';
import OpenAI from 'openai';
import {getProvider} from '../config/llmConfig.js';
import {LLM_MAX_RETRIES,LLM_DEFAULTS} from '../config/constants.js';
import{LLMError} from '../middleware/errorHandler.js';
import Helpers from '../utils/helpers.js';
import logger from '../utils/logger.js';

export default class LLMProcessor {
    constructor(providerName){
        this.provider=getProvider(providerName);
        this.providerName = this.provider.name;

        if(this.providerName==='openai'){
            this.openai= new OpenAI({apiKey:this.provider.apiKey});
        }
    }
    async customizeCV(cvContent, jobDescription, options = {}){
        const{
            strategy = 'smart-match',
            maxTokens= LLM_DEFAULTS.maxTokens,
            temperature = LLM_DEFAULTS.temperature
        }=options;
        logger.info(`Starting CV customization with strategy:${strategy}, provider:${this.providerName}`);
        const prompt =this.buildCustomizationPrompt(cvContent,jobDescription,strategy);
        
        try{
            const result = await Helpers.retry(
                ()=> this.callLLM(prompt, maxTokens,temperature),
                LLM_MAX_RETRIES
            );
            logger.info('CV customization completed successully');
            return this.parseCustomizationResult(result);
        }catch(error){
            logger.error('CV customization failed:',error.message);
            throw new LLMError(
                'Failed to customize CV using LLM',
                {provider: this.providerName,strategy, reason:error.message}
            );
        }
    }
    async analyzeJobDescription(jobDescription) {
    const prompt = [
      {
        role: 'system',
        content: `You are an expert job description analyzer. Extract structured information from job descriptions. Respond ONLY with valid JSON.`
      },
      {
        role: 'user',
        content: `Analyze this job description and extract the following in JSON format:
{
  "roleTitle": "job title",
  "seniority": "entry|mid|senior|lead|executive",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "industry": "industry type",
  "companyType": "startup|enterprise|agency|nonprofit",
  "softSkills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2"]
}

Job Description:
${jobDescription.substring(0, 8000)}`
      }
    ];

    try {
      const result = await Helpers.retry(
        () => this.callLLM(prompt, 2000, 0.3),
        LLM_MAX_RETRIES
      );
      return this.safeJsonParse(result);
    } catch (error) {
      logger.error('Job analysis failed:', error.message);
      // Return basic fallback analysis
      return this.fallbackJobAnalysis(jobDescription);
    }
  }

  /**
   * Build the main customization prompt based on strategy
   */
  buildCustomizationPrompt(cvContent, jobDescription, strategy) {
    const baseSystemPrompt = `You are an expert CV/Resume customization specialist. Your task is to tailor a CV to match a specific job description while maintaining complete factual accuracy. Never invent experiences, skills, or qualifications. Only rephrase, reorder, and emphasize existing content.`;

    const strategyInstructions = {
      'smart-match': `Strategy: Smart Matching
- Identify which CV sections best match the job requirements
- Emphasize relevant skills and experiences
- De-emphasize or shorten less relevant sections
- Keep all factual content intact`,

      'reorder': `Strategy: Reordering
- Reorder experiences to put most relevant ones first
- Reorder skills to prioritize job-matching skills
- Maintain all content, just change order`,

      'rephrase': `Strategy: Rephrasing
- Reword bullet points to use language from the job description
- Add relevant keywords naturally
- Quantify achievements where possible
- Keep all facts accurate`,

      'full': `Strategy: Full Customization
- Combine smart matching, reordering, and rephrasing
- Create the strongest possible alignment with job requirements
- Optimize for both human readers and ATS systems
- Maintain factual accuracy at all times`
    };

    const outputFormat = `Respond with a JSON object containing:
{
  "customizedCV": {
    "header": { "name": "...", "contact": {...} },
    "summary": "tailored professional summary",
    "experience": [
      { "title": "...", "company": "...", "duration": "...", "description": "tailored description" }
    ],
    "skills": ["skill1", "skill2"],
    "education": [...],
    "certifications": [...]
  },
  "changes": [
    { "section": "experience", "change": "description of what changed", "reason": "why it was changed" }
  ],
  "matchScore": 85,
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const cvText = typeof cvContent === 'string'
      ? cvContent
      : JSON.stringify(cvContent, null, 2);

    return [
      {
        role: 'system',
        content: `${baseSystemPrompt}\n\n${strategyInstructions[strategy] || strategyInstructions['smart-match']}`
      },
      {
        role: 'user',
        content: `CUSTOMIZE THIS CV FOR THE FOLLOWING JOB:\n\n${outputFormat}\n\n--- JOB DESCRIPTION ---\n${jobDescription.substring(0, 6000)}\n\n--- CURRENT CV ---\n${cvText.substring(0, 8000)}`
      }
    ];
  }

  /**
   * Call the appropriate LLM provider
   */
  async callLLM(messages, maxTokens, temperature) {
    // Use native OpenAI client for better reliability
    if (this.providerName === 'openai' && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: this.provider.model,
        messages,
        max_tokens: maxTokens,
        temperature
      });
      return response.choices[0]?.message?.content || '';
    }

    // Generic HTTP implementation for other providers
    const url = typeof this.provider.endpoint === 'function'
      ? this.provider.endpoint(this.provider.apiKey)
      : this.provider.endpoint;

    const payload = this.provider.formatPayload(
      messages,
      this.provider.model,
      maxTokens,
      temperature
    );

    const response = await axios.post(url, payload, {
      headers: this.provider.headers(this.provider.apiKey),
      timeout: 60000
    });

    return this.provider.extractResponse(response.data);
  }

  /**
   * Parse and validate LLM customization result
   */
  parseCustomizationResult(result) {
    const parsed = this.safeJsonParse(result);

    // Validate required fields
    if (!parsed.customizedCV) {
      throw new LLMError('LLM response missing customizedCV field');
    }

    return {
      customizedCV: parsed.customizedCV,
      changes: parsed.changes || [],
      matchScore: parsed.matchScore || 0,
      suggestions: parsed.suggestions || [],
      rawResponse: result
    };
  }

  /**
   * Safely parse JSON from LLM response
   */
  safeJsonParse(text) {
    try {
      // Try direct parse first
      return JSON.parse(text);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch {
          // fall through
        }
      }

      // Try finding JSON between first { and last }
      const braceMatch = text.match(/(\{[\s\S]*\})/);
      if (braceMatch) {
        try {
          return JSON.parse(braceMatch[1]);
        } catch {
          // fall through
        }
      }

      logger.warn('Failed to parse JSON from LLM response, using fallback');
      return { customizedCV: { raw: text }, changes: [], matchScore: 0 };
    }
  }

  /**
   * Fallback job analysis when LLM fails
   */
  fallbackJobAnalysis(jobDescription) {
    const text = jobDescription.toLowerCase();

    // Simple keyword extraction
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws',
      'docker', 'kubernetes', 'typescript', 'css', 'html', 'git',
      'agile', 'scrum', 'leadership', 'communication', 'analytics'
    ];

    const foundSkills = commonSkills.filter(skill => text.includes(skill));

    return {
      roleTitle: 'Unknown',
      seniority: 'mid',
      requiredSkills: foundSkills.slice(0, 10),
      preferredSkills: [],
      keyResponsibilities: [],
      industry: 'Unknown',
      companyType: 'unknown',
      softSkills: [],
      keywords: foundSkills,
      _fallback: true
    };
  }
}
