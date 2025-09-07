// components/TranslationInterface.tsx
import React from "react";
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Text,
  Textarea,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
  Button,
  Badge,
} from "@chakra-ui/react";
import { IoCopy, IoVolumeMedium, IoLanguage } from "react-icons/io5";
import { FiRotateCcw } from "react-icons/fi";
import { LuArrowLeftRight } from "react-icons/lu";

import { useTranslation } from "@/hooks/useTranslation";
// import { useLanguages } from "@/hooks/useLanguages";
import { useColorModeValue } from "../ui/color-mode";
import { Tooltip } from "../ui/tooltip";
import LanguageDropdown from "../ui/custom/language-menu";
import { TRANSLATION_LANGUAGES } from "@/constants/languages";

interface TranslationInterfaceProps {
  className?: string;
}

export default function TranslationInterface({
  className,
}: TranslationInterfaceProps) {
  const {
    translationState,
    setSourceText,
    setSourceLanguage,
    setTargetLanguage,
    swapLanguages,
    clearTranslation,
  } = useTranslation();

//   const {
//     languages,
//     targetLanguages,
//     isLoading: languagesLoading,
//     error: languagesError,
//     getLanguageByCode,
//   } = useLanguages();

  // Theme colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const focusBorderColor = useColorModeValue("blue.500", "blue.300");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");
  const headerBgColor = useColorModeValue("gray.50", "gray.700");

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleTextToSpeech = (text: string, languageCode: string) => {
    if ("speechSynthesis" in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      speechSynthesis.speak(utterance);
    }
  };

  const canSwapLanguages =
    translationState.sourceLanguage !== "auto" &&
    translationState.translatedText.trim() !== "";

//   if (languagesLoading) {
//     return (
//       <Container maxW="6xl" py={8}>
//         <VStack gap={4}>
//           <Spinner size="lg" />
//           <Text>Loading translation interface...</Text>
//         </VStack>
//       </Container>
//     );
//   }

  return (
    <Container maxW="6xl" py={8} className={className}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <HStack justify="center" mb={2}>
            <IoLanguage size={32} />
            <Heading size="lg">AI Translator</Heading>
          </HStack>
          <Text color={mutedTextColor}>
            Real-time translation powered by Azure AI
          </Text>
        </Box>

        {/* Error Alert */}
        {/* {(translationState.error || languagesError) && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              {translationState.error || languagesError}
            </AlertDescription>
          </Alert>
        )} */}

        {/* Main Translation Interface */}
        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          shadow="sm"
        >
          {/* Language Selection Header */}
          <Flex
            bg={headerBgColor}
            p={4}
            align="center"
            justify="space-between"
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
          >
            <HStack flex={1} gap={3}>
              <LanguageDropdown
                onLanguageSelect={setSourceLanguage}
                allLanguages={TRANSLATION_LANGUAGES}
              />

              {translationState.detectedLanguage &&
                translationState.sourceLanguage === "auto" && (
                  <Badge colorScheme="blue" size="sm">
                    Detected:{" "}
                    {/* {getLanguageByCode(translationState.detectedLanguage)
                      ?.name || translationState.detectedLanguage} */}
                  </Badge>
                )}
            </HStack>

            <Tooltip
              content={
                canSwapLanguages
                  ? "Swap languages"
                  : "Cannot swap with auto-detect"
              }
            >
              <IconButton
                aria-label="Swap languages"
                size="sm"
                variant="ghost"
                onClick={swapLanguages}
                disabled={!canSwapLanguages}
              >
                <LuArrowLeftRight size={16} />{" "}
              </IconButton>
            </Tooltip>

            <LanguageDropdown
              onLanguageSelect={setTargetLanguage}
              allLanguages={TRANSLATION_LANGUAGES}
            />
          </Flex>

          {/* Translation Areas */}
          <Grid templateColumns="1fr 1fr" minH="300px">
            {/* Source Text Area */}
            <GridItem
              borderRightWidth="1px"
              borderRightColor={borderColor}
              p={4}
            >
              <VStack align="stretch" h="full" gap={3}>
                <HStack justify="space-between">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={mutedTextColor}
                  >
                    Enter text to translate
                  </Text>
                  <HStack gap={1}>
                    {translationState.sourceText && (
                      <>
                        <Tooltip content="Listen">
                          <IconButton
                            aria-label="Text to speech"
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              handleTextToSpeech(
                                translationState.sourceText,
                                translationState.detectedLanguage ||
                                  translationState.sourceLanguage
                              )
                            }
                          >
                            <IoVolumeMedium size={14} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Copy">
                          <IconButton
                            aria-label="Copy source text"
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              handleCopyText(translationState.sourceText)
                            }
                          >
                            <IoCopy size={14} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </HStack>
                </HStack>

                <Textarea
                  value={translationState.sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Type your text here..."
                  resize="none"
                  border="none"
                  outline="none"
                  fontSize="lg"
                  h="full"
                  _focus={{
                    boxShadow: "none",
                  }}
                />

                <HStack justify="space-between">
                  <Text fontSize="xs" color={mutedTextColor}>
                    {translationState.sourceText.length} characters
                  </Text>
                  {translationState.sourceText && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={clearTranslation}
                    >
                      Clear <FiRotateCcw size={12} />
                    </Button>
                  )}
                </HStack>
              </VStack>
            </GridItem>

            {/* Target Text Area */}
            <GridItem p={4}>
              <VStack align="stretch" h="full" gap={3}>
                <HStack justify="space-between">
                  <HStack>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={mutedTextColor}
                    >
                      Translation
                    </Text>
                    {translationState.isLoading && <Spinner size="xs" />}
                  </HStack>
                  <HStack gap={1}>
                    {translationState.translatedText && (
                      <>
                        <Tooltip content="Listen">
                          <IconButton
                            aria-label="Text to speech"
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              handleTextToSpeech(
                                translationState.translatedText,
                                translationState.targetLanguage
                              )
                            }
                          >
                            <IoVolumeMedium size={14} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Copy">
                          <IconButton
                            aria-label="Copy translation"
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              handleCopyText(translationState.translatedText)
                            }
                          >
                            <IoCopy size={14} />{" "}
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </HStack>
                </HStack>

                <Box
                  flex={1}
                  p={3}
                  bg={bgColor}
                  borderRadius="md"
                  overflow="auto"
                >
                  {translationState.isLoading ? (
                    <VStack justify="center" h="full">
                      <Spinner size="sm" />
                      <Text fontSize="sm" color={mutedTextColor}>
                        Translating...
                      </Text>
                    </VStack>
                  ) : translationState.translatedText ? (
                    <Text fontSize="lg" lineHeight="tall">
                      {translationState.translatedText}
                    </Text>
                  ) : (
                    <Text
                      fontSize="lg"
                      color={mutedTextColor}
                      fontStyle="italic"
                    >
                      Translation will appear here
                    </Text>
                  )}
                </Box>

                <HStack justify="space-between">
                  <Text fontSize="xs" color={mutedTextColor}>
                    {translationState.translatedText.length} characters
                  </Text>
                </HStack>
              </VStack>
            </GridItem>
          </Grid>
        </Box>

        {/* Footer */}
        <Text textAlign="center" fontSize="sm" color={mutedTextColor}>
          Powered by Azure AI Translator • Real-time translation as you type
        </Text>
      </VStack>
    </Container>
  );
}
