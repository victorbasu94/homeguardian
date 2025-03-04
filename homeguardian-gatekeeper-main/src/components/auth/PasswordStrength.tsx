
import { useState, useEffect } from 'react';
import { getPasswordStrength } from '@/lib/validation';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const [strength, setStrength] = useState({ score: 0, feedback: '' });
  
  useEffect(() => {
    if (password) {
      setStrength(getPasswordStrength(password));
    } else {
      setStrength({ score: 0, feedback: '' });
    }
  }, [password]);
  
  if (!password) return null;
  
  const getBackgroundColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-200">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-full w-1/4 transition-all duration-300 ease-in-out ${
              index <= strength.score ? getBackgroundColor(strength.score) : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs transition-all duration-300 ${
        strength.score <= 1 ? 'text-red-500' :
        strength.score === 2 ? 'text-yellow-500' :
        strength.score === 3 ? 'text-blue-500' :
        strength.score >= 4 ? 'text-green-500' : ''
      }`}>
        {strength.feedback}
      </p>
    </div>
  );
};

export default PasswordStrength;
