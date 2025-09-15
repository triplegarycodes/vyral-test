import { useState, useCallback } from 'react';

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const commonValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= max,
    message: message || `Must be no more than ${max} characters`
  }),

  noSpam: (message = 'Content appears to be spam'): ValidationRule => ({
    test: (value) => {
      // Check for excessive repeated characters
      if (/(.)\1{4,}/.test(value)) return false;
      
      // Check for excessive caps
      const capsRatio = (value.match(/[A-Z]/g) || []).length / value.length;
      if (capsRatio > 0.5 && value.length > 10) return false;
      
      // Check for suspicious patterns
      const spamPatterns = [
        /click\s+here/i,
        /free\s+money/i,
        /earn\s+\$\d+/i,
        /www\./g,
        /http[s]?:\/\//g
      ];
      
      return !spamPatterns.some(pattern => pattern.test(value));
    },
    message
  }),

  noOffensiveContent: (message = 'Content contains inappropriate language'): ValidationRule => ({
    test: (value) => {
      const flaggedWords = [
        'spam', 'scam', 'hate', 'violence', 'harassment',
        'inappropriate', 'offensive', 'toxic', 'bullying'
      ];
      
      const lowerValue = value.toLowerCase();
      return !flaggedWords.some(word => lowerValue.includes(word));
    },
    message
  }),

  email: (message = 'Please enter a valid email'): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  username: (message = 'Username can only contain letters, numbers, and underscores'): ValidationRule => ({
    test: (value) => /^[a-zA-Z0-9_]+$/.test(value),
    message
  })
};

export function useInputValidation() {
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});

  const validateField = useCallback((fieldName: string, value: string, rules: ValidationRule[]): ValidationResult => {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }
    
    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors
    };
    
    setValidationResults(prev => ({
      ...prev,
      [fieldName]: result
    }));
    
    return result;
  }, []);

  const validateFields = useCallback((fields: Record<string, { value: string; rules: ValidationRule[] }>): boolean => {
    let allValid = true;
    const results: Record<string, ValidationResult> = {};
    
    Object.entries(fields).forEach(([fieldName, { value, rules }]) => {
      const result = validateField(fieldName, value, rules);
      results[fieldName] = result;
      if (!result.isValid) {
        allValid = false;
      }
    });
    
    setValidationResults(results);
    return allValid;
  }, [validateField]);

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationResults(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    } else {
      setValidationResults({});
    }
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return validationResults[fieldName]?.errors[0];
  }, [validationResults]);

  const isFieldValid = useCallback((fieldName: string): boolean => {
    return validationResults[fieldName]?.isValid ?? true;
  }, [validationResults]);

  return {
    validateField,
    validateFields,
    clearValidation,
    getFieldError,
    isFieldValid,
    validationResults
  };
}