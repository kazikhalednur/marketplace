import type { RegisterOptions } from 'react-hook-form';

export interface JobFormValues {
  title: string;
  description: string;
  tags: string[];
  category: string;
  skills: string[];
  is_fixed: boolean;
  duration: string;
  min_budget: string;
  max_budget: string;
  experience_level: string;
  min_proposal_count: number;
  max_proposal_count: number | string;
  status: string;
}

const positiveNumber = (value: string, label: string) => {
  const n = Number(value);
  if (value === '' || value === undefined || Number.isNaN(n)) {
    return `${label} is required`;
  }
  if (n <= 0) {
    return `${label} must be greater than 0`;
  }
  return true;
};

export const jobTitleRules: RegisterOptions<JobFormValues, 'title'> = {
  required: 'Job title is required',
  minLength: { value: 3, message: 'Title must be at least 3 characters' },
  maxLength: { value: 200, message: 'Title must be at most 200 characters' },
};

export const jobDescriptionRules: RegisterOptions<JobFormValues, 'description'> = {
  required: 'Description is required',
  minLength: { value: 20, message: 'Description must be at least 20 characters' },
};

export const jobCategoryRules: RegisterOptions<JobFormValues, 'category'> = {
  required: 'Category is required',
};

export const jobSkillsRules: RegisterOptions<JobFormValues, 'skills'> = {
  validate: (value: string[]) =>
    (Array.isArray(value) && value.length > 0) || 'At least one skill is required',
};

export const jobDurationRules: RegisterOptions<JobFormValues, 'duration'> = {
  required: 'Duration is required',
  minLength: { value: 2, message: 'Duration must be at least 2 characters' },
};

export const jobMinBudgetRules: RegisterOptions<JobFormValues, 'min_budget'> = {
  required: 'Min budget is required',
  validate: (value) => positiveNumber(value, 'Min budget'),
};

export const jobMaxBudgetRules: RegisterOptions<JobFormValues, 'max_budget'> = {
  validate: (value, formValues) => {
    if (formValues.is_fixed) {
      return true;
    }
    const maxResult = positiveNumber(value, 'Max budget');
    if (maxResult !== true) {
      return maxResult;
    }
    const min = Number(formValues.min_budget);
    const max = Number(value);
    if (!Number.isNaN(min) && max <= min) {
      return 'Max budget must be greater than min budget';
    }
    return true;
  },
};

export const jobExperienceLevelRules: RegisterOptions<JobFormValues, 'experience_level'> = {
  required: 'Experience level is required',
};

export const jobMinProposalRules: RegisterOptions<JobFormValues, 'min_proposal_count'> = {
  required: 'Min proposals is required',
  validate: (value) => {
    const n = Number(value);
    if (Number.isNaN(n) || n < 1) {
      return 'Min proposals must be at least 1';
    }
    return true;
  },
};

export const jobMaxProposalRules: RegisterOptions<JobFormValues, 'max_proposal_count'> = {
  required: 'Max proposals is required',
  validate: (value, formValues) => {
    const n = Number(value);
    if (value === '' || Number.isNaN(n)) {
      return 'Max proposals is required';
    }
    if (n < 1) {
      return 'Max proposals must be at least 1';
    }
    const min = Number(formValues.min_proposal_count);
    if (!Number.isNaN(min) && n <= min) {
      return 'Max proposals must be greater than min proposals';
    }
    return true;
  },
};

export const jobStatusRules: RegisterOptions<JobFormValues, 'status'> = {
  required: 'Status is required',
};
