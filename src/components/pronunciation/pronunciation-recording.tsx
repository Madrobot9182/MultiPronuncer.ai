import React from "react";
import {
  VStack,
  Box,
  Text,
  HStack,
  Flex,
  IconButton,
  Heading,
  Badge,
  Center,
  Button,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaArrowRotateLeft,
} from "react-icons/fa6";
import { PracticeData } from "@/types/pronunciation";
import { useRecording } from "@/hooks/useRecording";
import { useAzureSpeech } from "@/hooks/useAzureSpeech";
import { LANGUAGE_OPTIONS } from "@/constants/languages";
import { useColorModeValue } from "../ui/color-mode";

interface RecordingComponentProps {
  practiceData: PracticeData;
  onStartOver: () => void;
}

export default function RecordingComponent({
  practiceData,
  onStartOver,
}: RecordingComponentProps) {
  const recording = useRecording();
  const azureSpeech = useAzureSpeech();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const selectedLanguageLabel =
    LANGUAGE_OPTIONS.find((lang) => lang.value === practiceData.language)
      ?.label || practiceData.language;

  const handleRecordingToggle = async (): Promise<void> => {
    try {
      if (recording.isRecording) {
        recording.stopRecording();
      } else {
        await recording.startRecording();
      }
    } catch (error) {
      toaster.create({
        title: "Recording Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to access microphone",
        duration: 5000,
        closable: true,
      });
    }
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!recording.audioBlob) return;

    try {
      await azureSpeech.analyzePronunciation(recording.audioBlob, practiceData);
      toaster.create({
        title: "Analysis Complete",
        description: "Your pronunciation has been analyzed!",
        duration: 3000,
        closable: true,
      });
    } catch (error) {
      toaster.create({
        title: "Analysis Error",
        description: "Failed to analyze pronunciation. Please try again.",
        duration: 5000,
        closable: true,
      });
    }
  };

  return (
    <Box
      w="100%"
      p={6}
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack gap={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="md" color={textColor}>
            Practice Recording
          </Heading>
          <HStack>
            <Badge colorScheme="blue" variant="subtle">
              {selectedLanguageLabel}
            </Badge>
            <Button size="sm" variant="ghost" onClick={onStartOver}>
              <FaArrowRotateLeft size={16} /> Start Over
            </Button>
          </HStack>
        </Flex>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={3} color={textColor}>
            Read this text aloud:
          </Text>
          <Box
            p={4}
            bg={useColorModeValue("gray.50", "gray.700")}
            borderRadius="md"
            border="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.600")}
          >
            <Text fontSize="lg" lineHeight="1.6">
              {practiceData.text}
            </Text>
          </Box>
        </Box>

        <VStack gap={4}>
          <Center>
            <IconButton
              aria-label={
                recording.isRecording ? "Stop recording" : "Start recording"
              }
              size="xl"
              colorScheme={recording.isRecording ? "red" : "blue"}
              variant={recording.isRecording ? "solid" : "outline"}
              rounded="full"
              onClick={handleRecordingToggle}
              _hover={{
                transform: "scale(1.05)",
              }}
              transition="all 0.2s"
            >
              {recording.isRecording ? (
                <FaMicrophoneSlash size={32} />
              ) : (
                <FaMicrophone size={32} />
              )}{" "}
            </IconButton>
          </Center>

          <Text
            textAlign="center"
            fontSize="sm"
            color={textColor}
            fontWeight="medium"
          >
            {recording.isRecording
              ? "Recording... Click to stop"
              : recording.hasRecorded
                ? "Recording complete! Click to record again"
                : "Click the microphone to start recording"}
          </Text>

          {recording.hasRecorded && (
            <Button
              colorScheme="green"
              onClick={handleAnalyze}
              size="md"
              loading={azureSpeech.isAnalyzing}
              loadingText="Analyzing..."
            >
              Analyze Pronunciation
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
