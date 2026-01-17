"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { useGetFreelancerListQuery, useGetMyMeetingsQuery, useCreateMeetingMutation } from "@/features/api/meetingsApi";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, User, Video, Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UnauthorizedPage from "@/app/unauthorized/page";
import { skipToken } from "@reduxjs/toolkit/query";

export default function MeetingsPage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    topic: "",
    duration: 60,
    start_date: "",
    start_time: "",
  });

  const isClient = user?.role === "client";
  
  const { data: freelancerList, isLoading: isLoadingFreelancers, isError: isFreelancerError } = useGetFreelancerListQuery(
    isClient ? undefined : skipToken
  );
  const { data: myMeetings, isLoading: isLoadingMeetings, isError: isMeetingsError } = useGetMyMeetingsQuery();
  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();

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

  const handleCreateMeeting = async () => {
    if (!selectedFreelancer) {
      showToast({ type: "error", message: "Please select a freelancer" });
      return;
    }

    if (!formData.topic || !formData.start_date || !formData.start_time) {
      showToast({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    try {
      const result = await createMeeting({
        ...formData,
        guest_username: selectedFreelancer,
      }).unwrap();

      showToast({ type: "success", message: "Meeting created successfully!" });
      setCreateModalOpen(false);
      setFormData({ topic: "", duration: 60, start_date: "", start_time: "" });
      setSelectedFreelancer(null);
      
      // The page will automatically refresh to show the new meeting in the list
      // No redirect needed since we're already on the meetings page
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.data?.message || "Failed to create meeting"
      });
    }
  };

  const handleSelectFreelancer = (username: string) => {
    setSelectedFreelancer(username);
    setCreateModalOpen(true);
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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
              <p className="text-destructive">Failed to load meetings. Please try again.</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myMeetings.map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    {meeting.topic}
                  </CardTitle>
                  <CardDescription>
                    Room: {meeting.room_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatDateTime(meeting.start_date, meeting.start_time)}
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
                          ? `With: ${meeting.guest_name}`
                          : `Created by: ${meeting.created_by_name}`}
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
        )}
      </div>

      {/* Create Meeting Section (Only for Clients) */}
      {isClient && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Create New Meeting</h2>
          {isLoadingFreelancers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : isFreelancerError ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">Failed to load freelancers. Please try again.</p>
              </CardContent>
            </Card>
          ) : !freelancerList || freelancerList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active contracts found. You need active contracts to create meetings.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {freelancerList.map((freelancer) => (
                <Card key={freelancer.contract_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {freelancer.full_name}
                    </CardTitle>
                    <CardDescription>@{freelancer.username}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Job:</span> {freelancer.job_title}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        <span className="capitalize">{freelancer.contract_status}</span>
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSelectFreelancer(freelancer.username)}
                      className="w-full"
                      variant="default"
                      size="default"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Create Meeting
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Meeting</DialogTitle>
            <DialogDescription>
              Schedule a meeting with {selectedFreelancer && freelancerList?.find(f => f.username === selectedFreelancer)?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Meeting Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Project Discussion"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreateModalOpen(false);
                  setFormData({ topic: "", duration: 60, start_date: "", start_time: "" });
                  setSelectedFreelancer(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateMeeting} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Meeting"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
