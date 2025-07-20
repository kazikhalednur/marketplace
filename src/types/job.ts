export interface JobCreator {
  full_name: string;
  is_payment_verified?: boolean | null;
  date_joined?: string;
}

export interface JobDetail {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category?: string | { name: string; slug: string };
  skills?: { name: string; slug: string }[];
  currency?: string;
  min_budget?: number | string;
  max_budget?: number | string;
  is_fixed?: boolean;
  duration?: string;
  experience_level?: string;
  status?: string;
  min_proposal_count?: number;
  max_proposal_count?: number;
  created_by?: JobCreator;
  created_at?: string;
  is_applied?: boolean;
}

export interface DropdownCategory {
  id: number;
  name: string;
  slug: string;
  skills?: DropdownSkill[];
}

export interface DropdownSkill {
  id: number;
  name: string;
  slug: string;
}

export interface DropdownExperienceLevel {
  label: string;
  value: string;
}

export interface DropdownStatus {
  label: string;
  value: string;
} 