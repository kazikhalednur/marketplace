"use client";
import { useAuth, Loader } from "@/hooks/useAuth";
import ClientProfile from "./_views/ClientProfile";
import StudentProfile from "./_views/StudentProfile";
import { transformClientData, transformStudentData } from "@/utils/profile";
import { useGetProfileByUsernameQuery } from "@/features/api/apiSlice";
import UnauthorizedPage from "@/app/unauthorized/page";
import { useParams, useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  // Get profile data for the visited username
  const { data: profileData, isLoading: profileLoading, error, refetch } = useGetProfileByUsernameQuery(username);

  // Show loader while checking authentication
  if (showLoader) {
    return <Loader />;
  }

  // Show access denied only after authentication check is complete and user is not authenticated
  if (!isAuthenticated) {
    return (
      <UnauthorizedPage />
    );
  }

  // Show loader while fetching profile data
  if (profileLoading) {
    return <Loader />;
  }

  // Show error if profile not found
  if (error || !profileData) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
              <rect width="64" height="64" rx="16" fill="#f3f4f6" />
              <path d="M12 32l8 8 16-16" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-xl font-semibold text-red-600 mb-2">Profile Not Found</div>
            <div className="text-sm text-muted-foreground text-center">
              The profile you&apos;re looking for doesn&apos;t exist or has been removed.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Check if current user is the profile owner
  const isOwner = user.username === username;

  // Show appropriate profile based on user role
  if (profileData.role === "client") {
    const clientData = transformClientData(profileData);
    return (
      <ClientProfile 
        user={clientData} 
        onProfileUpdate={() => refetch()} 
        isOwner={isOwner}
        onSendMessage={() => router.push('/messages')}
      />
    );
  } else if (profileData.role === "freelancer") {
    const studentData = transformStudentData(profileData);
    return (
      <StudentProfile 
        user={studentData} 
        onProfileUpdate={() => refetch()} 
        isOwner={isOwner}
        onSendMessage={() => router.push('/messages')}
      />
    );
  }

  // Fallback for unknown roles
  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16">
          <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
            <rect width="64" height="64" rx="16" fill="#f3f4f6" />
            <path d="M12 32l8 8 16-16" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="text-xl font-semibold text-red-600 mb-2">Invalid Role</div>
          <div className="text-sm text-muted-foreground text-center">
            This profile has an invalid role. Please contact support.
          </div>
        </div>
      </div>
    </main>
  );
} 