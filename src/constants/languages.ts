import { LanguageOption } from '@/types/language';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'de-DE', label: 'German (Germany)' },
  { value: 'it-IT', label: 'Italian (Italy)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja-JP', label: 'Japanese (Japan)' },
  { value: 'ko-KR', label: 'Korean (South Korea)' },
  { value: 'zh-CN', label: 'Chinese (Mandarin)' }
];

export const MAX_TEXT_CHARACTERS = 500;

export const RECORDING_CONFIG = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
} as const;