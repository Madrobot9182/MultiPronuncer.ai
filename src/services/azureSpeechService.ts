import { getProsodySupportedLanguages } from "@/constants/languages";
import { AzurePronunciationResult } from "@/types/pronunciation";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

interface AzurePronunciationAssessment {
  AccuracyScore: number;
  FluencyScore: number;
  CompletenessScore: number;
  PronunciationScore: number;
  ProsodyScore?: number; // en-US only
}

interface AzureWordResult {
  Word: string;
  Offset: number;
  Duration: number;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType: "None" | "Omission" | "Insertion" | "Mispronunciation";
  };
}

interface AzureNBestResult {
  Confidence: number;
  Lexical: string;
  ITN: string;
  MaskedITN: string;
  Display: string;
  PronunciationAssessment: AzurePronunciationAssessment;
  Words: AzureWordResult[];
}

interface AzureResponse {
  RecognitionStatus: string;
  Offset: number;
  Duration: number;
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

    this.speechConfig = sdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      region
    );

    this.speechConfig.setProperty(
      sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
      "3000"
    );
    this.speechConfig.setProperty(
      sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs,
      "3000"
    );
    this.speechConfig.outputFormat = sdk.OutputFormat.Detailed;
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
      speechRecognizer = new sdk.SpeechRecognizer(
        this.speechConfig,
        audioConfig
      );

      // Configure pronunciation assessment
      const pronunciationConfig = this.createPronunciationConfig(
        referenceText,
        language
      );
      pronunciationConfig.applyTo(speechRecognizer);

      // Perform recognition
      const result = await this.performRecognition(speechRecognizer);

      // Parse result
      return this.parseResult(result);
    } catch (error) {
      console.error("Pronunciation analysis failed:", error);
      throw error instanceof Error
        ? error
        : new Error("Unknown error occurred");
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

    // More comprehensive audio format validation
    const validTypes = [
      "audio/wav",
      "audio/webm",
      "audio/mp4",
      "audio/mpeg",
      "audio/ogg",
    ];
    const isValidFormat = validTypes.some(
      (type) =>
        audioBlob.type === type || audioBlob.type.includes(type.split("/")[1])
    );

    if (!isValidFormat) {
      console.warn(`Audio format might not be optimal: ${audioBlob.type}`);
    }

    // Check minimum audio duration (at least 500ms for meaningful assessment)
    if (audioBlob.size < 8000) {
      // Rough estimate for very short audio
      console.warn("Audio seems very short, results may not be reliable");
    }
  }

  private createPronunciationConfig(
    referenceText: string,
    language: string
  ): sdk.PronunciationAssessmentConfig {
    const enableProsody = language in getProsodySupportedLanguages();

    const config = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true // Enable miscue detection to catch insertions/omissions
    );

    // Set additional configuration properties
    if (enableProsody) {
      config.enableProsodyAssessment = true;
    }

    return config;
  }

  private async createAudioConfig(audioBlob: Blob): Promise<sdk.AudioConfig> {
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioFormat = audioBlob.type.includes("wav")
      ? sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
      : sdk.AudioStreamFormat.getDefaultInputFormat();

    const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
    pushStream.write(audioBuffer);
    pushStream.close();

    return sdk.AudioConfig.fromStreamInput(pushStream);
  }

  private performRecognition(
    speechRecognizer: sdk.SpeechRecognizer
  ): Promise<sdk.SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      speechRecognizer.recognizeOnceAsync(
        (result) => resolve(result),
        (error) => reject(new Error(`Speech recognition failed: ${error}`))
      );
    });
  }

  private parseResult(
    result: sdk.SpeechRecognitionResult
  ): AzurePronunciationResult {
    // Check recognition status
    if (result.reason === sdk.ResultReason.NoMatch) {
      throw new Error(
        "No speech could be recognized. Please speak more clearly."
      );
    }

    if (result.reason === sdk.ResultReason.Canceled) {
      const cancellation = sdk.CancellationDetails.fromResult(result);
      throw new Error(
        `Recognition cancelled: ${cancellation.reason} - ${cancellation.errorDetails}`
      );
    }

    if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
      throw new Error("Speech recognition failed.");
    }

    // Get the JSON result - this is the correct property
    const jsonResult = result.properties.getProperty(
      sdk.PropertyId.SpeechServiceResponse_JsonResult
    );

    if (!jsonResult) {
      throw new Error("No pronunciation assessment data received.");
    }

    let azureResponse: AzureResponse;
    try {
      azureResponse = JSON.parse(jsonResult);
    } catch (error) {
      throw new Error(
        `Failed to parse pronunciation assessment result. ${error}`
      );
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
    console.log("Assessment scores:", assessment);

    if (assessment.AccuracyScore === 0 && assessment.PronunciationScore > 0) {
      console.warn(
        "AccuracyScore is 0 but other scores exist. This might indicate an issue with audio quality or processing."
      );
    }

    const result: AzurePronunciationResult = {
      accuracyScore: this.roundScore(assessment.AccuracyScore),
      fluencyScore: this.roundScore(assessment.FluencyScore),
      completenessScore: this.roundScore(assessment.CompletenessScore),
      pronunciationScore: this.roundScore(assessment.PronunciationScore),
      words: this.transformWords(bestResult.Words || []),
    };

    // Add prosody score if available (en-US only)
    if (assessment.ProsodyScore !== undefined) {
      result.prosodyScore = this.roundScore(assessment.ProsodyScore);
    }

    return result;
  }

  private transformWords(words: AzureWordResult[]): Array<{
    word: string;
    accuracyScore: number;
    errorType: AzureWordResult["PronunciationAssessment"]["ErrorType"];
  }> {
    console.log("Word-level results:", words);
    return words.map((word) => ({
      word: word.Word,
      accuracyScore: this.roundScore(
        word.PronunciationAssessment.AccuracyScore
      ),
      errorType: word.PronunciationAssessment.ErrorType,
    }));
  }

  private roundScore(score: number): number {
    return Math.round(Math.max(0, Math.min(100, score || 0)) * 100) / 100;
  }

  dispose(): void {
    if (this.speechConfig) {
      this.speechConfig.close();
    }
  }
}

export const azureSpeechService = new AzureSpeechService();
