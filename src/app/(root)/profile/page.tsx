"use client";
import { useAuth, Loader } from "@/hooks/useAuth";
import ClientProfile from "./_views/ClientProfile";
import StudentProfile from "./_views/StudentProfile";
import { transformClientData, transformStudentData } from "@/utils/profile";

export default function ProfilePage() {
  const { user, isAuthenticated, showLoader, refresh } = useAuth();

  // Show loader while checking authentication
  if (showLoader) {
    return <Loader />;
  }

  // Show access denied only after authentication check is complete and user is not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
              <rect width="64" height="64" rx="16" fill="#f3f4f6" />
              <path d="M12 32l8 8 16-16" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-xl font-semibold text-red-600 mb-2">Access Denied</div>
            <div className="text-sm text-muted-foreground text-center">
              Please log in to view your profile.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Show appropriate profile based on user role
  if (user.role === "client") {
    const clientData = transformClientData(user);
    return <ClientProfile user={clientData} onProfileUpdate={refresh} />;
  } else if (user.role === "freelancer") {
    const studentData = transformStudentData(user);
    return <StudentProfile user={studentData} onProfileUpdate={refresh} />;
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
            Your account has an invalid role. Please contact support.
          </div>
        </div>
      </div>
    </main>
  );
} 