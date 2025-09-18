"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Download,
  Plus,
  X,
  CalendarDays
} from "lucide-react";
import DashboardPagination from "../../dashboard/_views/DashboardPagination";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import UnauthorizedPage from "@/app/unauthorized/page";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetContractByIdQuery, useGetMilestonesQuery, useCreateMilestoneMutation, CreateMilestonePayload, useGetFreelancerContractByIdQuery, useGetFreelancerMilestonesQuery, useSubmitMilestoneWorkMutation, FreelancerMilestone, Milestone, ContractDetail, FreelancerContractDetail, FreelancerMilestoneSubmissionItem } from "@/features/api/apiSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export default function ContractDetailPage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    amount: '',
    start_date: '',
    due_date: ''
  });
  // Freelancer submission state
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [viewSubmissionModalOpen, setViewSubmissionModalOpen] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [selectedStep, setSelectedStep] = useState<FreelancerMilestone | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const isClient = user?.role === "client";
  const isFreelancer = user?.role === "freelancer";

  // Pagination state (shared UI for both roles)
  // Server-side pagination (freelancer milestones)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Client contract and milestones (with pagination)
  const { data: clientContractResponse, isLoading: clientLoading, error: clientError } = useGetContractByIdQuery(isClient ? (params.id as string) : skipToken);
  const { data: clientMilestonesResponse, isLoading: clientMilestonesLoading, error: clientMilestonesError } = useGetMilestonesQuery(
    isClient ? { contractId: params.id as string, page, page_size: pageSize } : (skipToken as unknown as { contractId: string })
  );
  const clientContract = clientContractResponse?.data;
  const clientMilestones = clientMilestonesResponse?.data?.results || [];
  const clientCount = clientMilestonesResponse?.data?.count || 0;
  const hasClientNext = Boolean(clientMilestonesResponse?.data?.next);
  const hasClientPrev = Boolean(clientMilestonesResponse?.data?.previous);
  const clientTotalPages = Math.max(1, Math.ceil(clientCount / Math.max(pageSize, 1)));

  // Freelancer contract and milestones
  const { data: freelancerContractResponse, isLoading: freelancerLoading, error: freelancerError } = useGetFreelancerContractByIdQuery(isFreelancer ? (params.id as string) : skipToken);
  const { data: freelancerMilestonesResponse, isLoading: freelancerMilestonesLoading, error: freelancerMilestonesError } = useGetFreelancerMilestonesQuery(
    isFreelancer ? { contractId: params.id as string, page, page_size: pageSize } : (skipToken as unknown as { contractId: string })
  );
  const freelancerContract = freelancerContractResponse?.data;
  const freelancerData = freelancerMilestonesResponse?.data as unknown;
  const freelancerMilestones: FreelancerMilestone[] = Array.isArray(freelancerData)
    ? (freelancerData as FreelancerMilestone[])
    : ((freelancerData as { results?: FreelancerMilestone[] } | undefined)?.results || []);
  const freelancerCount: number = Array.isArray(freelancerData)
    ? (freelancerData as FreelancerMilestone[]).length
    : ((freelancerData as { count?: number } | undefined)?.count || 0);
  const hasFreelancerNext: boolean = Array.isArray(freelancerData)
    ? (page * pageSize) < freelancerCount
    : Boolean((freelancerData as { next?: string | null } | undefined)?.next);
  const hasFreelancerPrev: boolean = Array.isArray(freelancerData)
    ? page > 1
    : Boolean((freelancerData as { previous?: string | null } | undefined)?.previous);
  const freelancerTotalPages = Math.max(1, Math.ceil(freelancerCount / Math.max(pageSize, 1)));

  // Mutations
  const [createMilestone, { isLoading: isCreatingMilestone }] = useCreateMilestoneMutation();
  const [submitMilestoneWork, { isLoading: isSubmitting }] = useSubmitMilestoneWorkMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (showLoader) {
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
            <h2 className="text-2xl font-bold mb-2">Error Loading Contract</h2>
            <p className="text-muted-foreground mb-4">There was an error loading the contract details. Please try again later.</p>
            <Button onClick={() => router.push('/contract')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contracts
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (clientLoading || freelancerLoading) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-sm text-muted-foreground mt-4">Loading contract details...</div>
          </div>
        </div>
      </main>
    );
  }

  const contract: ContractDetail | FreelancerContractDetail | undefined = (isClient ? clientContract : freelancerContract);
  if (!contract) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
            <p className="text-muted-foreground mb-4">The contract you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push('/contract')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contracts
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Ensure milestones is always an array to avoid runtime errors when using .filter/.map
  const milestones: Array<Milestone | FreelancerMilestone> = isClient
    ? (Array.isArray(clientMilestones) ? clientMilestones : [])
    : (Array.isArray(freelancerMilestones) ? freelancerMilestones : []);

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

  const StatusIcon = getStatusIcon(contract.status);

  const handleCreateMilestone = () => {
    if (!isClient) return;
    setMilestoneModalOpen(true);
  };

  const handleCloseMilestoneModal = () => {
    setMilestoneModalOpen(false);
    setMilestoneForm({
      title: '',
      description: '',
      amount: '',
      start_date: '',
      due_date: ''
    });
  };

  const handleMilestoneFormChange = (field: string, value: string) => {
    setMilestoneForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitMilestone = async () => {
    if (!contract || !milestoneForm.title || !milestoneForm.description || !milestoneForm.amount || !milestoneForm.start_date || !milestoneForm.due_date) {
      return;
    }

    try {
      const payload: CreateMilestonePayload = {
        title: milestoneForm.title,
        description: milestoneForm.description,
        amount: milestoneForm.amount,
        start_date: milestoneForm.start_date,
        due_date: milestoneForm.due_date
      };

      await createMilestone({ contractId: contract.id, payload }).unwrap();
      handleCloseMilestoneModal();
    } catch (error) {
      console.error('Failed to create milestone:', error);
    }
  };

  // Freelancer submission handlers
  const openSubmissionModal = (step: FreelancerMilestone) => {
    if (!isFreelancer) return;
    setSelectedStep(step);
    // Prefill message if exists (edit flow)
    const existingMessage = Array.isArray(step.submissions) && step.submissions.length > 0
      ? (step.submissions[step.submissions.length - 1]?.message || '')
      : '';
    setSubmissionMessage(existingMessage);
    setSubmissionModalOpen(true);
  };
  const closeSubmissionModal = () => {
    setSelectedStep(null);
    setSubmissionMessage('');
    setSubmissionModalOpen(false);
    setFile(null);
  };
  const openViewSubmission = (step: FreelancerMilestone) => {
    if (!isFreelancer) return;
    setSelectedStep(step);
    setViewSubmissionModalOpen(true);
  };
  const closeViewSubmission = () => {
    setSelectedStep(null);
    setViewSubmissionModalOpen(false);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };
  const handleSubmitWork = async () => {
    if (!isFreelancer || !selectedStep || !file) return;
    const form = new FormData();
    if (submissionMessage) form.append('message', submissionMessage);
    form.append('code_zip', file);
    try {
      await submitMilestoneWork({ contractId: contract.id, stepId: selectedStep.id, formData: form }).unwrap();
      closeSubmissionModal();
    } catch (e) {
      console.error('Failed to submit work:', e);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/contract')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contracts
            </Button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{contract.job.title}</h1>
              <p className="text-muted-foreground">Contract ID: #{contract.id}</p>
            </div>
            <Badge className={getStatusColor(contract.status)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Overview */
            }
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Contract Overview</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  {isClient && (
                    <p className="text-sm leading-relaxed">{(contract as ContractDetail).job.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {isClient ? (
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Freelancer</h3>
                      <p className="text-sm font-semibold">{(contract as ContractDetail).freelancer_profile?.full_name || 'Unknown'}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                      <p className="text-sm font-semibold">{(contract as FreelancerContractDetail).client_profile?.first_name} {(contract as FreelancerContractDetail).client_profile?.last_name}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
                    <p className="text-sm font-semibold text-green-600">৳{contract.budget || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                    <p className="text-sm">
                      {Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Progress Section */}
            {contract.status === 'active' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Project Progress</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Project Status</span>
                    <span className="text-sm font-semibold text-primary">
                      {milestones.length > 0 ? `${milestones.filter(m => m.status === 'completed' || m.status === 'accepted').length}/${milestones.length} Milestones Completed` : 'No Milestones Yet'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((milestones.filter(m => m.status === 'completed' || m.status === 'accepted').length / Math.max(milestones.length, 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress: {Math.round((milestones.filter(m => m.status === 'completed' || m.status === 'accepted').length / Math.max(milestones.length, 1)) * 100)}%</span>
                    <span>{milestones.filter(m => m.status === 'completed' || m.status === 'accepted').length} of {milestones.length} completed</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Started: {new Date(contract.start_date).toLocaleDateString()}</span>
                    <span>Due: {new Date(contract.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Milestones */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Project Milestones</h2>
                {isClient && (
                  <Button size="sm" onClick={handleCreateMilestone}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                )}
              </div>
              {(isClient ? clientMilestonesLoading : freelancerMilestonesLoading) ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Loading milestones...</span>
                </div>
              ) : (isClient ? clientMilestonesError : freelancerMilestonesError) ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Error Loading Milestones</h3>
                  <p className="text-muted-foreground">There was an error loading the milestones.</p>
                </div>
              ) : milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone: Milestone | FreelancerMilestone, index: number) => (
                    <div key={milestone.id} className="relative">
                      {/* Connection line */}
                      {index < milestones.length - 1 && (
                        <div className="absolute left-3 top-8 w-0.5 h-8 bg-muted"></div>
                      )}
                      <div className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          milestone.status === 'completed' || milestone.status === 'accepted' ? 'bg-green-100' : 'bg-muted'
                        }`}>
                          {milestone.status === 'completed' || milestone.status === 'accepted' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-sm">{milestone.title}</h3>
                            {milestone.amount && (
                              <span className="text-sm font-semibold text-green-600 ml-2">
                                ৳{milestone.amount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{milestone.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Step {milestone.step_number}</span>
                              <span>Start: {milestone.start_date ? new Date(milestone.start_date).toLocaleDateString() : '—'}</span>
                              <span>Due: {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : '—'}</span>
                            </div>
                            <Badge className={`text-xs ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              milestone.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                            </Badge>
                          </div>
                          {/* Freelancer submissions */}
                          {isFreelancer && 'submissions' in milestone && Array.isArray(milestone.submissions) && milestone.submissions.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium mb-2">Submissions</p>
                              <ul className="text-xs space-y-1">
                                {milestone.submissions.map((sub: FreelancerMilestoneSubmissionItem, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <a href={sub.code_zip} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Download {idx + 1}</a>
                                    {sub.message && <span className="text-muted-foreground">— {sub.message}</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {isFreelancer && (
                            <div className="mt-3 flex gap-2">
                              {(milestone.status === 'pending' || milestone.status === 'active') && (
                                <Button size="sm" variant="outline" onClick={() => openSubmissionModal(milestone as FreelancerMilestone)}>
                                  Submit Work
                                </Button>
                              )}
                              {milestone.status === 'submitted' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => openViewSubmission(milestone as FreelancerMilestone)}>
                                    View Details
                                  </Button>
                                  <Button size="sm" onClick={() => openSubmissionModal(milestone as FreelancerMilestone)}>
                                    Edit Submission
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Pagination (only for freelancer list which is paginated server-side) */}
                  {(isFreelancer || isClient) && (
                    <div className="pt-2">
                      {isFreelancer ? (
                        <>
                          <DashboardPagination
                            currentPage={page}
                            totalPages={freelancerTotalPages}
                            hasPrevious={!!hasFreelancerPrev && page > 1}
                            hasNext={!!hasFreelancerNext && page < freelancerTotalPages}
                            pageSize={pageSize}
                            totalCount={freelancerCount}
                            onPageChange={(p) => setPage(p)}
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Page size</span>
                            <select
                              value={pageSize}
                              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <DashboardPagination
                          currentPage={page}
                          totalPages={clientTotalPages}
                          hasPrevious={!!hasClientPrev && page > 1}
                          hasNext={!!hasClientNext && page < clientTotalPages}
                          pageSize={pageSize}
                          totalCount={clientCount}
                          onPageChange={(p) => setPage(p)}
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Milestones Yet</h3>
                  <p className="text-muted-foreground mb-4">No milestones have been created for this contract yet.</p>
                  {isClient && (
                    <Button onClick={handleCreateMilestone}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Milestone
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Contract Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start Date</p>
                    <p className="text-sm font-semibold mt-1">{new Date(contract.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">End Date</p>
                    <p className="text-sm font-semibold mt-1">{new Date(contract.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Budget</p>
                    <p className="text-sm font-semibold text-green-600 mt-1">৳{contract.budget}</p>
                  </div>
                </div>
                {isClient && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Freelancer</p>
                      <p className="text-sm font-semibold mt-1">{(contract as ContractDetail).freelancer_profile?.full_name || 'Unknown'}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Role-specific profile card */}
            {isClient ? (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Freelancer Profile</h3>
                <div className="flex items-center gap-4">
                  {(contract as ContractDetail).freelancer_profile?.avatar ? (
                    <Image 
                      src={(contract as ContractDetail).freelancer_profile.avatar} 
                      alt={(contract as ContractDetail).freelancer_profile.full_name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">
                      {(contract as ContractDetail).freelancer_profile?.full_name || 'Unknown Freelancer'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      @{(contract as ContractDetail).freelancer_profile?.username || 'unknown'}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Client</h3>
                <div className="flex items-center gap-4">
                  {(contract as FreelancerContractDetail).client_profile?.avatar ? (
                    <Image 
                      src={(contract as FreelancerContractDetail).client_profile.avatar} 
                      alt={(contract as FreelancerContractDetail).client_profile.username}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">
                      {(contract as FreelancerContractDetail).client_profile?.first_name} {(contract as FreelancerContractDetail).client_profile?.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      @{(contract as FreelancerContractDetail).client_profile?.username}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" /> {isClient ? 'Contact Freelancer' : 'Message Client'}
                </Button>
                {contract.job.job_link && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(contract.job.job_link.replace(/\/$/, ''), '_blank')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Job Posting
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download Contract
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Contract
                </Button>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-semibold capitalize">{contract.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Days Remaining</span>
                  <span className="text-sm font-semibold">
                    {Math.max(0, Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Create Milestone Modal (Client) */}
        {isClient && milestoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Create New Milestone</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCloseMilestoneModal}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter milestone title"
                      value={milestoneForm.title}
                      onChange={(e) => handleMilestoneFormChange('title', e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter milestone description"
                      rows={3}
                      value={milestoneForm.description}
                      onChange={(e) => handleMilestoneFormChange('description', e.target.value)}
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      placeholder="Enter milestone amount (e.g., 500)"
                      type="number"
                      value={milestoneForm.amount}
                      onChange={(e) => handleMilestoneFormChange('amount', e.target.value)}
                    />
                  </div>

                  {/* Date Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <div className="relative">
                        <Input
                          id="start_date"
                          type="date"
                          value={milestoneForm.start_date}
                          onChange={(e) => handleMilestoneFormChange('start_date', e.target.value)}
                          className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <CalendarDays 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer pointer-events-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date *</Label>
                      <div className="relative">
                        <Input
                          id="due_date"
                          type="date"
                          value={milestoneForm.due_date}
                          onChange={(e) => handleMilestoneFormChange('due_date', e.target.value)}
                          className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <CalendarDays 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer pointer-events-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleCloseMilestoneModal}
                      disabled={isCreatingMilestone}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleSubmitMilestone}
                      disabled={!milestoneForm.title || !milestoneForm.description || !milestoneForm.amount || !milestoneForm.start_date || !milestoneForm.due_date || isCreatingMilestone}
                    >
                      {isCreatingMilestone ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Milestone'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Submit Work Modal (Freelancer) */}
        {isFreelancer && submissionModalOpen && selectedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedStep.status === 'submitted' ? 'Edit Submission' : 'Submit Work'} — Step {selectedStep.step_number}</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={closeSubmissionModal}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Add an optional note for your client"
                      rows={3}
                      value={submissionMessage}
                      onChange={(e) => setSubmissionMessage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload ZIP file *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".zip,application/zip,application/x-zip-compressed"
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground">Attach your code or deliverables as a .zip file.</p>
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={closeSubmissionModal}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleSubmitWork}
                      disabled={!file || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : (selectedStep.status === 'submitted' ? 'Update Submission' : 'Submit')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {isFreelancer && viewSubmissionModalOpen && selectedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-lg mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Submission Details — Step {selectedStep.step_number}</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={closeViewSubmission}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Message</p>
                    <p className="mt-1">{(Array.isArray(selectedStep.submissions) && selectedStep.submissions.length > 0 ? (selectedStep.submissions[selectedStep.submissions.length - 1]?.message || '—') : '—')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attachment</p>
                    {Array.isArray(selectedStep.submissions) && selectedStep.submissions.length > 0 && selectedStep.submissions[selectedStep.submissions.length - 1]?.code_zip ? (
                      <a href={selectedStep.submissions[selectedStep.submissions.length - 1].code_zip} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Download ZIP</a>
                    ) : (
                      <p>—</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Uploaded At</p>
                    <p className="mt-1">—</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={closeViewSubmission}>Close</Button>
                  <Button onClick={() => { closeViewSubmission(); openSubmissionModal(selectedStep); }}>Edit Submission</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </main>
  );
}
