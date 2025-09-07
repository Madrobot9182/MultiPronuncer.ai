import { LanguageOption } from "@/constants/languages";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslationRequest {
  text: string;
  from: string;
  to: string;
}

export interface TranslationResponse {
  translations: Array<{
    text: string;
    to: string;
  }>;
  detectedLanguage?: {
    language: string;
    score: number;
  };
}

export interface AzureTranslatorResponse {
  translations: Array<{
    text: string;
    to: string;
  }>;
  detectedLanguage?: {
    language: string;
    score: number;
  };
}

export interface TranslationState {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  isLoading: boolean;
  error: string | null;
  detectedLanguage?: string;
}

export interface UseTranslationReturn {
  translationState: TranslationState;
  languages: LanguageOption[];
  targetLanguages: LanguageOption[];
  isLoadingLanguages: boolean;
  languagesError: string | null;
  setSourceText: (text: string) => void;
  setSourceLanguage: (language: LanguageOption) => void;
  setTargetLanguage: (language: LanguageOption) => void;
  swapLanguages: () => void;
  clearTranslation: () => void;
  getLanguageByValue: (value: string) => LanguageOption | undefined;
}