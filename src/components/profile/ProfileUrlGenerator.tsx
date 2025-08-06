"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink } from 'lucide-react';
import { profileService } from '@/services/profileService';

export default function ProfileUrlGenerator() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  const generateUniqueUrl = () => {
    if (!email && !name) return;

    const username = profileService.generateUniqueUsername(email, name);
    const url = profileService.generateProfileUrl(username);
    
    setGeneratedUsername(username);
    setProfileUrl(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Generate Unique Profile URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Name (Optional)</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>

        <Button 
          onClick={generateUniqueUrl} 
          disabled={!email && !name}
          className="w-full"
        >
          Generate Unique URL
        </Button>

        {generatedUsername && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Generated Username:</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-background px-2 py-1 rounded flex-1">
                  {generatedUsername}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(generatedUsername)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Profile URL:</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-background px-2 py-1 rounded flex-1">
                  {profileUrl}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(profileUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(profileUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Profile
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          <p>Each user gets a unique profile URL based on their email and name.</p>
          <p>Example: john.doe@example.com → john_1234 → /profile/john_1234</p>
        </div>
      </CardContent>
    </Card>
  );
} 