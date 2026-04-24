import { useState, useCallback } from 'react';

const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  },
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },
  isEmail: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email address';
    }
    return null;
  },
  passwordStrength: (value) => {
    if (!value) return null;
    const errors = [];
    if (value.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(value)) errors.push('an uppercase letter');
    if (!/[a-z]/.test(value)) errors.push('a lowercase letter');
    if (!/[0-9]/.test(value)) errors.push('a number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) errors.push('a special character');
    if (errors.length > 0) {
      return `Password needs ${errors.join(', ')}`;
    }
    return null;
  }
};

const useFormValidation = (rules = {}) => {
  const [errors, setErrors] = useState({});

  const validate = useCallback((data) => {
    const newErrors = {};
    let isValid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        let validatorFn;
        if (typeof rule === 'string') {
          validatorFn = validators[rule];
        } else if (typeof rule === 'function') {
          validatorFn = rule;
        } else if (rule.type && rule.value !== undefined) {
          validatorFn = validators[rule.type](rule.value);
        }

        if (validatorFn) {
          const error = validatorFn(data[field]);
          if (error) {
            newErrors[field] = error;
            isValid = false;
            break;
          }
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearErrors };
};

export { validators };
export default useFormValidation;
