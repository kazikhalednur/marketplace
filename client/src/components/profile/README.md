# Profile Components

This directory contains components for displaying user profiles with different views based on whether the user is viewing their own profile or someone else's.

## Components

### ProfileOwnerView
Displays the full profile view for the profile owner with:
- Complete contact information (email, phone, company)
- Edit profile functionality
- Verification status details
- All profile sections

### ProfilePublicView
Displays a limited profile view for visitors with:
- Public information only (company, social links)
- Message functionality
- Verification status (public view)
- Call-to-action for messaging

## API Endpoints

The profile system uses RTK Query for API calls:

**Single Profile API**: `/accounts/info/{username}/`

The response body structure depends on the user's role:
- **Freelancer**: Returns freelancer-specific fields
- **Client**: Returns client-specific fields

## Owner/Visitor Logic

The system determines if a user is viewing their own profile by comparing:
- Current user's username from Redux store
- Profile username from URL

If they match → **Owner View** (ProfileOwnerView)
If they don't match → **Visitor View** (ProfilePublicView)

## Usage

```tsx
import { useProfile } from '@/hooks/useProfile';
import ProfileOwnerView from '@/components/profile/ProfileOwnerView';
import ProfilePublicView from '@/components/profile/ProfilePublicView';

function ProfilePage({ username }) {
  const { user, loading, error, isOwnProfile } = useProfile(username);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <div>
      {isOwnProfile ? (
        <ProfileOwnerView user={user} />
      ) : (
        <ProfilePublicView user={user} />
      )}
    </div>
  );
}
```

## Features

- **Responsive Design**: Works on mobile and desktop
- **Avatar Support**: Handles real avatars and fallback initials
- **Verification Status**: Shows email, phone, and payment verification
- **Social Links**: LinkedIn and Twitter integration
- **Messaging**: Direct messaging functionality for visitors
- **Edit Functionality**: Profile editing for owners
- **Loading States**: Proper loading and error handling
- **Mock Data**: Fallback mock data for development
- **RTK Query**: Uses Redux Toolkit Query for API calls
- **Authentication**: Automatic token inclusion in headers

## Data Structure

```typescript
interface UserInfo {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  email_verified: boolean;
  is_google_login: boolean;
  student_id: string;
  avatar?: string;
  freelancer_sub_profiles: FreelancerSubProfile[];
  // Additional fields for profile display
  bio?: string;
  skills?: string[];
  company_name?: string;
  linkedin?: string;
  twitter?: string;
  about?: string;
  is_payment_verified?: boolean;
  is_phone_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}
```

## API Response Structure

The API `/accounts/info/{username}/` returns different response structures:

### For Freelancers:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "freelancer_username",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "freelancer",
    "avatar": "avatar_url",
    "bio": "Freelancer bio",
    "skills": ["React", "Node.js"],
    "phone": "+1234567890",
    "email_verified": true,
    "is_phone_verified": true,
    "is_payment_verified": true
  }
}
```

### For Clients:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "client_username",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "role": "client",
    "avatar": "avatar_url",
    "bio": "Client bio",
    "company_name": "Tech Solutions Inc.",
    "phone": "+1234567890",
    "email_verified": true,
    "is_phone_verified": true,
    "is_payment_verified": true
  }
}
```

## Implementation Details

- **RTK Query**: Uses `useGetProfileByUsernameQuery` for API calls
- **Authentication**: Automatic token inclusion via `fetchBaseQuery`
- **Caching**: Automatic caching and invalidation via RTK Query
- **Error Handling**: Built-in error handling and loading states
- **Type Safety**: Full TypeScript support with proper types 