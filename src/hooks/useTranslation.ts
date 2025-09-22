// hooks/useTranslation.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { TranslationState, UseTranslationReturn } from '../types/translation';
import { azureTranslationService } from '../services/azureTranslationService';
import { LanguageOption, TRANSLATION_LANGUAGES } from '@/constants/languages';
import { TranslationLanguageOutput } from '@azure-rest/ai-translation-text';

const DEBOUNCE_DELAY = 500; // milliseconds

export const useTranslation = (): UseTranslationReturn => {
  const [translationState, setTranslationState] = useState<TranslationState>({
    sourceText: '',
    translatedText: '',
    sourceLanguage: 'auto',
    targetLanguage: 'en',
    isLoading: false,
    error: null,
    detectedLanguage: undefined,
  });

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [languagesError, setLanguagesError] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout>(null);
  const abortController = useRef<AbortController>(null);

  // Load supported languages on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setIsLoadingLanguages(true);
        setLanguagesError(null);
        
        const supportedLanguages = await azureTranslationService.getSupportedLanguages();
        
        // Convert API response to LanguageOption array and sort by label
        const languageOptions: LanguageOption[] = [
          { value: 'auto', label: 'Detect Language' },
          ...Object.entries(supportedLanguages)
            .map(([code, info]: [string, TranslationLanguageOutput]) => ({
              value: code,
              label: info.name,
              region: info.nativeName !== info.name ? info.nativeName : undefined,
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
        ];
        
        setLanguages(languageOptions);
      } catch (err) {
        setLanguagesError(err instanceof Error ? err.message : 'Failed to fetch languages');
        
        // Fallback to default languages
        const defaultLanguages: LanguageOption[] = TRANSLATION_LANGUAGES;
        
        setLanguages(defaultLanguages);
      } finally {
        setIsLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, []);

  const performTranslation = useCallback(async (text: string, from: string, to: string) => {
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Create new abort controller
    abortController.current = new AbortController();

    if (!text.trim()) {
      setTranslationState(prev => ({
        ...prev,
        translatedText: '',
        isLoading: false,
        error: null,
        detectedLanguage: undefined,
      }));
      return;
    }

    setTranslationState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await azureTranslationService.translateText({
        text,
        from,
        to,
      });

      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        return;
      }

      setTranslationState(prev => ({
        ...prev,
        translatedText: result.translations[0]?.text || '',
        detectedLanguage: result.detectedLanguage?.language,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      // Don't set error if request was aborted
      if (!abortController.current?.signal.aborted) {
        setTranslationState(prev => ({
          ...prev,
          translatedText: '',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Translation failed',
        }));
      }
    }
  }, []);

  // Debounced translation effect
  useEffect(() => {
    const { sourceText, sourceLanguage, targetLanguage } = translationState;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (sourceText && sourceLanguage !== targetLanguage) {
        performTranslation(sourceText, sourceLanguage, targetLanguage);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [translationState.sourceText, translationState.sourceLanguage, translationState.targetLanguage]);

  const setSourceText = useCallback((text: string) => {
    setTranslationState(prev => ({ ...prev, sourceText: text }));
  }, []);

  const setSourceLanguage = useCallback((language: LanguageOption) => {
    setTranslationState(prev => ({ ...prev, sourceLanguage: stripLangHyphen(language.value) }));
  }, []);

  const setTargetLanguage = useCallback((language: LanguageOption) => {
    setTranslationState(prev => ({ ...prev, targetLanguage: stripLangHyphen(language.value) }));
  }, []);

  const swapLanguages = useCallback(() => {
    setTranslationState(prev => {
      const newSourceLang = prev.targetLanguage;
      const newTargetLang = prev.detectedLanguage || prev.sourceLanguage === 'auto' ? 'en' : prev.sourceLanguage;
      
      return {
        ...prev,
        sourceLanguage: newSourceLang,
        targetLanguage: newTargetLang,
        sourceText: prev.translatedText,
        translatedText: prev.sourceText,
        detectedLanguage: undefined,
      };
    });
  }, []);

  const clearTranslation = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    setTranslationState({
      sourceText: '',
      translatedText: '',
      sourceLanguage: 'auto',
      targetLanguage: 'en',
      isLoading: false,
      error: null,
      detectedLanguage: undefined,
    });
  }, []);

  const getLanguageByValue = useCallback((value: string): LanguageOption | undefined => {
    return languages.find(lang => lang.value === value);
  }, [languages]);

  const targetLanguages = languages.filter(lang => lang.value !== 'auto');

  function stripLangHyphen(label: string) {
    const index = label.indexOf('-');
    if (index === -1) return label;
    else return label.substring(0, index);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    translationState,
    languages,
    targetLanguages,
    isLoadingLanguages,
    languagesError,
    setSourceText,
    setSourceLanguage,
    setTargetLanguage,
    swapLanguages,
    clearTranslation,
    getLanguageByValue,
  };
};