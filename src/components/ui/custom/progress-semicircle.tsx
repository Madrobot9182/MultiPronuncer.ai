import { Box } from "@chakra-ui/react";

interface SemiCircleProgressProps {
  score: number;
  maxScore?: number;
}

export default function SemiCircleProgress({ score, maxScore = 100 }:SemiCircleProgressProps){
  const percentage = (score / maxScore) * 180;
  let color = "#4CAF50"; // default color

  if (score < 60) {
    color = "#FF0000"; // red for low scores
  } else if (score < 80) {
    color = "#FFFF00"; // yellow for medium scores
  }

  return (
    <Box position="relative" w="200px" h="100px">
      <svg width="200" height="100" viewBox="0 0 200 100">
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          stroke="#ccc"
          strokeWidth="20"
          fill="none"
        />
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          stroke={color}
          strokeWidth="20"
          fill="none"
          strokeDasharray="283"
          strokeDashoffset={283 - (percentage / 180) * 283}
        />
      </svg>
    </Box>
  );
};