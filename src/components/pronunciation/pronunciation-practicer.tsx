"use client"
import React, { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import { PracticeData, PracticeStep } from '@/types/pronunciation';
import RecordingComponent  from './pronunciation-recording';
import TextInputComponent from './pronunciation-text-input';

export const PronunciationPractice: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<PracticeStep>('input');
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);

  const handleTextSubmit = (data: PracticeData): void => {
    setPracticeData(data);
    setCurrentStep('recording');
  };

  const handleStartOver = (): void => {
    setPracticeData(null);
    setCurrentStep('input');
  };

  return (
    <VStack gap={6} w="100%" maxW="600px" mx="auto">
      {currentStep === 'input' ? (
        <TextInputComponent onSubmit={handleTextSubmit} />
      ) : (
        practiceData && (
          <RecordingComponent 
            practiceData={practiceData} 
            onStartOver={handleStartOver} 
          />
        )
      )}
    </VStack>
  );
};