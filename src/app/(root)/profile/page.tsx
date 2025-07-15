"use client";
import { useAuth, Loader } from "@/hooks/useAuth";
import ClientProfile from "./_views/ClientProfile";
import StudentProfile from "./_views/StudentProfile";
import { transformClientData, transformStudentData } from "@/utils/profile";
import { useGetMeQuery, useGetClientMeQuery } from "@/features/api/apiSlice";
import UnauthorizedPage from "@/app/unauthorized/page";

export default function ProfilePage() {
  const { user, isAuthenticated, showLoader, refresh } = useAuth();

  // Always call hooks at the top level
  const { data: liveUser } = useGetMeQuery();
  const { data: liveClientUser } = useGetClientMeQuery();

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

  // Show appropriate profile based on user role
  if (user.role === "client") {
    const clientData = transformClientData(liveClientUser || user);
    return <ClientProfile user={clientData} onProfileUpdate={refresh} />;
  } else if (user.role === "freelancer") {
    const studentData = transformStudentData(liveUser || user);
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