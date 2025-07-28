import { useState, useRef, useCallback } from 'react';
import { RecordingState } from '@/types/pronunciation';

export const useRecording = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    hasRecorded: false,
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to get the best supported audio format
  const getBestAudioFormat = (): { mimeType: string; fileExtension: string } => {
    // Priority order: WAV > WebM > MP4
    const formats = [
      { mimeType: 'audio/wav', fileExtension: 'wav' },
      { mimeType: 'audio/webm;codecs=pcm', fileExtension: 'webm' },
      { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm' },
      { mimeType: 'audio/mp4', fileExtension: 'mp4' },
    ];

    for (const format of formats) {
      if (MediaRecorder.isTypeSupported(format.mimeType)) {
        console.log(`Using audio format: ${format.mimeType}`);
        return format;
      }
    }

    // Fallback
    console.warn('No preferred audio format supported, using default');
    return { mimeType: 'audio/webm;codecs=opus', fileExtension: 'webm' };
  };

  // Convert WebM to WAV for better Azure compatibility
  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000 // Azure prefers 16kHz
      });

      const fileReader = new FileReader();
      
      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to 16kHz mono if needed
          let processedBuffer = audioBuffer;
          if (audioBuffer.sampleRate !== 16000 || audioBuffer.numberOfChannels !== 1) {
            const offlineContext = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start();
            processedBuffer = await offlineContext.startRendering();
          }

          // Convert AudioBuffer to WAV
          const wavBlob = audioBufferToWav(processedBuffer);
          resolve(wavBlob);
        } catch (error) {
          console.error('Error converting audio:', error);
          // If conversion fails, return original blob
          resolve(webmBlob);
        }
      };

      fileReader.onerror = () => {
        console.error('Error reading audio file');
        resolve(webmBlob); // Return original on error
      };

      fileReader.readAsArrayBuffer(webmBlob);
    });
  };

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Azure's preferred sample rate
          channelCount: 1,   // Mono audio
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true, // Added for better audio quality
        }
      });

      streamRef.current = stream;
      const audioFormat = getBestAudioFormat();
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: audioFormat.mimeType,
        audioBitsPerSecond: 128000 // Higher quality for better recognition
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        
        let audioBlob = new Blob(audioChunksRef.current, {
          type: audioFormat.mimeType
        });

        console.log(`Original audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

        // Convert to WAV if not already WAV for better Azure compatibility
        if (!audioFormat.mimeType.includes('wav')) {
          try {
            console.log('Converting audio to WAV format...');
            audioBlob = await convertToWav(audioBlob);
            console.log(`Converted audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
          } catch (error) {
            console.warn('Audio conversion failed, using original format:', error);
          }
        }

        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          hasRecorded: true,
          audioBlob
        }));

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second for better processing

      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
      }));

    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
    }
  }, [recordingState.isRecording]);

  const resetRecording = useCallback((): void => {
    // Clean up any active recording
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
    }

    // Clean up stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setRecordingState({
      isRecording: false,
      hasRecorded: false,
    });
    audioChunksRef.current = [];
  }, [recordingState.isRecording]);

  return {
    ...recordingState,
    startRecording,
    stopRecording,
    resetRecording,
  };
};

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * 2, true);

  // Convert audio data
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}