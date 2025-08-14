"use client";
import React, { useState } from "react";
import { VStack } from "@chakra-ui/react";
import {
  AzurePronunciationResult,
  PracticeData,
  PracticeStep,
} from "@/types/pronunciation";
import RecordingComponent from "./pronunciation-recording";
import TextInputComponent from "./pronunciation-text-input";
import ResultComponent from "./pronunciation-result";
import azureResponseJson from "@/../public/azure-response-example.json"

export default function PronunciationPractice() {
  const [currentStep, setCurrentStep] = useState<PracticeStep>("input");
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [resultData, setResultData] = useState<AzurePronunciationResult | null>(
    null
  );

  const handleTextSubmit = (data: PracticeData): void => {
    setPracticeData(data);
    setCurrentStep("recording");
  };

  const handleResultReceived = (data: AzurePronunciationResult): void => {
    setResultData(data);
    setCurrentStep("results");
  };

  const handleStartOver = (): void => {
    setPracticeData(null);
    setCurrentStep("input");
  };

  // TODO use spoof data for result testing
  const azureResponse: AzurePronunciationResult = azureResponseJson as AzurePronunciationResult;
  
  return (
    <VStack gap={6} w="100%" maxW="600px" mx="auto">
      {/* {currentStep === "input" ? (
        <TextInputComponent onSubmit={handleTextSubmit} />
      ) : currentStep === "recording" ? (
        practiceData && (
          <RecordingComponent
            practiceData={practiceData}
            onAnalysisComplete={handleResultReceived}
            onStartOver={handleStartOver}
          />
        )
      ) : (
        resultData && ( */}
          <ResultComponent
            resultData={azureResponse}
            onStartOver={handleStartOver}
          />
        {/* )
      )} */}
    </VStack>
  );
}
