import React, { useState, ChangeEvent } from "react";
import {
  VStack,
  Box,
  Text,
  Textarea,
  Button,
  Flex,
  createListCollection,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { PracticeData } from "@/types/pronunciation";
import { LANGUAGE_OPTIONS, MAX_TEXT_CHARACTERS } from "@/constants/languages";
import { useColorModeValue } from "../ui/color-mode";
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";
import { RiArrowRightLine } from "react-icons/ri"
import { EN_US_EXAMPLEPARAGRAPHS } from "@/constants/examples";

interface TextInputComponentProps {
  onSubmit: (data: PracticeData) => void;
}

export default function TextInputComponent({
  onSubmit,
}: TextInputComponentProps) {
  const [text, setText] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");

  const languageCollection = createListCollection({
    items: LANGUAGE_OPTIONS,
  });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const exampleParagraphs = EN_US_EXAMPLEPARAGRAPHS;   // TODO determine based on selected language
  
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

  const handleLanguageChange = (details: { value: string[] }): void => {
    if (details.value.length > 0) {
      setSelectedLanguage(details.value[0]);
    }
  };

    const handleInsertText = (text: string) => {
    // Insert the text into your textbox here
    setText(text)
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
            <SimpleGrid columns={3} row={2} gap={2} flex={1}>
              {exampleParagraphs.slice(0,3).map((example, index) => (
                <Button key={index} size="xs" variant="surface" onClick={() => handleInsertText(example.text)}>
                  {example.label}
                </Button>
              ))}
            </SimpleGrid>
          <SelectRoot
            collection={languageCollection}
            value={[selectedLanguage]}
            onValueChange={handleLanguageChange}
            flex={1}
          >
            <SelectTrigger bg={useColorModeValue("white", "gray.700")}>
              <SelectValueText placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languageCollection.items.map((option) => (
                <SelectItem key={option.value} item={option}>
                  <SelectItemText>{option.label}</SelectItemText>
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
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
