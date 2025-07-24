import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AzurePronunciationResult } from '@/types/pronunciation';

interface AzureConfig {
  subscriptionKey: string;
  region: string;
  endpoint: string;
}

interface PronunciationAssessmentParams {
  ReferenceText: string;
  GradingSystem: 'HundredMark';
  Dimension: 'Comprehensive';
  EnableMiscue: boolean;
}

interface AzureWordResult {
  Word: string;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
  };
}

interface AzureResponse {
  NBest: Array<{
    PronunciationAssessment: {
      AccuracyScore: number;
      FluencyScore: number;
      CompletenessScore: number;
      PronunciationScore: number;
    };
    Words: AzureWordResult[];
  }>;
}

class AzureSpeechService {
  private config: AzureConfig;
  private axiosInstance: AxiosInstance;

  constructor() {
    // Validate environment variables
    const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!subscriptionKey || !region) {
      throw new Error(
        'Missing Azure Speech Service configuration. Please check your .env.local file for NEXT_PUBLIC_AZURE_SPEECH_KEY and NEXT_PUBLIC_AZURE_SPEECH_REGION'
      );
    }

    this.config = {
      subscriptionKey,
      region,
      endpoint: `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`
    };

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.config.endpoint,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for logging (optional)
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('Azure Speech API Request:', {
          url: config.url,
          method: config.method,
          headers: { ...config.headers, 'Ocp-Apim-Subscription-Key': '[HIDDEN]' }
        });
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('Azure Speech API Response:', {
          status: response.status,
          statusText: response.statusText
        });
        return response;
      },
      (error) => {
        console.error('Azure Speech API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  async analyzePronunciation(
    audioBlob: Blob,
    referenceText: string,
    language: string
  ): Promise<AzurePronunciationResult> {
    try {
      // Validate inputs
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Invalid audio data provided');
      }

      if (!referenceText.trim()) {
        throw new Error('Reference text is required');
      }

      if (!this.isValidAudioFormat(audioBlob)) {
        console.warn(`Audio format ${audioBlob.type} may not be optimal. Supported formats: WAV, WebM, MP4`);
      }

      // Convert blob to ArrayBuffer
      const audioBuffer = await audioBlob.arrayBuffer();
      
      // Prepare pronunciation assessment parameters
      const pronunciationAssessmentParams: PronunciationAssessmentParams = {
        ReferenceText: referenceText,
        GradingSystem: 'HundredMark',
        Dimension: 'Comprehensive',
        EnableMiscue: false
      };

      // Prepare request parameters
      const params = {
        language: language,
        format: 'detailed',
        'pronunciation-assessment': JSON.stringify(pronunciationAssessmentParams)
      };

      // Make the API call
      const response: AxiosResponse<AzureResponse> = await this.axiosInstance.post(
        '', // Using base URL from axios instance
        audioBuffer,
        {
          params,
          headers: {
            'Content-Type': this.getContentType(audioBlob),
          },
          // Don't transform the request data
          transformRequest: [(data) => data],
        }
      );

      // Transform and return the result
      return this.transformAzureResponse(response.data);
      
    } catch (error) {
      console.error('Pronunciation analysis failed:', error);
      throw error;
    }
  }

  private handleApiError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 401:
          return new Error('Invalid Azure Speech Service subscription key. Please check your API key.');
        case 403:
          return new Error('Access denied. Please check your Azure Speech Service permissions.');
        case 429:
          return new Error('Too many requests. Please wait a moment and try again.');
        case 400:
          return new Error(`Bad request: ${message}. Please check your audio format and reference text.`);
        case 500:
          return new Error('Azure Speech Service is temporarily unavailable. Please try again later.');
        default:
          return new Error(`Azure Speech Service error (${status}): ${message}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No response from Azure Speech Service. Please check your internet connection.');
    } else {
      // Something else happened
      return new Error(`Request setup error: ${error.message}`);
    }
  }

  private transformAzureResponse(azureResponse: AzureResponse): AzurePronunciationResult {
    const nbest = azureResponse.NBest?.[0];
    
    if (!nbest?.PronunciationAssessment) {
      throw new Error('Invalid response format from Azure Speech Service');
    }

    const assessment = nbest.PronunciationAssessment;

    return {
      accuracyScore: Math.round(assessment.AccuracyScore * 100) / 100,
      fluencyScore: Math.round(assessment.FluencyScore * 100) / 100,
      completenessScore: Math.round(assessment.CompletenessScore * 100) / 100,
      pronunciationScore: Math.round(assessment.PronunciationScore * 100) / 100,
      words: nbest.Words?.map((word) => ({
        word: word.Word,
        accuracyScore: Math.round(word.PronunciationAssessment.AccuracyScore * 100) / 100,
        errorType: word.PronunciationAssessment.ErrorType || 'None',
      })) || []
    };
  }

  private getContentType(audioBlob: Blob): string {
    // Map blob types to Azure-compatible content types
    const typeMapping: Record<string, string> = {
      'audio/wav': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'audio/webm': 'audio/webm; codecs=opus',
      'audio/mp4': 'audio/mp4',
      'audio/mpeg': 'audio/mpeg',
    };

    // Find matching type or use a default
    const matchingType = Object.keys(typeMapping).find(type => 
      audioBlob.type.includes(type.split('/')[1])
    );

    return matchingType ? typeMapping[matchingType] : typeMapping['audio/wav'];
  }

  isValidAudioFormat(audioBlob: Blob): boolean {
    const validTypes = ['wav', 'webm', 'mp4', 'mpeg'];
    return validTypes.some(type => audioBlob.type.includes(type));
  }

  getAvailableLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 
      'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN'
    ];
  }

  // Utility method to test connection
  async testConnection(): Promise<boolean> {
    try {
      // Create a minimal test request
      const testBlob = new Blob(['test'], { type: 'audio/wav' });
      await this.analyzePronunciation(testBlob, 'test', 'en-US');
      return true;
    } catch (error) {
      console.error('Azure Speech Service connection test failed:', error);
      return false;
    }
  }

  // Get service info
  getServiceInfo(): { region: string; hasKey: boolean } {
    return {
      region: this.config.region,
      hasKey: !!this.config.subscriptionKey
    };
  }
}

// Export singleton instance
export const azureSpeechService = new AzureSpeechService();