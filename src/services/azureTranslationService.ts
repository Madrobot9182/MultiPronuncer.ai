// services/azureTranslationService.ts
import TextTranslationClient, {
  TranslatorCredential,
  isUnexpected,
  TranslateParameters,
  GetSupportedLanguagesParameters,
  GetSupportedLanguagesResultOutput,
} from "@azure-rest/ai-translation-text";
import { TranslationRequest, TranslationResponse } from "../types/translation";
import { TRANSLATION_LANGUAGES } from "@/constants/languages";

class AzureTranslationService {
  private client: ReturnType<typeof TextTranslationClient>;
  private cachedLanguages: GetSupportedLanguagesResultOutput | null = null;
  private defaultLanguages = TRANSLATION_LANGUAGES;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_AZURE_TRANSLATOR_KEY || "";
    const region = process.env.NEXT_PUBLIC_AZURE_TRANSLATOR_REGION || "";
    const endpoint =
      process.env.NEXT_PUBLIC_AZURE_TRANSLATOR_ENDPOINT ||
      "https://api.cognitive.microsofttranslator.com";

    if (!apiKey) {
      throw new Error("Azure Translator API key is required");
    }

    const credential: TranslatorCredential = {
      key: apiKey,
      region: region,
    };

    this.client = TextTranslationClient(credential, {
      endpoint: endpoint,
    });
  }

  async translateText({
    text,
    from,
    to,
  }: TranslationRequest): Promise<TranslationResponse> {
    if (!text.trim()) {
      return { translations: [{ text: "", to }] };
    }

    try {
      const translateParameters: TranslateParameters = {
        body: [{ text }],
        queryParameters: {
          to: to,
          ...(from !== "auto" && { from: from }),
        },
      };

      const response = await this.client
        .path("/translate")
        .post(translateParameters);

      if (isUnexpected(response)) {
        throw new Error(
          `Translation failed: ${response.status} ${response.body?.error?.message || "Unknown error"}`
        );
      }

      const result = response.body;

      if (!result || result.length === 0) {
        throw new Error("No translation data received");
      }

      const firstResult = result[0];

      return {
        translations: firstResult.translations || [],
        detectedLanguage: firstResult.detectedLanguage
          ? {
              language: firstResult.detectedLanguage.language,
              score: firstResult.detectedLanguage.score,
            }
          : undefined,
      };
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Translation failed"
      );
    }
  }

  async detectLanguage(text: string): Promise<string> {
    if (!text.trim()) return "unknown";

    try {
      const detectParameters: TranslateParameters = {
        body: [{ text }],
        queryParameters: {
          to: "en", // We need to specify a target language, using English as default
        },
      };

      const response = await this.client
        .path("/translate")
        .post(detectParameters);

      if (isUnexpected(response)) {
        throw new Error(`Language detection failed: ${response.status}`);
      }

      const result = response.body;

      if (!result || result.length === 0 || !result[0].detectedLanguage) {
        return "unknown";
      }

      return result[0].detectedLanguage.language || "unknown";
    } catch (error) {
      console.error("Language detection error:", error);
      return "unknown";
    }
  }

  async getSupportedLanguages() {
    try {
      // Cache languages to avoid repeated API calls
      if (this.cachedLanguages) {
        return this.cachedLanguages.translation || this.defaultLanguages;
      }

      const languagesParameters: GetSupportedLanguagesParameters = {
        queryParameters: {
          scope: "translation",
        },
      };

      const response = await this.client
        .path("/languages")
        .get(languagesParameters);

      if (isUnexpected(response)) {
        throw new Error(`Failed to fetch languages: ${response.status}`);
      }

      this.cachedLanguages = response.body;
      return response.body.translation || this.defaultLanguages;
    } catch (error) {
      console.error("Error fetching supported languages:", error);
      // Return default languages if SDK call fails
      return this.defaultLanguages;
    }
  }

  // Cleanup method to dispose of client resources
  dispose() {
    // The REST client doesn't require explicit disposal in current version
    // but this method is here for future compatibility
  }
}

export const azureTranslationService = new AzureTranslationService();
