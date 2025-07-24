import {
  Box,
  ClientOnly,
  Skeleton,
  VStack,
} from "@chakra-ui/react";
import { Toaster } from "@/components/ui/toaster"
import { ColorModeToggle } from "@/components/ui/custom/color-mode-toggle";
import { PronunciationPractice } from "@/components/pronunciation/pronunciation-practicer";

export default function Home() {

  return (
    <Box textAlign="center" fontSize="xl" pt="25vh">
      <Toaster />
      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeToggle />
        </ClientOnly>
      </Box>
      

      <VStack gap="8">
          <PronunciationPractice />
      </VStack>

    </Box>
  );
}
