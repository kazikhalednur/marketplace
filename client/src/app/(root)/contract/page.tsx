"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UnauthorizedPage from "@/app/unauthorized/page";
import {
  useGetContractsQuery,
  Contract,
  useGetFreelancerContractsQuery,
  FreelancerContractListItem,
} from "@/features/api/apiSlice";
import {
  useCreateMeetingMutation,
  useGetContractMeetingsQuery,
} from "@/features/api/meetingsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { LogIn } from "lucide-react";

export default function ContractPage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<
    Contract | FreelancerContractListItem | null
  >(null);
  const [expandedContractId, setExpandedContractId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState({
    topic: "",
    duration: 60,
    start_date: "",
    start_time: "",
  });

  // Client contracts
  const {
    data: clientContractsResponse,
    isLoading: isClientLoading,
    error: clientError,
  } = useGetContractsQuery(
    user?.role === "client"
      ? { page: currentPage, page_size: pageSize }
      : skipToken
  );
  // Freelancer contracts
  const {
    data: freelancerContractsResponse,
    isLoading: isFreelancerLoading,
    error: freelancerError,
  } = useGetFreelancerContractsQuery(
    user?.role === "freelancer"
      ? { page: currentPage, page_size: pageSize }
      : skipToken
  );

  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to page 1 when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const isClient = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";

  const clientContracts = clientContractsResponse?.data?.results || [];
  const freelancerContracts = freelancerContractsResponse?.data?.results || [];
  const contracts = (isClient ? clientContracts : freelancerContracts) as (
    | Contract
    | FreelancerContractListItem
  )[];
  const totalCount =
    (isClient
      ? clientContractsResponse?.data?.count
      : freelancerContractsResponse?.data?.count) || 0;
  const hasNext = !!(isClient
    ? clientContractsResponse?.data?.next
    : freelancerContractsResponse?.data?.next);
  const hasPrevious = !!(isClient
    ? clientContractsResponse?.data?.previous
    : freelancerContractsResponse?.data?.previous);
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleContractClick = (
    contract: Contract | FreelancerContractListItem,
    e?: React.MouseEvent
  ) => {
    // Don't navigate if clicking on a button inside the card
    if (e && (e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/contract/${contract.id}`);
  };

  const handleCreateMeetingClick = (
    contract: Contract,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedContract(contract);
    setCreateModalOpen(true);
  };

  const handleCreateMeeting = async () => {
    if (!selectedContract) {
      showToast({ type: "error", message: "Please select a contract" });
      return;
    }

    if (!formData.topic || !formData.start_date || !formData.start_time) {
      showToast({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    try {
      const result = await createMeeting({
        ...formData,
        contract: selectedContract.id,
      }).unwrap();

      showToast({ type: "success", message: "Meeting created successfully!" });
      setCreateModalOpen(false);
      setFormData({ topic: "", duration: 60, start_date: "", start_time: "" });
      setSelectedContract(null);

      // Redirect to the meetings page where client can see and join the meeting
      router.push("/meetings");
    } catch (error: any) {
      showToast({
        type: "error",
        message: error?.data?.message || "Failed to create meeting",
      });
    }
  };

  const handleToggleMeetings = (contractId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedContractId(
      expandedContractId === contractId ? null : contractId
    );
  };

  const handleJoinMeeting = (roomName: string) => {
    router.push(`/meeting/${roomName}`);
  };

  // Component to display meetings for a contract
  function ContractMeetingsList({ contractId }: { contractId: string }) {
    const { data: meetingsData, isLoading: isLoadingMeetings } =
      useGetContractMeetingsQuery(
        { contractId, page: 1, page_size: 10 },
        { skip: !expandedContractId || expandedContractId !== contractId }
      );

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

    if (isLoadingMeetings) {
      return (
        <div className="mt-4 pt-4 border-t border-muted/50">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </div>
      );
    }

    const meetings = meetingsData?.results || [];

    return (
      <div className="mt-4 pt-4 border-t border-muted/50">
        <h4 className="text-sm font-semibold mb-3">
          Meetings ({meetingsData?.count || 0})
        </h4>
        {meetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No meetings found for this contract.
          </p>
        ) : (
          <div className="space-y-2">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{meeting.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(meeting.start_date, meeting.start_time)} •{" "}
                    {meeting.duration} min
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Room: {meeting.room_name}
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinMeeting(meeting.room_name);
                  }}
                  className="shrink-0"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Join
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }
  };

  // Show loader while checking authentication (only on client side)
  if (!mounted) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-sm text-muted-foreground mt-4">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  if (showLoader || isClientLoading || isFreelancerLoading) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm text-muted-foreground mt-4">
              Loading contracts...
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Redirect unauthenticated users
  if (!isAuthenticated || (!isClient && !isFreelancer)) {
    return <UnauthorizedPage />;
  }

  // Handle API error
  if (clientError || freelancerError) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Contracts</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading your contracts. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </main>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return Clock;
      case "completed":
        return CheckCircle;
      case "pending":
        return AlertCircle;
      default:
        return FileText;
    }
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Contracts</h1>
            <p className="text-muted-foreground">
              Manage your contracts and track project progress.
            </p>
          </div>
          {isClient && (
            <Button className="mt-4 sm:mt-0">
              <FileText className="w-4 h-4 mr-2" />
              Create New Contract
            </Button>
          )}
        </div>

        {/* Contract Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Contracts
                </p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">
                  {contracts.filter((c) => c.status === "active").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold">
                  {contracts.filter((c) => c.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          {isClient && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold">
                    $
                    {clientContracts
                      .reduce((total: number, c: Contract) => {
                        if (!c.budget) return total;
                        const amount = parseFloat(
                          c.budget.replace(/[^0-9.-]+/g, "")
                        );
                        return total + (isNaN(amount) ? 0 : amount);
                      }, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </Card>
          )}
        </div>

        {/* Contracts List */}
        <div className="space-y-6">
          {contracts.map((contract) => {
            const startDate = new Date(
              contract.start_date
            ).toLocaleDateString();
            const endDate = new Date(contract.end_date).toLocaleDateString();
            const daysRemaining = Math.ceil(
              (new Date(contract.end_date).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const StatusIcon = getStatusIcon(contract.status);

            if (isClient) {
              const c = contract as Contract;
              const canCreateMeeting = c.status === "active";
              const isExpanded = expandedContractId === c.id;
              return (
                <Card
                  key={c.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/20 group"
                  onClick={(e) => handleContractClick(c, e)}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {c.job_title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {c.job_description}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(c.status)} shrink-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {c.freelancer_profile?.full_name || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {startDate} - {endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-green-600">
                          {c.budget || "Not specified"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Duration:{" "}
                          {Math.ceil(
                            (new Date(c.end_date).getTime() -
                              new Date(c.start_date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </span>
                        {c.status === "active" && (
                          <span
                            className={
                              daysRemaining > 0
                                ? "text-orange-600"
                                : "text-red-600"
                            }
                          >
                            {daysRemaining > 0
                              ? `${daysRemaining} days left`
                              : "Overdue"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {canCreateMeeting && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => handleCreateMeetingClick(c, e)}
                            className="shrink-0"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Create Meeting
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleToggleMeetings(c.id, e)}
                          className="shrink-0"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          {isExpanded ? "Hide" : "Show"} Meetings
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          Contract ID: #{c.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                    {isExpanded && <ContractMeetingsList contractId={c.id} />}
                  </div>
                </Card>
              );
            }

            const f = contract as FreelancerContractListItem;
            const isExpanded = expandedContractId === f.id;
            return (
              <Card
                key={f.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/20 group"
                onClick={(e) => handleContractClick(f, e)}
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {f.job_title}
                      </h3>
                    </div>
                    <Badge className={`${getStatusColor(f.status)} shrink-0`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {startDate} - {endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : "Overdue"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                    <div className="text-xs text-muted-foreground">
                      Contract ID: #{f.id.slice(-8)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleToggleMeetings(f.id, e)}
                      className="shrink-0"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {isExpanded ? "Hide" : "Show"} Meetings
                    </Button>
                  </div>
                  {isExpanded && <ContractMeetingsList contractId={f.id} />}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {contracts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                contracts
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-input rounded-md bg-background"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </div>

            {/* Pagination Controls - Only show if there are multiple pages */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!hasNext}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {contracts.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
            {isClient ? (
              <>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t created any contracts yet. Start by creating
                  your first contract.
                </p>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Your First Contract
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground mb-4">
                You don&apos;t have any contracts yet.
              </p>
            )}
          </Card>
        )}

        {/* Create Meeting Dialog */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Meeting</DialogTitle>
              <DialogDescription>
                Schedule a meeting with{" "}
                {selectedContract && 'freelancer_profile' in selectedContract
                  ? (selectedContract as Contract).freelancer_profile?.full_name || "the freelancer"
                  : "the freelancer"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Meeting Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Project Discussion"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 60,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setFormData({
                      topic: "",
                      duration: 60,
                      start_date: "",
                      start_time: "",
                    });
                    setSelectedContract(null);
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
    </main>
  );
}
