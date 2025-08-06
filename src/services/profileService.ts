import { logApi } from '@/utils/logger';
import Cookies from 'js-cookie';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  user_type: 'client' | 'freelancer';
  avatar?: string;
  bio?: string;
  skills?: string[];
  created_at: string;
  updated_at: string;
  // Additional fields for different user types
  phone?: string;
  company_name?: string;
  linkedin?: string;
  twitter?: string;
  about?: string;
  is_payment_verified?: boolean;
  is_phone_verified?: boolean;
  email_verified?: boolean;
}

export interface ProfileResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserProfile;
}

class ProfileService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cpchub.diu.edu.bd:8443';

  // Helper method to get authentication headers
  private getAuthHeaders() {
    const token = Cookies.get('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generate unique username from email or name
  generateUniqueUsername(email: string, name?: string): string {
    const baseName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : email.split('@')[0];
    const timestamp = Date.now().toString().slice(-4);
    return `${baseName}_${timestamp}`;
  }

  // Generate unique profile URL
  generateProfileUrl(username: string): string {
    return `/profile/${username}`;
  }

  async getUserProfile(username: string): Promise<UserProfile> {
    try {
      logApi('Fetching user profile for username:', username);
      
      // Use the single API endpoint that returns different structures based on user role
      const response = await fetch(`${this.baseUrl}/api/accounts/info/${username}/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data: unknown = await response.json();
      const userData = (data as { data: Record<string, unknown> }).data;
      logApi('Profile data received:', userData);

      // Map API response to UserProfile interface
      // The response structure depends on the user's role
      const mappedProfile: UserProfile = {
        id: (userData.id as string) || `user_${username}`,
        username: (userData.username as string) || username,
        name: (userData.first_name as string) && (userData.last_name as string)
          ? `${userData.first_name as string} ${userData.last_name as string}`
          : (userData.first_name as string) || (userData.last_name as string) || username,
        email: userData.email as string,
        user_type: (userData.role as string) === 'client' ? 'client' : 'freelancer',
        avatar: (userData.avatar as string) || '',
        bio: (userData.bio as string) || (userData.about as string) || '',
        skills: (userData.skills as string[]) || [],
        created_at: (userData.created_at as string) || new Date().toISOString(),
        updated_at: (userData.updated_at as string) || new Date().toISOString(),
        phone: userData.phone as string | undefined,
        company_name: userData.company_name as string | undefined,
        linkedin: userData.linkedin as string | undefined,
        twitter: userData.twitter as string | undefined,
        about: userData.about as string | undefined,
        is_payment_verified: userData.is_payment_verified as boolean | undefined,
        is_phone_verified: userData.is_phone_verified as boolean | undefined,
        email_verified: userData.email_verified as boolean | undefined,
      };

      logApi('Mapped profile data:', mappedProfile);
      return mappedProfile;
    } catch (error) {
      logApi('Error fetching user profile:', error);
      // Return mock data for development
      return this.getMockUserProfile(username);
    }
  }

  // Get profile by username (for visitors) - uses the same API
  async getProfileByUsername(username: string): Promise<UserProfile> {
    try {
      logApi('Fetching profile by username:', username);
      
      // Use the same API endpoint for visitor profiles
      const response = await fetch(`${this.baseUrl}/api/accounts/info/${username}/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data: unknown = await response.json();
      const userData = (data as { data: Record<string, unknown> }).data;
      
      const mappedProfile: UserProfile = {
        id: (userData.id as string) || `user_${username}`,
        username: (userData.username as string) || username,
        name: (userData.first_name as string) && (userData.last_name as string)
          ? `${userData.first_name as string} ${userData.last_name as string}`
          : (userData.first_name as string) || (userData.last_name as string) || username,
        email: userData.email as string,
        user_type: (userData.role as string) === 'client' ? 'client' : 'freelancer',
        avatar: (userData.avatar as string) || '',
        bio: (userData.bio as string) || (userData.about as string) || '',
        skills: (userData.skills as string[]) || [],
        created_at: (userData.created_at as string) || new Date().toISOString(),
        updated_at: (userData.updated_at as string) || new Date().toISOString(),
        phone: userData.phone as string | undefined,
        company_name: userData.company_name as string | undefined,
        linkedin: userData.linkedin as string | undefined,
        twitter: userData.twitter as string | undefined,
        about: userData.about as string | undefined,
        is_payment_verified: userData.is_payment_verified as boolean | undefined,
        is_phone_verified: userData.is_phone_verified as boolean | undefined,
        email_verified: userData.email_verified as boolean | undefined,
      };

      logApi('Profile by username data:', mappedProfile);
      return mappedProfile;
    } catch (error) {
      logApi('Error fetching profile by username:', error);
      return this.getMockUserProfile(username);
    }
  }

  private getMockUserProfile(username: string): UserProfile {
    // Generate a more realistic mock profile based on username
    const mockProfiles = {
      'john_doe': {
        id: 'user_1',
        username: 'john_doe',
        name: 'John Doe',
        email: 'john.doe@example.com',
        user_type: 'freelancer' as const,
        avatar: '',
        bio: 'Experienced web developer with 5+ years of experience in React, Node.js, and TypeScript. Passionate about creating beautiful and functional web applications.',
        skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS'],
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-08-04T18:00:00Z',
        phone: '+1234567890',
        email_verified: true,
        is_phone_verified: true,
        is_payment_verified: true,
      },
      'jane_smith': {
        id: 'user_2',
        username: 'jane_smith',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        user_type: 'client' as const,
        avatar: '',
        bio: 'Project manager with expertise in agile methodologies and team leadership. Looking for talented developers to join our projects.',
        skills: ['Project Management', 'Agile', 'Scrum', 'Team Leadership'],
        created_at: '2024-02-20T14:45:00Z',
        updated_at: '2024-08-04T17:30:00Z',
        company_name: 'Tech Solutions Inc.',
        phone: '+1234567891',
        email_verified: true,
        is_phone_verified: true,
        is_payment_verified: true,
      },
      'alex_wilson': {
        id: 'user_3',
        username: 'alex_wilson',
        name: 'Alex Wilson',
        email: 'alex.wilson@example.com',
        user_type: 'freelancer' as const,
        avatar: '',
        bio: 'Full-stack developer specializing in modern web technologies. Love working with React, Python, and cloud platforms.',
        skills: ['React', 'Python', 'Django', 'AWS', 'Docker'],
        created_at: '2024-03-10T09:15:00Z',
        updated_at: '2024-08-04T16:45:00Z',
        phone: '+1234567892',
        email_verified: true,
        is_phone_verified: true,
        is_payment_verified: true,
      },
      'sarah_jones': {
        id: 'user_4',
        username: 'sarah_jones',
        name: 'Sarah Jones',
        email: 'sarah.jones@example.com',
        user_type: 'client' as const,
        avatar: '',
        bio: 'Startup founder looking for innovative developers to help build the next big thing. Focus on mobile and web applications.',
        skills: ['Product Management', 'UI/UX', 'Business Strategy'],
        created_at: '2024-04-05T11:20:00Z',
        updated_at: '2024-08-04T15:20:00Z',
        company_name: 'Innovation Labs',
        phone: '+1234567893',
        email_verified: true,
        is_phone_verified: true,
        is_payment_verified: true,
      },
    };

    // If we have a mock profile for this username, return it
    if (mockProfiles[username as keyof typeof mockProfiles]) {
      return mockProfiles[username as keyof typeof mockProfiles];
    }

    // Generate a new mock profile for unknown usernames
    return {
      id: `user_${username}_${Date.now()}`,
      username: username,
      name: username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      email: `${username}@example.com`,
      user_type: 'freelancer',
      avatar: '',
      bio: `This is the profile page for ${username}. Experienced professional with expertise in various technologies. Passionate about creating innovative solutions and helping clients achieve their goals.`,
      skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS', 'Python', 'Django'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      phone: '+1234567890',
      email_verified: true,
      is_phone_verified: true,
      is_payment_verified: true,
    };
  }

  async updateUserProfile(username: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      logApi('Updating user profile for username:', username);
      
      const response = await fetch(`${this.baseUrl}/api/users/${username}/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const data: ProfileResponse = await response.json();
      logApi('Profile updated successfully:', data);

      return data.data;
    } catch (error) {
      logApi('Error updating user profile:', error);
      throw error;
    }
  }

  // Get all available mock usernames for testing
  getMockUsernames(): string[] {
    return ['john_doe', 'jane_smith', 'alex_wilson', 'sarah_jones'];
  }
}

export const profileService = new ProfileService(); 