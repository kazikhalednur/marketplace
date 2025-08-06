# Unique Profile URL System

This directory contains the unique profile system implementation with username-based routing.

## Features

- ✅ **Unique Profile URLs**: `/profile/[username]` - Each user has a unique profile page
- ✅ **Username Generation**: Automatic unique username generation from email/name
- ✅ **Dynamic Profile Loading**: Fetches user data based on username
- ✅ **Profile Service**: Centralized service for profile management
- ✅ **Error Handling**: Graceful handling of missing profiles
- ✅ **Loading States**: Proper loading indicators
- ✅ **Messaging Integration**: Send message button on profiles
- ✅ **Dual Views**: Owner view (editable) and visitor view (read-only)

## URL Structure

```
/profile/[username]  - Individual user profile page
```

## Unique URL Generation

### How it Works:

1. **Username Generation**: When a user registers, a unique username is generated
   ```
   Email: john.doe@example.com
   Name: John Doe
   Generated Username: john_1234
   ```

2. **Profile URL**: Each username gets a unique profile URL
   ```
   Username: john_1234
   Profile URL: /profile/john_1234
   ```

3. **Public Access**: Anyone can visit these URLs
   ```
   https://example.com/profile/john_1234
   ```

## Examples

### Mock Users (for testing):
- `/profile/john_doe` - John Doe's profile
- `/profile/jane_smith` - Jane Smith's profile  
- `/profile/alex_wilson` - Alex Wilson's profile
- `/profile/sarah_jones` - Sarah Jones's profile

### Generated URLs:
- `/profile/john_1234` - Generated from john.doe@example.com
- `/profile/jane_5678` - Generated from jane.smith@example.com
- `/profile/alex_9012` - Generated from alex.wilson@example.com

## Components

### Pages
- `[username]/page.tsx` - Dynamic profile page with dual views

### Services
- `../../services/profileService.ts` - Profile data management with URL generation

### Components
- `../../components/profile/ProfileCard.tsx` - Profile display component

## Usage

### 1. Generate Unique Username

```tsx
import { profileService } from '@/services/profileService';

// Generate unique username from email and name
const username = profileService.generateUniqueUsername('john.doe@example.com', 'John Doe');
// Result: "john_1234"
```

### 2. Generate Profile URL

```tsx
// Generate profile URL from username
const profileUrl = profileService.generateProfileUrl('john_1234');
// Result: "/profile/john_1234"
```

### 3. Accessing a Profile

```tsx
// Navigate to a user's profile
router.push('/profile/john_1234');
```

## API Integration

The system integrates with the backend API:

- `GET /api/users/{username}/profile` - Fetch user profile
- `PUT /api/users/{username}/profile` - Update user profile

## Mock Data

For development, the system provides mock data when API calls fail:

- **Mock Users**: john_doe, jane_smith, alex_wilson, sarah_jones
- **Mock Skills**: React, TypeScript, Node.js, Next.js, Tailwind CSS
- **Mock Bios**: Generated based on username

## Testing

1. **Visit `/profile/john_doe`** - Test individual profile page
2. **Click "Send Message"** - Test messaging integration
3. **Try invalid usernames** - Test error handling
4. **Test dual views** - View your own profile vs. others' profiles

## Future Enhancements

- [ ] Custom username selection during registration
- [ ] Username availability checking
- [ ] Profile URL customization
- [ ] Profile privacy settings
- [ ] Profile verification badges
- [ ] Profile analytics
- [ ] Profile sharing links
- [ ] SEO optimization for profile URLs 