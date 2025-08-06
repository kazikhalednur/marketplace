import { UserState } from '@/features/userSlice';
import { FreelancerEducation, FreelancerExperience, FreelancerProject, ClientProfileUpdatePayload, FreelancerProfileUpdatePayload } from '@/features/api/apiSlice';

interface ClientFormData {
  name?: string;
  bio?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  company_name?: string;
  phone?: string;
  avatar?: string;
}

interface FreelancerFormData {
  name?: string;
  about?: string;
  location?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  avatar?: string;
  skills?: string[];
  education?: Array<{
    id?: number | null;
    school?: string;
    degree?: string;
    start?: string;
    end?: string | null;
    is_present?: boolean;
  }>;
  experience?: Array<{
    id?: number | null;
    title?: string;
    company?: string;
    start?: string;
    end?: string | null;
    is_present?: boolean;
    description?: string;
    type?: string;
  }>;
  projects?: Array<{
    id?: number | null;
    name?: string;
    link?: string;
    description?: string;
  }>;
}

// Import from the new date utility
import { formatDateToFull } from './date';

// Transform API user data for ClientProfile
export function transformClientData(user: UserState) {
  return {
    avatar: user.avatar || undefined, // Use actual avatar if available
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Client User',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: 'Client',
    location: '', // Not provided in API
    email: user.email || '',
    website: '', // Not provided in API
    linkedin: user.linkedin || '',
    twitter: user.twitter || '',
    github: '', // Not provided in API
    bio: user.bio || '',
    skills: [], // No skills for clients
    projects: [], // Jobs will be fetched separately from API
    company_name: user.company_name || '',
    phone: user.phone || '',
    email_verified: user.email_verified || false,
    is_payment_verified: user.is_payment_verified || false,
    is_phone_verified: user.is_phone_verified || false,
    username: user.username || '',
    is_google_login: user.is_google_login || false,
    student_id: user.student_id || '',
  };
}

// Transform API user data for StudentProfile
export function transformStudentData(user: UserState) {
  // Get the first freelancer sub profile or create default
  const subProfile = user.freelancer_sub_profiles?.[0];
  
  return {
    avatar: user.avatar || undefined, // Use actual avatar from API response
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Student User',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: 'Freelancer',
    location: '', // Not provided in API
    email: user.email || '',
    website: subProfile?.portfolio || '',
    linkedin: subProfile?.linkedin || '',
    twitter: '', // Not provided in API
    github: subProfile?.github || '',
    about: subProfile?.bio || '', // No dummy data
    skills: [], // No dummy data
    education: subProfile?.educations?.map((edu: FreelancerEducation) => ({
      id: edu.id || null,
      school: edu.institution_name,
      degree: edu.degree,
      start: edu.start_date,
      end: edu.end_date,
      is_present: false, // Default to false, will be updated based on end_date being null
    })) || [], // No dummy data
    experience: subProfile?.experiences?.map((exp: FreelancerExperience) => ({
      id: exp.id || null,
      title: exp.job_title,
      company: exp.company_name,
      start: exp.start_date,
      end: exp.end_date,
      description: exp.description,
    })) || [], // No dummy data
    projects: subProfile?.projects?.map((proj: FreelancerProject) => ({
      id: proj.id || null,
      name: proj.title,
      link: proj.link,
      description: proj.description,
    })) || [], // No dummy data
  };
}

// Transform client form data to API payload
export function transformClientFormToPayload(form: ClientFormData, user: UserState): ClientProfileUpdatePayload {
  const [firstName, ...lastNameParts] = (form.name || '').trim().split(' ');
  const lastName = lastNameParts.join(' ') || '';
  
  const payload: ClientProfileUpdatePayload = {};
  
  if (firstName || user.first_name) payload.first_name = firstName || user.first_name || '';
  if (lastName || user.last_name) payload.last_name = lastName || user.last_name || '';
  if (user.username) payload.username = user.username;
  if (user.phone) payload.phone = user.phone;
  if (form.company_name || user.company_name) payload.company_name = form.company_name || user.company_name || '';
  if (form.twitter) payload.twitter = form.twitter;
  if (form.linkedin) payload.linkedin = form.linkedin;
  if (form.bio) payload.bio = form.bio;
  if (form.avatar || user.avatar) payload.avatar = form.avatar || user.avatar || null;
  
  return payload;
}

// Transform freelancer form data to API payload
export function transformFreelancerFormToPayload(form: FreelancerFormData, user: UserState): FreelancerProfileUpdatePayload {
  const [firstName, ...lastNameParts] = (form.name || '').trim().split(' ');
  const lastName = lastNameParts.join(' ') || '';
  
  const subProfile = user.freelancer_sub_profiles?.[0];
  
  const payload: FreelancerProfileUpdatePayload = {};
  
  if (firstName || user.first_name) payload.first_name = firstName || user.first_name || '';
  if (lastName || user.last_name) payload.last_name = lastName || user.last_name || '';
  if (user.username) payload.username = user.username;
  if (user.phone) payload.phone = user.phone;
  if (form.avatar || user.avatar) payload.avatar = form.avatar || user.avatar || null;
  
  // Only include freelancer_sub_profiles if there are changes or existing data
  if (subProfile || form.about || form.linkedin || form.github || form.website || form.experience?.length || form.education?.length || form.projects?.length) {
    payload.freelancer_sub_profiles = [{
      id: subProfile?.id || null,
      hours_per_week: subProfile?.hours_per_week || 0,
      is_more_available: subProfile?.is_more_available || true,
      hour_rate: subProfile?.hour_rate || '0',
      bio: form.about || subProfile?.bio || '',
      linkedin: form.linkedin || subProfile?.linkedin || '',
      github: form.github || subProfile?.github || '',
      portfolio: form.website || subProfile?.portfolio || '',
      skills: [], // Skills are handled separately, using IDs
      projects: form.projects?.map((project) => ({
        id: project.id || null, // Use existing ID or null for new projects
        title: project.name || '',
        link: project.link || '',
        description: project.description || '',
      })) || [],
      experiences: form.experience?.map((exp) => ({
        id: exp.id || null, // Use existing ID or null for new experiences
        job_title: exp.title || '',
        company_name: exp.company || '',
        start_date: formatDateToFull(exp.start || ''),
        end_date: exp.is_present ? null : (exp.end ? formatDateToFull(exp.end) : null),
        is_present: exp.is_present || false,
        description: exp.description || '',
      })) || [],
      educations: form.education?.map((edu) => ({
        id: edu.id || null, // Use existing ID or null for new educations
        institution_name: edu.school || '',
        degree: edu.degree || '',
        start_date: formatDateToFull(edu.start || ''),
        end_date: edu.is_present ? null : formatDateToFull(edu.end || ''),
      })) || [],
    }];
  }
  
  return payload;
} 