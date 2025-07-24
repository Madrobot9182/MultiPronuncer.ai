export interface PracticeData {
  text: string;
  language: string;
}

export interface RecordingState {
  isRecording: boolean;
  hasRecorded: boolean;
  audioBlob?: Blob;
}

export interface AzurePronunciationResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
  words?: WordResult[];
}

export interface WordResult {
  word: string;
  accuracyScore: number;
  errorType?: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
}

export type PracticeStep = 'input' | 'recording' | 'results';