export interface Experience {
  id?: number | null;
  company?: string;
  title?: string;
  type?: string;
  start?: string;
  end?: string | null;
  is_present?: boolean;
  description?: string;
}

export interface Education {
  id?: number | null;
  school: string;
  degree: string;
  start: string;
  end: string | null;
  is_present?: boolean;
}

export interface User {
  avatar?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  about?: string;
  bio?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  company_name?: string;
  phone?: string;
  email_verified?: boolean;
  is_payment_verified?: boolean;
  is_phone_verified?: boolean;
  is_google_login?: boolean;
  username?: string;
  student_id?: string;
  projects?: Array<{ name: string; link: string; description: string }>;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  location?: string;
  github?: string;
} 