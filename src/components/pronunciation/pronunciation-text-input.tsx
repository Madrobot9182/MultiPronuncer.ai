import React, { useState, ChangeEvent } from "react";
import {
  VStack,
  Box,
  Text,
  Textarea,
  Button,
  Flex,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { BsTextParagraph } from "react-icons/bs";
import { PracticeData } from "@/types/pronunciation";
import {
  PRONUNCIATION_LANGUAGES,
  MAX_TEXT_CHARACTERS,
  LanguageOption,
} from "@/constants/languages";
import { useColorModeValue } from "../ui/color-mode";
import { RiArrowRightLine } from "react-icons/ri";
import { fetchExampleParagraphs } from "@/constants/examples";
import LanguageDropdown from "../ui/custom/language-menu";

interface TextInputComponentProps {
  onSubmit: (data: PracticeData) => void;
}

export default function TextInputComponent({
  onSubmit,
}: TextInputComponentProps) {
  const [text, setText] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const [exampleParagraphs, setExampleParagraphs] = useState<string[]>(
    fetchExampleParagraphs("en-US")
  );
  // const languageCollection = createListCollection({
  //   items: PRONUNCIATION_LANGUAGES,
  // });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    if (e.target.value.length <= MAX_TEXT_CHARACTERS) {
      setText(e.target.value);
    }
  };

  const handleSubmit = (): void => {
    if (text.trim()) {
      onSubmit({
        text: text.trim(),
        language: selectedLanguage,
      });
    }
  };

  const handleLanguageChange = (language: LanguageOption): void => {
    if (language.value.length) {
      setSelectedLanguage(language.value);
      setExampleParagraphs(fetchExampleParagraphs(language.value));
    }
  };

  const handleInsertText = (text: string) => {
    // Insert the text into your textbox here
    setText(text);
  };

  const isSubmitDisabled: boolean = !text.trim();

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
      <VStack gap={4} align="stretch">
        <Box>
          <HStack gap={12}>
            {exampleParagraphs.length ? 
            <SimpleGrid columns={3} row={2} gap={2} flex={1}>
              {(
                exampleParagraphs.slice(0, 3).map((example, index) => (
                  <Button
                    key={index}
                    size="xs"
                    variant="surface"
                    onClick={() => handleInsertText(example)}
                  >
                    Sample {index + 1} <BsTextParagraph />
                  </Button>
                ))
              )} 
            </SimpleGrid> : 
                <Text fontSize={18} flex={1}>No Samples Available</Text>
              }
            <LanguageDropdown
              onLanguageSelect={handleLanguageChange}
              allLanguages={PRONUNCIATION_LANGUAGES}
              size="md"
            />
          </HStack>
        </Box>

        <Box>
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

        <Flex justify="space-between" align="center">
          <Text
            fontSize="sm"
            color={
              text.length > MAX_TEXT_CHARACTERS * 0.9 ? "red.500" : textColor
            }
          >
            {text.length}/{MAX_TEXT_CHARACTERS} characters
          </Text>
          <Button
            colorPalette="gray"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            size="md"
          >
            Start Practice <RiArrowRightLine />
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
