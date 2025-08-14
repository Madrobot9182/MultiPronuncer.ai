import {
  Box,
  Button,
  HStack,
  IconButton,
  Progress,
  Text,
} from "@chakra-ui/react";
import { FaPlay, FaPause, FaDownload } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useColorMode } from "../color-mode";
import { ProgressLabel, ProgressRoot } from "../progress";

interface AudioPlayerProps {
  audioBlob: Blob;
  filename?: string;
}

export default function AudioPlayer({ audioBlob, filename="multipronuncer-recording" }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { colorMode } = useColorMode();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      });
      audio.addEventListener("ended", () => {
        setPlaying(false);
      });
    }
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (playing) {
        audio.pause();
      } else {
        audio.play();
      }
      setPlaying(!playing);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const progress = parseInt(e.target.value);
      audio.currentTime = (progress / 100) * audio.duration;
      setProgress(progress);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(audioBlob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box w="100%">
      <audio ref={audioRef} src={audioUrl ?? undefined} />
      <HStack>
        <HStack gap={2}>
          <IconButton
            aria-label={playing ? "Pause" : "Play"}
            onClick={handlePlayPause}
            size="sm"
            rounded="full"
          >
            {playing ? <FaPause /> : <FaPlay />}
          </IconButton>
          <Text fontSize="sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </HStack>
        <Box flexGrow={1} flexBasis={0}>
          <ProgressRoot
            value={progress}
            max={100}
            w="100%"
            height="10px"
            shape="full"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const progress = (x / rect.width) * 100;
              handleSeek({ target: { value: progress.toString() } } as any);
            }}
          >
            <Progress.Track
              bg={colorMode === "light" ? "gray.200" : "gray.600"}
              borderRadius="full"
            >
              <Progress.Range
                bg={colorMode === "light" ? "blue.500" : "blue.300"}
              />
            </Progress.Track>
          </ProgressRoot>
        </Box>
        <IconButton onClick={handleDownload} size="sm" rounded="full">
          <FaDownload />
        </IconButton>
      </HStack>
    </Box>
  );
}
