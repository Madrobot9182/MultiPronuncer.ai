"use client";
import React, { useState, ChangeEvent } from "react";
import {
  VStack,
  Box,
  Text,
  Textarea,
  Button,
  Flex,
  createListCollection,
} from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";

interface LanguageOption {
  value: string;
  label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "it-IT", label: "Italian (Italy)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "ko-KR", label: "Korean (South Korea)" },
  { value: "zh-CN", label: "Chinese (Mandarin)" },
];

export default function PronunciationTextInput() {
  const [text, setText] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const maxCharacters: number = 500;

  // Create collection for Chakra UI 3.0 Select
  const languageCollection = createListCollection({
    items: LANGUAGE_OPTIONS,
  });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    if (e.target.value.length <= maxCharacters) {
      setText(e.target.value);
    }
  };

  const handleSubmit = (): void => {
    if (text.trim()) {
      console.log("Submitted text:", text);
      console.log("Selected language:", selectedLanguage);
      // submission logic here -> display recording component
    }
  };

  const handleLanguageChange = (details: { value: string[] }): void => {
    if (details.value.length > 0) {
      setSelectedLanguage(details.value[0]);
    }
  };

  const isSubmitDisabled: boolean = !text.trim();

  return (
    <VStack gap={6} w="100%" maxW="600px" mx="auto">
      <Box
        w="100%"
        p={6}
        bg={bgColor}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        shadow="sm"
      >
        <VStack gap={4} align="stretch">
          {/* Language Selection */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2} color={textColor}>
              Select Language
            </Text>
            <Select.Root
              collection={languageCollection}
              value={[selectedLanguage]}
              onValueChange={handleLanguageChange}
            >
              <Select.Trigger bg={useColorModeValue("white", "gray.700")}>
                <Select.ValueText placeholder="Select a language" />
              </Select.Trigger>
              <Select.Content>
                {languageCollection.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          {/* Text Input Area */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2} color={textColor}>
              Enter text to practice pronunciation
            </Text>
            <Textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Type or paste the text you want to practice pronouncing..."
              size="lg"
              minH="200px"
              resize="vertical"
              bg={useColorModeValue("gray.50", "gray.700")}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            />
          </Box>

          {/* Character Counter and Submit */}
          <Flex justify="space-between" align="center">
            <Text
              fontSize="sm"
              color={text.length > maxCharacters * 0.9 ? "red.500" : textColor}
            >
              {text.length}/{maxCharacters} characters
            </Text>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              size="md"
            >
              Start Practice
            </Button>
          </Flex>
        </VStack>
      </Box>
    </VStack>
  );
}
