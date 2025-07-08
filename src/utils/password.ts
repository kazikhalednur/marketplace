// Utility functions for password strength and generation

export function checkStrength(password: string): 'Weak' | 'Medium' | 'Strong' | '' {
  if (!password) return '';
  if (password.length < 6) return 'Weak';
  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password)) return 'Strong';
  if (password.length >= 8) return 'Medium';
  return 'Weak';
}

export function generatePassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
} 