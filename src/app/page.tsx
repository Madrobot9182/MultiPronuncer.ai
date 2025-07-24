import {
  Box,
  ClientOnly,
  Skeleton,
  VStack,
} from "@chakra-ui/react";
import { ColorModeToggle } from "../components/color-mode-toggle";
import ServiceOptionCards from "@/components/service-option-cards";
import PronunciationInput from "@/components/pronunciation-input";
import { RadioCardRoot } from "@/components/ui/radio-card";

export default function Home() {


  return (
    <Box textAlign="center" fontSize="xl" pt="25vh">
      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>

      <VStack gap="8">
        <ServiceOptionCards />
        <PronunciationInput />
        <RadioCardRoot />
      </VStack>

    </Box>
  );
}
