import { Button } from '@nextui-org/react';

import { StageProps } from '@/types';

const numberToWord = (num: number): string => {
  const words = [
    'Start',
    'Sent PIS',
    'Re-sent',
    'Rejected',
    'Accepted',
    'Enrolled',
    'Enrolled',
    'EIGHT',
    'NINE',
    'TEN',
  ];
  return words[num - 1] || num.toString();
};

export const Stage: React.FC<StageProps> = ({
  number,
  isActive,
  isCompleted,
  onClick,
}) => (
  <Button
    aria-label={`Stage ${number}`}
    className={`
        w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base
        ${
          isActive
            ? 'bg-primary text-white'
            : isCompleted
              ? 'bg-success text-white'
              : 'bg-default-200 text-default-500'
        }
        transition-all duration-300 ease-in-out
      `}
    onClick={onClick}
  >
    {numberToWord(number)}
  </Button>
);
