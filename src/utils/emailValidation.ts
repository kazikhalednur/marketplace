// Email validation utility functions

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmailFormat = (email: string): EmailValidationResult => {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

export const validateEmailDomain = (email: string, acceptedDomains: string[]): EmailValidationResult => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Check if the domain is in the accepted domains list
  const isDomainAccepted = acceptedDomains.some(acceptedDomain => 
    domain === acceptedDomain.toLowerCase() || 
    domain.endsWith('.' + acceptedDomain.toLowerCase())
  );
  
  if (!isDomainAccepted) {
    return { 
      isValid: false, 
      error: `Email domain not accepted. Please use an email from an approved domain.` 
    };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string, acceptedDomains: string[]): EmailValidationResult => {
  // First check email format
  const formatValidation = validateEmailFormat(email);
  if (!formatValidation.isValid) {
    return formatValidation;
  }
  
  // Then check domain if domains are provided
  if (acceptedDomains && acceptedDomains.length > 0) {
    const domainValidation = validateEmailDomain(email, acceptedDomains);
    if (!domainValidation.isValid) {
      return domainValidation;
    }
  }
  
  return { isValid: true };
}; 