import { useState, useRef, useCallback } from "react";
import { RecordingState } from "@/types/pronunciation";
import { FFmpeg } from "@ffmpeg/ffmpeg";

export const useRecording = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    hasRecorded: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const ffmpeg = new FFmpeg();

  // Function to get the best supported audio format
  const getBestAudioFormat = (): {
    mimeType: string;
    fileExtension: string;
  } => {
    // Priority order: WAV > WebM > MP4
    const formats = [
      { mimeType: "audio/wav", fileExtension: "wav" },
      { mimeType: "audio/webm;codecs=opus", fileExtension: "webm" },
      { mimeType: "audio/webm;codecs=pcm", fileExtension: "webm" },
      { mimeType: "audio/mp4", fileExtension: "mp4" },
    ];
    
    for (const format of formats) {
      if (MediaRecorder.isTypeSupported(format.mimeType)) {
        console.log(`Using audio format: ${format.mimeType}`);
        return format;
      }
    }

    throw Error("No preferred audio format supported by MediaRecorder in your browser");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Azure's preferred sample rate
          channelCount: 1, // Mono audio
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true, // Added for better audio quality
        },
      });

      streamRef.current = stream;
      const audioFormat = getBestAudioFormat();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: audioFormat.mimeType,
        audioBitsPerSecond: 128000, // Higher quality for better recognition
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, processing audio...");

        let audioBlob = new Blob(audioChunksRef.current, {
          type: audioFormat.mimeType,
        });

        console.log(
          `Original audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`
        );

        // Convert to WAV if not already WAV for better Azure compatibility
        if (!audioFormat.mimeType.includes("wav")) {
          try {
            console.log("Converting audio to WAV format...");

            await ffmpeg.load();
            await ffmpeg.writeFile(
              "input.webm",
              new Uint8Array(await audioBlob.arrayBuffer())
            );
            await ffmpeg.exec([
              "-i",
              "input.webm",
              "-ar",
              "16000",
              "-ac",
              "1",
              "output.wav",
            ]);
            const data = await ffmpeg.readFile("output.wav");
            const wavBlob = new Blob([data as BlobPart], { type: "audio/wav" });
            audioBlob = wavBlob;
            console.log(
              `Converted audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`
            );
          } catch (error) {
            console.warn(
              "Audio conversion failed, using original format:",
              error
            );
          }
        }

        setRecordingState((prev) => ({
          ...prev,
          isRecording: false,
          hasRecorded: true,
          audioBlob,
        }));

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second for better processing

      setRecordingState((prev) => ({
        ...prev,
        isRecording: true,
      }));
    } catch (error) {
      console.error("Error starting recording:", error);
      throw new Error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      console.log("Stopping recording...");
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
      streamRef.current.getTracks().forEach((track) => track.stop());
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