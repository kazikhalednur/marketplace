"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetMyMeetingsQuery } from "@/features/api/meetingsApi";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  Clock,
  User,
  Video,
  Loader2,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UnauthorizedPage from "@/app/unauthorized/page";
import Link from "next/link";

export default function MeetingsPage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const router = useRouter();
  const isClient = user?.role === "client";
  const [meetingsPage, setMeetingsPage] = useState(1);
  const [meetingsPageSize] = useState(10);

  const {
    data: myMeetingsData,
    isLoading: isLoadingMeetings,
    isError: isMeetingsError,
  } = useGetMyMeetingsQuery({
    page: meetingsPage,
    page_size: meetingsPageSize,
  });

  const myMeetings = myMeetingsData?.results || [];
  const meetingsTotalCount = myMeetingsData?.count || 0;
  const meetingsHasNext = !!myMeetingsData?.next;
  const meetingsHasPrevious = !!myMeetingsData?.previous;
  const meetingsTotalPages = Math.ceil(meetingsTotalCount / meetingsPageSize);

  if (showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <UnauthorizedPage />;
  }

  const handleJoinMeeting = (roomName: string) => {
    router.push(`/meeting/${roomName}`);
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meetings</h1>
        <p className="text-muted-foreground">
          {isClient
            ? "View and join your meetings, or create new ones with your freelancers"
            : "View and join your meetings"}
        </p>
      </div>

      {/* My Meetings List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My Meetings</h2>
        {isLoadingMeetings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isMeetingsError ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">
                Failed to load meetings. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : !myMeetings || myMeetings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No meetings found.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      {meeting.topic}
                    </CardTitle>
                    <CardDescription>
                      Room: {meeting.room_name} • {meeting.job_title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDateTime(
                            meeting.start_date,
                            meeting.start_time
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Duration: {meeting.duration} minutes
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {isClient
                            ? `With: ${meeting.guest}`
                            : `Created by: ${meeting.created_by}`}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinMeeting(meeting.room_name)}
                      className="w-full"
                      variant="default"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Pagination for Meetings */}
            {meetingsTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMeetingsPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!meetingsHasPrevious}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {meetingsPage} of {meetingsTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMeetingsPage((prev) =>
                      Math.min(meetingsTotalPages, prev + 1)
                    )
                  }
                  disabled={!meetingsHasNext}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {isClient && (
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> To create a new meeting, go to the{" "}
            <Link href="/contract" className="text-primary hover:underline">
              Contracts
            </Link>{" "}
            page and click "Create Meeting" on any active contract.
          </p>
        </div>
      )}
    </div>
  );
}
