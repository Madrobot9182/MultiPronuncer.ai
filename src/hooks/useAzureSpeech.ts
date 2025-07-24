import { useState } from 'react';
import { PracticeData, AzurePronunciationResult } from '@/types/pronunciation';
import { azureSpeechService } from '@/services/azureSpeechService';

export const useAzureSpeech = () => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AzurePronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzePronunciation = async (
    audioBlob: Blob,
    practiceData: PracticeData
  ): Promise<void> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysisResult = await azureSpeechService.analyzePronunciation(
        audioBlob,
        practiceData.text,
        practiceData.language
      );
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('Pronunciation analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = (): void => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return {
    isAnalyzing,
    result,
    error,
    analyzePronunciation,
    resetAnalysis,
  };
};