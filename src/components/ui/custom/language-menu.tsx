import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  InputGroup,
  Stack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Badge,
  SimpleGrid,
  IconButton,
  useDisclosure,
  Flex,
  HStack,
  VStack,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiX,
  FiMapPin,
} from "react-icons/fi";
import { FaGlobe, FaStar, FaLanguage } from "react-icons/fa";
import { useColorModeValue } from "../color-mode";
import { LanguageOption } from "@/constants/languages";

// Mock language data - replace with your actual constants
const POPULAR_LANGUAGES = [
  { value: "en-US", label: "English (United States)", region: "Americas" },
  { value: "en-GB", label: "English (United Kingdom)", region: "Europe" },
  { value: "es-ES", label: "Spanish (Spain)", region: "Europe" },
  { value: "es-MX", label: "Spanish (Mexico)", region: "Americas" },
  { value: "fr-FR", label: "French (France)", region: "Europe" },
  { value: "de-DE", label: "German (Germany)", region: "Europe" },
  { value: "it-IT", label: "Italian (Italy)", region: "Europe" },
  { value: "pt-BR", label: "Portuguese (Brazil)", region: "Americas" },
  { value: "ja-JP", label: "Japanese (Japan)", region: "Asia Pacific" },
  { value: "ko-KR", label: "Korean (South Korea)", region: "Asia Pacific" },
];

const MAJOR_LANGUAGE_GROUPS = {
  English: [
    { value: "en-US", label: "English (United States)", region: "Americas" },
    { value: "en-GB", label: "English (United Kingdom)", region: "Europe" },
    { value: "en-AU", label: "English (Australia)", region: "Asia Pacific" },
    { value: "en-CA", label: "English (Canada)", region: "Americas" },
    { value: "en-IN", label: "English (India)", region: "Asia Pacific" },
    { value: "en-IE", label: "English (Ireland)", region: "Europe" },
    { value: "en-NZ", label: "English (New Zealand)", region: "Asia Pacific" },
    { value: "en-ZA", label: "English (South Africa)", region: "Africa" },
    { value: "en-SG", label: "English (Singapore)", region: "Asia Pacific" },
    { value: "en-PH", label: "English (Philippines)", region: "Asia Pacific" },
  ],
  Spanish: [
    { value: "es-ES", label: "Spanish (Spain)", region: "Europe" },
    { value: "es-MX", label: "Spanish (Mexico)", region: "Americas" },
    { value: "es-AR", label: "Spanish (Argentina)", region: "Americas" },
    { value: "es-CO", label: "Spanish (Colombia)", region: "Americas" },
    { value: "es-CL", label: "Spanish (Chile)", region: "Americas" },
    { value: "es-PE", label: "Spanish (Peru)", region: "Americas" },
    { value: "es-VE", label: "Spanish (Venezuela)", region: "Americas" },
    { value: "es-EC", label: "Spanish (Ecuador)", region: "Americas" },
    { value: "es-GT", label: "Spanish (Guatemala)", region: "Americas" },
    { value: "es-UR", label: "Spanish (Uruguay)", region: "Americas" },
  ],
  French: [
    { value: "fr-FR", label: "French (France)", region: "Europe" },
    { value: "fr-CA", label: "French (Canada)", region: "Americas" },
    { value: "fr-BE", label: "French (Belgium)", region: "Europe" },
    { value: "fr-CH", label: "French (Switzerland)", region: "Europe" },
  ],
  German: [
    { value: "de-DE", label: "German (Germany)", region: "Europe" },
    { value: "de-AT", label: "German (Austria)", region: "Europe" },
    { value: "de-CH", label: "German (Switzerland)", region: "Europe" },
  ],
  Portuguese: [
    { value: "pt-BR", label: "Portuguese (Brazil)", region: "Americas" },
    { value: "pt-PT", label: "Portuguese (Portugal)", region: "Europe" },
  ],
  Arabic: [
    { value: "ar-SA", label: "Arabic (Saudi Arabia)", region: "Middle East" },
    { value: "ar-EG", label: "Arabic (Egypt)", region: "Middle East" },
    { value: "ar-AE", label: "Arabic (UAE)", region: "Middle East" },
    { value: "ar-MA", label: "Arabic (Morocco)", region: "Middle East" },
    { value: "ar-JO", label: "Arabic (Jordan)", region: "Middle East" },
    { value: "ar-LB", label: "Arabic (Lebanon)", region: "Middle East" },
  ],
};

const ALL_LANGUAGES = [
  ...POPULAR_LANGUAGES,
  {
    value: "zh-CN",
    label: "Chinese (Mandarin, Simplified)",
    region: "Asia Pacific",
  },
  { value: "zh-TW", label: "Chinese (Traditional)", region: "Asia Pacific" },
  { value: "ru-RU", label: "Russian (Russia)", region: "Europe" },
  { value: "hi-IN", label: "Hindi (India)", region: "Asia Pacific" },
  { value: "ar-SA", label: "Arabic (Saudi Arabia)", region: "Middle East" },
  { value: "bn-IN", label: "Bengali (India)", region: "Asia Pacific" },
  { value: "th-TH", label: "Thai (Thailand)", region: "Asia Pacific" },
  { value: "vi-VN", label: "Vietnamese (Vietnam)", region: "Asia Pacific" },
  { value: "tr-TR", label: "Turkish (Turkey)", region: "Europe" },
  { value: "pl-PL", label: "Polish (Poland)", region: "Europe" },
  { value: "nl-NL", label: "Dutch (Netherlands)", region: "Europe" },
  { value: "sv-SE", label: "Swedish (Sweden)", region: "Europe" },
  { value: "da-DK", label: "Danish (Denmark)", region: "Europe" },
  { value: "no-NO", label: "Norwegian (Norway)", region: "Europe" },
  { value: "fi-FI", label: "Finnish (Finland)", region: "Europe" },
  { value: "cs-CZ", label: "Czech (Czech Republic)", region: "Europe" },
  { value: "hu-HU", label: "Hungarian (Hungary)", region: "Europe" },
  { value: "ro-RO", label: "Romanian (Romania)", region: "Europe" },
  { value: "bg-BG", label: "Bulgarian (Bulgaria)", region: "Europe" },
  { value: "hr-HR", label: "Croatian (Croatia)", region: "Europe" },
  { value: "sk-SK", label: "Slovak (Slovakia)", region: "Europe" },
  { value: "sl-SI", label: "Slovenian (Slovenia)", region: "Europe" },
  { value: "et-EE", label: "Estonian (Estonia)", region: "Europe" },
  { value: "lv-LV", label: "Latvian (Latvia)", region: "Europe" },
  { value: "lt-LT", label: "Lithuanian (Lithuania)", region: "Europe" },
  { value: "el-GR", label: "Greek (Greece)", region: "Europe" },
  { value: "he-IL", label: "Hebrew (Israel)", region: "Middle East" },
  { value: "fa-IR", label: "Persian (Iran)", region: "Middle East" },
  { value: "ur-PK", label: "Urdu (Pakistan)", region: "Asia Pacific" },
  { value: "id-ID", label: "Indonesian (Indonesia)", region: "Asia Pacific" },
  { value: "ms-MY", label: "Malay (Malaysia)", region: "Asia Pacific" },
  { value: "tl-PH", label: "Filipino (Philippines)", region: "Asia Pacific" },
  { value: "sw-KE", label: "Swahili (Kenya)", region: "Africa" },
  { value: "am-ET", label: "Amharic (Ethiopia)", region: "Africa" },
  { value: "yo-NG", label: "Yoruba (Nigeria)", region: "Africa" },
  { value: "ig-NG", label: "Igbo (Nigeria)", region: "Africa" },
  { value: "zu-ZA", label: "Zulu (South Africa)", region: "Africa" },
  { value: "af-ZA", label: "Afrikaans (South Africa)", region: "Africa" },
];

const FILTER_TYPES = {
  ALL: "all",
  POPULAR: "popular",
  MAJOR_VARIANTS: "major_variants",
  REGION: "region",
};

const REGIONS = ["Americas", "Europe", "Asia Pacific", "Middle East", "Africa"];

interface LanguageDropdownProps {
  selectedLanguage?: string;
  onLanguageSelect: (language: LanguageOption) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}

export default function LanguageDropdown({
  selectedLanguage,
  onLanguageSelect,
  placeholder = "Select Language",
  size = "md",
}: LanguageDropdownProps)
 {
  const { open, onToggle, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.ALL);
  const [selectedLanguageLabel, setSelectedLanguageLabel] = useState<string>(placeholder);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  const filteredLanguages = useMemo(() => {
    let languages: LanguageOption[] = [];

    switch (activeFilter) {
      case FILTER_TYPES.POPULAR:
        languages = POPULAR_LANGUAGES;
        break;
      case FILTER_TYPES.MAJOR_VARIANTS:
        languages = Object.values(MAJOR_LANGUAGE_GROUPS).flat();
        break;
      case FILTER_TYPES.REGION:
        if (selectedRegion) {
          languages = ALL_LANGUAGES.filter(
            (lang) => lang.region === selectedRegion
          );
        } else {
          languages = ALL_LANGUAGES;
        }
        break;
      default:
        languages = ALL_LANGUAGES;
    }

    if (searchTerm) {
      languages = languages.filter(
        (lang) =>
          lang.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lang.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return languages;
  }, [activeFilter, selectedRegion, searchTerm]);

  const groupedLanguages = useMemo(() => {
    if (activeFilter === FILTER_TYPES.MAJOR_VARIANTS && !searchTerm) {
      return MAJOR_LANGUAGE_GROUPS;
    }
    return null;
  }, [activeFilter, searchTerm]);

  const handleLanguageSelect = (language: LanguageOption) => {
    onLanguageSelect(language);
    setSelectedLanguageLabel(language.label)
    onClose();
    setSearchTerm("");
  };

  const handleFilterChange = (filter: string, region?: string) => {
    setActiveFilter(filter);
    setSelectedRegion(region || null);
    setExpandedGroups(new Set());
    setSearchTerm("");
  };

  const toggleGroupExpansion = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={onToggle}
      positioning={{ 
        placement: "bottom-start",
        strategy: "fixed", // This makes it overlay instead of pushing content
        offset: { mainAxis: 4 }
      }}
      closeOnInteractOutside={true}
      modal={false} // Ensures it doesn't block interaction with the rest of the page
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          justifyContent="space-between"
          maxW="300px"
          textAlign="left"
          fontWeight="normal"
          bg={bg}
          borderColor={borderColor}
          _hover={{ bg: hoverBg }}
          position="relative" // Ensures proper stacking context
          zIndex={1}
        >
          {<FaGlobe size={16} />}
          <Text truncate>{selectedLanguageLabel}</Text>
          {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        w="480px"
        maxH="500px"
        bg={bg}
        borderColor={borderColor}
        shadow="2xl" // Increased shadow for better overlay effect
        borderRadius="lg"
        zIndex={9999} // High z-index to appear above everything
        position="fixed" // Ensures it's positioned relative to viewport
      >
        <Stack gap={0} align="stretch">
          {/* Search Bar */}
          <Box p={4} borderBottomWidth={1} borderColor={borderColor}>
            <Box position="relative">
              <Flex
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                align="center"
              >
                <FiSearch size={14} color={mutedTextColor} />
              </Flex>
              <Input
                ref={searchInputRef}
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={bg}
                border="1px"
                borderColor={borderColor}
                pl={10}
                pr={searchTerm ? 10 : 4}
                size="sm"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
              {searchTerm && (
                <Flex
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={2}
                >
                  <IconButton
                    size="xs"
                    variant="ghost"
                    aria-label="Clear search"
                    onClick={clearSearch}
                  >
                    <FiX size={12} />
                  </IconButton>
                </Flex>
              )}
            </Box>
          </Box>

          {/* Filter Buttons */}
          <Box p={3} borderBottomWidth={1} borderColor={borderColor}>
            <Flex gap={2} flexWrap="wrap">
              <Button
                size="xs"
                variant={activeFilter === FILTER_TYPES.ALL ? "solid" : "ghost"}
                colorScheme={
                  activeFilter === FILTER_TYPES.ALL ? "blue" : "gray"
                }
                onClick={() => handleFilterChange(FILTER_TYPES.ALL)}
              >
                <FaLanguage size={12} style={{ marginRight: 4 }} />
                All Languages
              </Button>
              <Button
                size="xs"
                variant={
                  activeFilter === FILTER_TYPES.POPULAR ? "solid" : "ghost"
                }
                colorScheme={
                  activeFilter === FILTER_TYPES.POPULAR ? "blue" : "gray"
                }
                onClick={() => handleFilterChange(FILTER_TYPES.POPULAR)}
              >
                <FaStar size={12} style={{ marginRight: 4 }} />
                Popular
              </Button>
              <Button
                size="xs"
                variant={
                  activeFilter === FILTER_TYPES.MAJOR_VARIANTS
                    ? "solid"
                    : "ghost"
                }
                colorScheme={
                  activeFilter === FILTER_TYPES.MAJOR_VARIANTS ? "blue" : "gray"
                }
                onClick={() => handleFilterChange(FILTER_TYPES.MAJOR_VARIANTS)}
              >
                <FiFilter size={12} style={{ marginRight: 4 }} />
                Major Variants
              </Button>
            </Flex>

            {/* Region Filter Pills */}
            {activeFilter === FILTER_TYPES.REGION && (
              <Flex gap={1} mt={2} flexWrap="wrap">
                {REGIONS.map((region) => (
                  <Badge
                    key={region}
                    variant={selectedRegion === region ? "solid" : "outline"}
                    colorScheme={selectedRegion === region ? "blue" : "gray"}
                    cursor="pointer"
                    onClick={() =>
                      handleFilterChange(FILTER_TYPES.REGION, region)
                    }
                    fontSize="10px"
                    px={2}
                    py={1}
                  >
                    <Flex align="center" gap={1}>
                      <FiMapPin size={10} />
                      {region}
                    </Flex>
                  </Badge>
                ))}
              </Flex>
            )}
          </Box>

          {/* Language List */}
          <Box maxH="300px" overflowY="auto" p={2}>
            {groupedLanguages ? (
              // Grouped view for major variants
              <Stack gap={1} align="stretch">
                {Object.entries(groupedLanguages).map(
                  ([groupName, languages]) => (
                    <Box key={groupName}>
                      <Button
                        variant="ghost"
                        size="sm"
                        w="full"
                        justifyContent="space-between"
                        onClick={() => toggleGroupExpansion(groupName)}
                        fontWeight="semibold"
                        color={textColor}
                      >
                        <Flex align="center" gap={2}>
                          <Text>{groupName}</Text>
                          <Badge size="sm" variant="subtle" colorScheme="blue">
                            {languages.length}
                          </Badge>
                        </Flex>
                        {expandedGroups.has(groupName) ? (
                          <FiChevronUp size={14} />
                        ) : (
                          <FiChevronDown size={14} />
                        )}
                      </Button>
                      {expandedGroups.has(groupName) && (
                        <SimpleGrid columns={2} gap={1} pl={4} pt={1}>
                          {languages.map((language) => (
                            <Button
                              key={language.value}
                              variant="ghost"
                              size="sm"
                              justifyContent="flex-start"
                              onClick={() => handleLanguageSelect(language)}
                              bg={
                                selectedLanguage === language.value
                                  ? activeBg
                                  : "transparent"
                              }
                              _hover={{ bg: hoverBg }}
                              h="auto"
                              py={2}
                            >
                              <Stack gap={0} align="start">
                                <Text fontSize="xs" fontWeight="medium">
                                  {language.label}
                                </Text>
                                <Text fontSize="2xs" color={mutedTextColor}>
                                  {language.region}
                                </Text>
                              </Stack>
                            </Button>
                          ))}
                        </SimpleGrid>
                      )}
                      <Box h={1} bg={borderColor} my={2} />
                    </Box>
                  )
                )}
              </Stack>
            ) : (
              // Grid view for other filters
              <SimpleGrid columns={3} gap={1}>
                {filteredLanguages.map((language) => (
                  <Button
                    key={language.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLanguageSelect(language)}
                    bg={
                      selectedLanguage === language.value
                        ? activeBg
                        : "transparent"
                    }
                    _hover={{ bg: hoverBg }}
                    h="auto"
                    py={3}
                    textAlign="left"
                    justifyContent="flex-start"
                  >
                    <Stack gap={1} align="start" w="full">
                      <Text fontSize="xs" fontWeight="medium" truncate w="full">
                        {language.label.split("(")[0].trim()}
                      </Text>
                      <Text
                        fontSize="2xs"
                        color={mutedTextColor}
                        truncate
                        w="full"
                      >
                        {language.label.includes("(")
                          ? language.label.split("(")[1]?.replace(")", "")
                          : language.region}
                      </Text>
                    </Stack>
                  </Button>
                ))}
              </SimpleGrid>
            )}

            {filteredLanguages.length === 0 && (
              <Flex
                justify="center"
                align="center"
                h="100px"
                color={mutedTextColor}
              >
                <Stack gap={2} align="center">
                  <FiSearch size={24} />
                  <Text fontSize="sm">No languages found</Text>
                </Stack>
              </Flex>
            )}
          </Box>
        </Stack>
      </PopoverContent>
    </Popover.Root>
  );
}
