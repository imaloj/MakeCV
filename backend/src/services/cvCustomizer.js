import { DocumentParserService } from './documentParser/index.js';
import LLMProcessor from './llmProcessor.js';
import OutputGenerator from './outputGenerator.js';
import FileUtils from '../utils/fileUtils.js';
import Helpers from '../utils/helpers.js';
import { ValidationError, FileError } from '../middleware/errorHandler.js';
import { SUPPORTED_FORMATS, OUTPUT_FORMATS } from '../config/constants.js';
import logger from '../utils/logger.js';

export default class CVCustomizer {
  constructor(options = {}) {
    this.llmProvider = options.llmProvider || process.env.LLM_PROVIDER || 'openai';
    this.llmProcessor = new LLMProcessor(this.llmProvider);
  }
  /**
   * Main customization workflow
   */
  async customize(filePath, fileType, jobDescription, options = {}) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}`;

    logger.info(`[${requestId}] Starting customization workflow`, {
      fileType,
      strategy: options.strategy,
      outputFormat: options.outputFormat
    });

    try {
      // Step 1: Validate inputs
      this.validateInputs(filePath, fileType, jobDescription);

      // Step 2: Parse CV document
      const parsedCV = await DocumentParserService.parse(filePath, fileType);

      // Step 3: Analyze job description (cached for potential reuse)
      const jobAnalysis = await this.llmProcessor.analyzeJobDescription(jobDescription);

      // Step 4: Customize CV via LLM
      const customizationResult = await this.llmProcessor.customizeCV(
        parsedCV,
        jobDescription,
        options
      );

      // Step 5: Generate output file
      const outputFile = await OutputGenerator.generate(
        customizationResult.customizedCV,
        options.outputFormat || OUTPUT_FORMATS.DOCX,
        requestId
      );

      const duration = Date.now() - startTime;
      logger.info(`[${requestId}] Customization completed in ${duration}ms`);

      return {
        success: true,
        requestId,
        outputFile,
        outputFormat: options.outputFormat || OUTPUT_FORMATS.DOCX,
        changes: customizationResult.changes,
        matchScore: customizationResult.matchScore,
        suggestions: customizationResult.suggestions,
        jobAnalysis,
        duration
      };
    } catch (error) {
      logger.error(`[${requestId}] Customization failed:`, error.message);
      throw error;
    }
  }
  async customizePreview(filePath, fileType, jobDescription, options = {}) {
    this.validateInputs(filePath, fileType, jobDescription);

    const parsedCV = await DocumentParserService.parse(filePath, fileType);
    const result = await this.llmProcessor.customizeCV(
      parsedCV,
      jobDescription,
      { ...options, maxTokens: 2000 }
    );

    return {
      success: true,
      preview: result.customizedCV,
      changes: result.changes,
      matchScore: result.matchScore,
      suggestions: result.suggestions
    };
  }
  validateInputs(filePath, fileType, jobDescription) {
    if (!filePath) {
      throw new FileError('No file path provided');
    }

    if (!SUPPORTED_FORMATS.includes(fileType.toLowerCase())) {
      throw new ValidationError(
        `Unsupported file format: ${fileType}`,
        { supportedFormats: SUPPORTED_FORMATS }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      throw new ValidationError(
        'Job description must be at least 10 characters',
        { field: 'jobDescription' }
      );
    }

    if (jobDescription.length > 20000) {
      throw new ValidationError(
        'Job description must not exceed 20000 characters',
        { field: 'jobDescription', maxLength: 20000 }
      );
    }
  }
}