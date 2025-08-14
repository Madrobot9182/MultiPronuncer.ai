import React from "react";
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Heading,
  Badge,
  Grid,
  GridItem,
  Flex,
  Wrap,
  WrapItem,
  ProgressCircleTrack,
  ProgressCircleRange,
} from "@chakra-ui/react";
import { Card } from "@chakra-ui/react";
import { Stat } from "@chakra-ui/react";
import {
  MdRotateLeft,
  MdEmojiEvents,
  MdGpsFixed,
  MdTrendingUp,
  MdCheckCircle,
  MdWarning,
  MdCancel,
} from "react-icons/md";
import { AzurePronunciationResult, WordResult } from "@/types/pronunciation";
import { useColorModeValue } from "../ui/color-mode";
import { ProgressRoot } from "../ui/progress";
import { ProgressCircleRoot } from "../ui/progress-circle";

interface PronunciationResultComponentProps {
  resultData: AzurePronunciationResult;
  onStartOver: () => void;
}

export default function ResultComponent({
  resultData,
  onStartOver,
}: PronunciationResultComponentProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  // Helper function to get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  // Helper function to get score label
  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    if (score >= 60) return "Needs Practice";
    return "Needs Improvement";
  };

  // Helper function to get error type styling
  const getErrorTypeStyle = (errorType: string) => {
    switch (errorType) {
      case "None":
        return {
          colorScheme: "green",
          icon: MdCheckCircle,
          textDecoration: "",
        };
      case "Mispronunciation":
        return {
          colorScheme: "red",
          icon: MdCancel,
          textDecoration: "underline",
        };
      case "Omission":
        return {
          colorScheme: "gray",
          icon: MdWarning,
          textDecoration: "bracket",
        };
      case "Insertion":
        return {
          colorScheme: "yellow",
          icon: MdWarning,
          textDecoration: "bracket",
        };
      default:
        return { colorScheme: "gray", icon: MdWarning, textDecoration: "" };
    }
  };

  const overallScore = Math.round(resultData.pronunciationScore);
  const overallColor = getScoreColor(overallScore);

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
        {/* Header with overall score */}
        <Flex justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Heading size="lg" color={textColor}>
              Pronunciation Results
            </Heading>
            <HStack gap={2}>
              <Box
                as={MdEmojiEvents}
                color={`${overallColor}.500`}
                boxSize="20px"
              />
              <Text fontSize="sm" color={textColor}>
                {getScoreLabel(overallScore)}
              </Text>
            </HStack>
          </VStack>
          <Button size="sm" variant="ghost" onClick={onStartOver}>
            <HStack gap={2}>
              <Box as={MdRotateLeft} boxSize="16px" />
              <Text>Try Again</Text>
            </HStack>
          </Button>
        </Flex>

        {/* Overall Score Circle */}
        <Card.Root bg={cardBg} borderRadius="xl">
          <Card.Body>
            <VStack gap={4}>
              <Box position="relative" w="120px" h="120px">
                <ProgressRoot
                  value={overallScore}
                  size="lg"
                  colorPalette={overallColor}
                >
                  <ProgressCircleRoot>
                    <ProgressCircleTrack />
                    <ProgressCircleRange />
                  </ProgressCircleRoot>
                </ProgressRoot>
                <Flex
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  direction="column"
                  align="center"
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={`${overallColor}.500`}
                  >
                    {overallScore}
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    Overall Score
                  </Text>
                </Flex>
              </Box>
              <Text textAlign="center" fontSize="sm" color={textColor}>
                Your pronunciation accuracy based on the reference text
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Detailed Scores Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <GridItem>
            <Card.Root bg={cardBg} h="100%">
              <Card.Body>
                <Stat.Root>
                  <Stat.Label>
                    <HStack gap={2}>
                      <Box as={MdGpsFixed} boxSize="16px" />
                      <Text>Accuracy</Text>
                    </HStack>
                  </Stat.Label>
                  <Stat.ValueText
                    fontSize="2xl"
                    color={`${getScoreColor(resultData.accuracyScore)}.500`}
                  >
                    {Math.round(resultData.accuracyScore)}%
                  </Stat.ValueText>
                  <Stat.HelpText>
                    How precisely you pronounced each sound
                  </Stat.HelpText>
                </Stat.Root>
              </Card.Body>
            </Card.Root>
          </GridItem>

          <GridItem>
            <Card.Root bg={cardBg} h="100%">
              <Card.Body>
                <Stat.Root>
                  <Stat.Label>
                    <HStack gap={2}>
                      <Box as={MdTrendingUp} boxSize="16px" />
                      <Text>Fluency</Text>
                    </HStack>
                  </Stat.Label>
                  <Stat.ValueText
                    fontSize="2xl"
                    color={`${getScoreColor(resultData.fluencyScore)}.500`}
                  >
                    {Math.round(resultData.fluencyScore)}%
                  </Stat.ValueText>
                  <Stat.HelpText>
                    How naturally and smoothly you spoke
                  </Stat.HelpText>
                </Stat.Root>
              </Card.Body>
            </Card.Root>
          </GridItem>

          <GridItem>
            <Card.Root bg={cardBg} h="100%">
              <Card.Body>
                <Stat.Root>
                  <Stat.Label>
                    <HStack gap={2}>
                      <Box as={MdCheckCircle} boxSize="16px" />
                      <Text>Completeness</Text>
                    </HStack>
                  </Stat.Label>
                  <Stat.ValueText
                    fontSize="2xl"
                    color={`${getScoreColor(resultData.completenessScore)}.500`}
                  >
                    {Math.round(resultData.completenessScore)}%
                  </Stat.ValueText>
                  <Stat.HelpText>
                    How much of the text you pronounced
                  </Stat.HelpText>
                </Stat.Root>
              </Card.Body>
            </Card.Root>
          </GridItem>

          <GridItem>
            <Card.Root bg={cardBg} h="100%">
              <Card.Body>
                <Stat.Root>
                  <Stat.Label>
                    <HStack gap={2}>
                      <Box as={MdCheckCircle} boxSize="16px" />
                      <Text>Prosody</Text>
                    </HStack>
                  </Stat.Label>
                  <Stat.ValueText
                    fontSize="2xl"
                    color={`${resultData.pronunciationScore ? getScoreColor(resultData.pronunciationScore) : "gray"}.500`}
                  >
                    {resultData.pronunciationScore
                      ? Math.round(resultData.pronunciationScore)
                      : "N/A"}
                    %
                  </Stat.ValueText>
                  <Stat.HelpText>
                    How your rhythm and intonation matches the language (EN-US
                    only)
                  </Stat.HelpText>
                </Stat.Root>
              </Card.Body>
            </Card.Root>
          </GridItem>
        </Grid>

        {/* Word-by-word Analysis */}
        {resultData.words && resultData.words.length > 0 && (
          <Card.Root bg={cardBg}>
            <Card.Header>
              <VStack align="start" gap={1}>
                <Heading size="md" color={textColor}>
                  Word Analysis
                </Heading>
                <Text fontSize="sm" color={textColor}>
                  Detailed feedback for each word
                </Text>
              </VStack>
            </Card.Header>
            <Card.Body>
              <Wrap gap={3}>
                {resultData.words.map((word: WordResult, index: number) => {
                  const errorStyle = getErrorTypeStyle(
                    word.errorType || "None"
                  );
                  const wordScore = Math.round(word.accuracyScore);

                  return (
                    <WrapItem key={index}>
                      <VStack gap={1} align="center">
                        <Badge
                          colorPalette={errorStyle.colorScheme}
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="lg"
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <HStack gap={1}>
                            <Box as={errorStyle.icon} boxSize="12px" />
                            {errorStyle.textDecoration === "bracket" ? (
                              <Text
                                textDecoration={
                                  word.errorType === "Insertion"
                                    ? "line-through"
                                    : ""
                                }
                              >
                                [{word.word}]
                              </Text>
                            ) : (
                              <Text textDecoration={errorStyle.textDecoration}>
                                {word.word}
                              </Text>
                            )}
                          </HStack>
                        </Badge>
                        <Text fontSize="xs" color={textColor}>
                          {wordScore}%
                        </Text>
                      </VStack>
                    </WrapItem>
                  );
                })}
              </Wrap>

              {/* <Divider my={4} /> */}

              {/* Legend */}
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  Legend:
                </Text>
                <Wrap gap={4}>
                  <WrapItem>
                    <HStack gap={1}>
                      <Box
                        as={MdCheckCircle}
                        color="green.500"
                        boxSize="14px"
                      />
                      <Text fontSize="xs" color={textColor}>
                        Correct
                      </Text>
                    </HStack>
                  </WrapItem>
                  <WrapItem>
                    <HStack gap={1}>
                      <Box as={MdCancel} color="red.500" boxSize="14px" />
                      <Text fontSize="xs" color={textColor}>
                        Mispronounced
                      </Text>
                    </HStack>
                  </WrapItem>
                  <WrapItem>
                    <HStack gap={1}>
                      <Box as={MdWarning} color="gray.500" boxSize="14px" />
                      <Text fontSize="xs" color={textColor}>
                        Omitted
                      </Text>
                    </HStack>
                  </WrapItem>
                  <WrapItem>
                    <HStack gap={1}>
                      <Box as={MdWarning} color="yellow.500" boxSize="14px" />
                      <Text fontSize="xs" color={textColor}>
                        Extra word
                      </Text>
                    </HStack>
                  </WrapItem>
                </Wrap>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Action Buttons */}
        <HStack gap={3} justify="center">
          <Button colorPalette="blue" onClick={onStartOver} size="lg">
            <HStack gap={2}>
              <Box as={MdRotateLeft} boxSize="18px" />
              <Text>Practice Again</Text>
            </HStack>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
