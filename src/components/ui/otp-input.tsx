import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(
    value.split('').slice(0, length).concat(Array(length).fill('').slice(0, length - value.length))
  );

  // Update internal digits when value prop changes
  useEffect(() => {
    const newDigits = value.split('').slice(0, length)
      .concat(Array(length).fill('').slice(0, length - value.length));
    setDigits(newDigits);
  }, [value, length]);

  // Initialize input refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only accept digits
    if (!/^\d*$/.test(newValue)) return;
    
    // If multiple characters are pasted, distribute them
    if (newValue.length > 1) {
      const chars = newValue.split('').slice(0, length - index);
      const newDigits = [...digits];
      
      chars.forEach((char, charIndex) => {
        if (index + charIndex < length) {
          newDigits[index + charIndex] = char;
        }
      });
      
      setDigits(newDigits);
      onChange(newDigits.join(''));
      
      // Focus on next input after the last filled one
      const nextIndex = Math.min(index + chars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    
    // Handle single character input
    const newDigits = [...digits];
    newDigits[index] = newValue;
    setDigits(newDigits);
    onChange(newDigits.join(''));
    
    // Auto advance to next input
    if (newValue !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        // If current input is empty, focus previous input
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Filter out non-digit characters
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (digits) {
      const newDigits = digits.split('')
        .concat(Array(length).fill('').slice(0, length - digits.length));
      setDigits(newDigits);
      onChange(newDigits.join(''));
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          className="w-10 h-12 text-center text-lg p-0"
          value={digits[index] || ''}
          onChange={(e) => handleInputChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoComplete="off"
        />
      ))}
    </div>
  );
}; 