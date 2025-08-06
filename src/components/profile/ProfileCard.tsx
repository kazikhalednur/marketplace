"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Avatar from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/badge';
import SendMessageButton from '@/components/chat/SendMessageButton';

interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    user_type: 'client' | 'freelancer';
    avatar?: string;
    bio?: string;
    skills?: string[];
  };
  isOwnProfile?: boolean;
}

export default function ProfileCard({ user, isOwnProfile = false }: ProfileCardProps) {
  // Use the static room name as specified
  const roomName = "E17BC782D6674758BE6D5BC920B1965B";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar 
            src={user.avatar} 
            name={user.name} 
            size={96} 
            className="w-24 h-24"
          />
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-2">
              {user.user_type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {user.bio && (
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{user.bio}</p>
          </div>
        )}
        
        {user.skills && user.skills.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {!isOwnProfile && (
          <div className="flex flex-col items-center pt-4 space-y-2">
            <SendMessageButton
              username={user.name}
              profilePicture={user.avatar}
            />
            <p className="text-xs text-muted-foreground">
              Room: {roomName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 