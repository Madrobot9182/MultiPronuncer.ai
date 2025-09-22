import { SpeechServices } from "@/types/services";
import { RadioCard, HStack } from "@chakra-ui/react";

interface ServiceOptionCardProps {
  onSelect: (selection: SpeechServices) => void;
}

const items = [
  {
    value: "pronunciation",
    title: "Pronunciation Assessment",
    description: "Test your speaking proficinity",
  },
  {
    value: "translate",
    title: "Translator",
    description: "Translate between multiple languages",
  },
  // {
  //   value: "tts",
  //   title: "Text To Speech",
  //   description: "Convert text to spoken audio",
  // },
];

export default function ServiceOptionCards({
  onSelect,
}: ServiceOptionCardProps) {
  return (
    <RadioCard.Root
      defaultValue="pronunciation"
      
      onValueChange={(details) => {
        if (details.value) {
          onSelect(details.value as SpeechServices);
        }
      }}
    >
      <RadioCard.Label>Select Service</RadioCard.Label>
      <HStack align="stretch">
        {items.map((item) => (
          <RadioCard.Item key={item.value} value={item.value} cursor={"pointer"}>
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl>
              <RadioCard.ItemContent>
                <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                <RadioCard.ItemDescription>
                  {item.description}
                </RadioCard.ItemDescription>
              </RadioCard.ItemContent>
              <RadioCard.ItemIndicator />
            </RadioCard.ItemControl>
          </RadioCard.Item>
        ))}
      </HStack>
    </RadioCard.Root>
  );
}
