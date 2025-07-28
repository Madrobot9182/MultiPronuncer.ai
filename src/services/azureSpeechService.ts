// src/services/azureSpeechService.ts
import { AzurePronunciationResult } from "@/types/pronunciation";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

interface AzurePronunciationAssessment {
  AccuracyScore: number;
  FluencyScore: number;
  CompletenessScore: number;
  PronunciationScore: number;
}

interface AzureWordResult {
  Word: string;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType: "None" | "Omission" | "Insertion" | "Mispronunciation";
  };
}

interface AzureNBestResult {
  Confidence: number;
  Display: string;
  PronunciationAssessment: AzurePronunciationAssessment;
  Words: AzureWordResult[];
}

interface AzureResponse {
  RecognitionStatus: string;
  DisplayText: string;
  NBest: AzureNBestResult[];
}

class AzureSpeechService {
  private speechConfig: sdk.SpeechConfig;

  constructor() {
    const subscriptionKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!subscriptionKey || !region) {
      throw new Error(
        "Azure Speech Service credentials not found. Please check your environment variables."
      );
    }

    this.speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
    this.speechConfig.speechRecognitionLanguage = "en-US";
  }

  async analyzePronunciation(
    audioBlob: Blob,
    referenceText: string,
    language: string = "en-US"
  ): Promise<AzurePronunciationResult> {
    let speechRecognizer: sdk.SpeechRecognizer | null = null;

    try {
      this.validateInputs(audioBlob, referenceText);
      
      console.log("Starting pronunciation analysis:", {
        audioSize: audioBlob.size,
        audioType: audioBlob.type,
        referenceText,
        language,
      });

      // Set language
      this.speechConfig.speechRecognitionLanguage = language;

      // Create audio config
      const audioConfig = await this.createAudioConfig(audioBlob);

      // Create speech recognizer
      speechRecognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);

      // Configure pronunciation assessment
      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        false // Disable miscue detection for better accuracy
      );
      pronunciationConfig.applyTo(speechRecognizer);

      // Perform recognition
      const result = await this.performRecognition(speechRecognizer);
      
      // Parse result
      return this.parseResult(result);

    } catch (error) {
      console.error("Pronunciation analysis failed:", error);
      throw error instanceof Error ? error : new Error("Unknown error occurred");
    } finally {
      // Cleanup
      if (speechRecognizer) {
        speechRecognizer.close();
      }
    }
  }

  private validateInputs(audioBlob: Blob, referenceText: string): void {
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error("Invalid audio data provided");
    }

    if (!referenceText.trim()) {
      throw new Error("Reference text is required");
    }

    const validTypes = ["wav", "webm", "mp4", "mpeg"];
    const isValidFormat = validTypes.some(type => audioBlob.type.includes(type));
    
    if (!isValidFormat) {
      throw new Error(`Unsupported audio format: ${audioBlob.type}`);
    }
  }

  private async createAudioConfig(audioBlob: Blob): Promise<sdk.AudioConfig> {
    const audioBuffer = await audioBlob.arrayBuffer();
    
    // Create audio format based on blob type
    const audioFormat = audioBlob.type.includes('wav') 
      ? sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
      : sdk.AudioStreamFormat.getDefaultInputFormat();

    const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
    pushStream.write(audioBuffer);
    pushStream.close();

    return sdk.AudioConfig.fromStreamInput(pushStream);
  }

  private performRecognition(speechRecognizer: sdk.SpeechRecognizer): Promise<sdk.SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      speechRecognizer.recognizeOnceAsync(
        (result) => resolve(result),
        (error) => reject(new Error(`Speech recognition failed: ${error}`))
      );
    });
  }

  private parseResult(result: sdk.SpeechRecognitionResult): AzurePronunciationResult {
    // Check recognition status
    if (result.reason === sdk.ResultReason.NoMatch) {
      throw new Error("No speech could be recognized. Please speak more clearly.");
    }

    if (result.reason === sdk.ResultReason.Canceled) {
      const cancellation = sdk.CancellationDetails.fromResult(result);
      throw new Error(`Recognition cancelled: ${cancellation.reason} - ${cancellation.errorDetails}`);
    }

    if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
      throw new Error("Speech recognition failed.");
    }

    // Get the JSON result - this is the correct property
    const jsonResult = result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult);
    
    if (!jsonResult) {
      throw new Error("No pronunciation assessment data received.");
    }

    let azureResponse: AzureResponse;
    try {
      azureResponse = JSON.parse(jsonResult);
    } catch (error) {
      throw new Error(`Failed to parse pronunciation assessment result. ${error}`);
    }

    return this.transformResponse(azureResponse);
  }

  private transformResponse(response: AzureResponse): AzurePronunciationResult {
    console.log("Azure response:", response);

    if (!response.NBest || response.NBest.length === 0) {
      throw new Error("No pronunciation assessment results received.");
    }

    const bestResult = response.NBest[0];
    
    if (!bestResult.PronunciationAssessment) {
      throw new Error("Pronunciation assessment data missing from response.");
    }

    const assessment = bestResult.PronunciationAssessment;
    console.log("Pronunciation scores:", assessment);

    return {
      accuracyScore: this.roundScore(assessment.AccuracyScore),
      fluencyScore: this.roundScore(assessment.FluencyScore),
      completenessScore: this.roundScore(assessment.CompletenessScore),
      pronunciationScore: this.roundScore(assessment.PronunciationScore),
      words: this.transformWords(bestResult.Words || []),
    };
  }

  private transformWords(words: AzureWordResult[]): Array<{
    word: string;
    accuracyScore: number;
    errorType: AzureWordResult["PronunciationAssessment"]["ErrorType"];
  }> {
    return words.map(word => ({
      word: word.Word,
      accuracyScore: this.roundScore(word.PronunciationAssessment.AccuracyScore),
      errorType: word.PronunciationAssessment.ErrorType,
    }));
  }

  private roundScore(score: number): number {
    return Math.round(Math.max(0, Math.min(100, score || 0)) * 100) / 100;
  }

  getAvailableLanguages(): string[] {
    return [
      "en-US", "en-GB", "en-AU", "en-CA",
      "es-ES", "es-MX", "es-AR",
      "fr-FR", "fr-CA",
      "de-DE", "de-AT",
      "it-IT",
      "pt-BR", "pt-PT",
      "ja-JP",
      "ko-KR",
      "zh-CN", "zh-TW",
      "ru-RU",
      "ar-SA",
      "hi-IN"
    ];
  }

  dispose(): void {
    if (this.speechConfig) {
      this.speechConfig.close();
    }
  }
}

export const azureSpeechService = new AzureSpeechService();