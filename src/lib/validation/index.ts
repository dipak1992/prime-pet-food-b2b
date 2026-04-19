export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export const validators = {
  email: (value: string): ValidationError | null => {
    if (!value) return { field: "email", message: "Email is required" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { field: "email", message: "Invalid email format" };
    }
    return null;
  },

  required: (value: any, fieldName: string): ValidationError | null => {
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      return { field: fieldName, message: `${fieldName} is required` };
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): ValidationError | null => {
    if (value && value.length < min) {
      return { field: fieldName, message: `${fieldName} must be at least ${min} characters` };
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): ValidationError | null => {
    if (value && value.length > max) {
      return { field: fieldName, message: `${fieldName} must not exceed ${max} characters` };
    }
    return null;
  },

  phone: (value: string): ValidationError | null => {
    if (!value) return null;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      return { field: "phone", message: "Invalid phone format" };
    }
    return null;
  },

  url: (value: string): ValidationError | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return { field: "url", message: "Invalid URL format" };
    }
  },

  number: (value: any, fieldName: string): ValidationError | null => {
    if (value === null || value === undefined || value === "") return null;
    if (isNaN(value)) {
      return { field: fieldName, message: `${fieldName} must be a number` };
    }
    return null;
  },
};

export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ((value: any) => ValidationError | null)[]>
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors.push(error);
        break; // Stop checking other rules for this field
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
