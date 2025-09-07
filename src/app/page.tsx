"use client";
import { Box, ClientOnly, Skeleton, VStack } from "@chakra-ui/react";
import { ColorModeToggle } from "@/components/ui/custom/color-mode-toggle";
import ServiceOptionCards from "@/components/ui/custom/service-option-cards";
import { SpeechServices } from "@/types/services";
import { useState } from "react";
import PronunciationPractice from "@/components/pronunciation/pronunciation-practicer";
import MultiPronuncerLogo from "@/components/ui/custom/mpai-logo";
import translationInterface from "@/components/translation/translation-interface";

type ComponentMap = {
  [key in SpeechServices]: React.ComponentType;
};

const componentMap: ComponentMap = {
  pronunciation: PronunciationPractice,
  translate: translationInterface,
  tts: PronunciationPractice, // TODO
};

export default function Home() {
  const [currentService, setCurrentService] =
    useState<SpeechServices>("pronunciation");
  const handleCardSelection = (selection: SpeechServices): void => {
    setCurrentService(selection);
  };

  const CurrentComponent = componentMap[currentService];

  return (
    <Box textAlign="center" fontSize="xl" pt="5vh" pb="5vh">
      <Box pos="absolute" top="2" right="2">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>

      <VStack gap="8">
        <MultiPronuncerLogo />
        <ServiceOptionCards onSelect={handleCardSelection} />
        {<CurrentComponent />}
      </VStack>
    </Box>
  );
}
