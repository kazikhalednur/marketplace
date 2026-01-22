"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Avatar from '@/components/ui/Avatar';
import { User, Linkedin, Twitter, Building2, CheckCircle2 } from 'lucide-react';
import Icon from '@/components/ui/Icon';
import { UserInfo } from '@/features/api/apiSlice';
import SendMessageButton from '@/components/chat/SendMessageButton';

interface ProfilePublicViewProps {
  user: UserInfo;
}

export default function ProfilePublicView({ user }: ProfilePublicViewProps) {
  // Helper to get user initials
  function getUserInitials() {
    const name = user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user.first_name || user.last_name || user.username;
    
    if (name && name.trim().length > 0) {
      return name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    return null;
  }

  // Helper to determine if avatar is real
  function hasRealAvatar() {
    if (!user?.avatar) return false;
    const avatarUrl = user.avatar.trim();
    if (!avatarUrl) return false;
    
    // Check if it's a placeholder
    const placeholderList = ["/avatar-placeholder.png", "/placeholder.png", "placeholder", "avatar-placeholder"];
    const isPlaceholder = placeholderList.some(placeholder => 
      avatarUrl.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    // Check if it's a valid URL
    const isValidUrl = avatarUrl.startsWith('http://') || 
                      avatarUrl.startsWith('https://') || 
                      avatarUrl.startsWith('/') ||
                      avatarUrl.startsWith('data:') ||
                      avatarUrl.includes('.jpg') ||
                      avatarUrl.includes('.jpeg') ||
                      avatarUrl.includes('.png') ||
                      avatarUrl.includes('.gif') ||
                      avatarUrl.includes('.webp') ||
                      avatarUrl.includes('blob:') ||
                      avatarUrl.includes('gravatar') ||
                      avatarUrl.includes('cloudinary') ||
                      avatarUrl.includes('amazonaws') ||
                      avatarUrl.includes('googleusercontent');
    
    return !isPlaceholder && isValidUrl;
  }

  // Helper to get display name
  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || user.last_name || user.username;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {hasRealAvatar() && user.avatar ? (
                  <Avatar 
                    src={user.avatar} 
                    name={getDisplayName()} 
                    size={80} 
                    className="w-20 h-20 border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                    {getUserInitials() || 'U'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">{getDisplayName()}</CardTitle>
                <p className="text-muted-foreground">@{user.username}</p>
                <Badge variant="secondary" className="mt-1">
                  {user.role === 'client' ? 'Client' : 'Freelancer'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SendMessageButton 
                username={user.username}
                profilePicture={hasRealAvatar() ? user.avatar : undefined}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          {user.bio ? (
            <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">No bio available</p>
              <p className="text-sm text-muted-foreground">
                This user hasn&apos;t added a bio yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      {user.skills && user.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon={User} size={20} />
            Public Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.company_name && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Icon icon={Building2} size={16} className="text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{user.company_name}</p>
                </div>
              </div>
            )}

            {user.linkedin && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Icon icon={Linkedin} size={16} className="text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">LinkedIn</p>
                  <a 
                    href={user.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            )}

            {user.twitter && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Icon icon={Twitter} size={16} className="text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Twitter</p>
                  <a 
                    href={user.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    @{user.twitter.split('/').pop()}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Status (Public) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon={CheckCircle2} size={20} />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Email Verified</p>
                <p className="text-xs text-muted-foreground">
                  {user.email_verified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Phone Verified</p>
                <p className="text-xs text-muted-foreground">
                  {user.is_phone_verified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Payment Verified</p>
                <p className="text-xs text-muted-foreground">
                  {user.is_payment_verified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Interested in working together?</h3>
            <p className="text-muted-foreground mb-4">
              Send a message to start a conversation and discuss potential collaboration.
            </p>
            <SendMessageButton 
              username={user.username}
              profilePicture={hasRealAvatar() ? user.avatar : undefined}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 