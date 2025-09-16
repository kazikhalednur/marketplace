import { apiSlice } from './apiSlice';

// Types for Freelancer contract list
export interface FreelancerContractListItem {
  id: string;
  job_title: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface FreelancerContractsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: FreelancerContractListItem[];
  };
}

// Types for Freelancer contract detail
export interface FreelancerContractDetail {
  id: string;
  job: {
    id: string;
    title: string;
    job_link: string | null;
  };
  client_profile: {
    username: string;
    avatar: string | null;
    first_name: string;
    last_name: string;
  };
  budget: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface FreelancerContractDetailResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: FreelancerContractDetail;
}

// Milestone types for Freelancer
export interface FreelancerMilestoneSubmission {
  message?: string;
  code_zip: string;
}

export interface FreelancerMilestone {
  id: string;
  step_number: number;
  title: string;
  description: string;
  amount: string;
  start_date: string | null;
  due_date: string | null;
  status: 'pending' | 'submitted' | 'active' | 'completed' | string;
  submissions: FreelancerMilestoneSubmission[];
}

export interface FreelancerMilestonesListResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: FreelancerMilestone[];
}

export interface FreelancerMilestoneDetailResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: FreelancerMilestone;
}

export interface MilestoneSubmissionResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    code_zip: string;
  };
}

export const freelancerContractsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFreelancerContracts: builder.query<FreelancerContractsResponse, { page?: number; page_size?: number } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && params.page) searchParams.append('page', params.page.toString());
        if (params && params.page_size) searchParams.append('page_size', params.page_size.toString());
        const queryString = searchParams.toString();
        return `biding/contracts/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: FreelancerContractsResponse) => response,
      providesTags: ['Contracts'],
    }),
    getFreelancerContractById: builder.query<FreelancerContractDetailResponse, string>({
      query: (id) => `biding/contracts/${id}/`,
      transformResponse: (response: FreelancerContractDetailResponse) => response,
      providesTags: (result, error, id) => [{ type: 'Contracts', id }],
    }),
    getFreelancerMilestones: builder.query<FreelancerMilestonesListResponse, string>({
      query: (contractId) => `work-diary/milestones/${contractId}/steps/`,
      transformResponse: (response: FreelancerMilestonesListResponse) => response,
      providesTags: (result, error, contractId) => [{ type: 'Milestones', id: contractId }],
    }),
    getFreelancerMilestoneById: builder.query<FreelancerMilestoneDetailResponse, { contractId: string; stepId: string } >({
      query: ({ contractId, stepId }) => `work-diary/milestones/${contractId}/steps/${stepId}/`,
      transformResponse: (response: FreelancerMilestoneDetailResponse) => response,
      providesTags: (result, error, args) => [{ type: 'Milestones', id: `${args.contractId}:${args.stepId}` }],
    }),
    submitMilestoneFiles: builder.mutation<MilestoneSubmissionResponse, { contractId: string; stepId: string; file: File; message?: string }>({
      query: ({ contractId, stepId, file, message }) => {
        const formData = new FormData();
        if (message) formData.append('message', message);
        formData.append('code_zip', file);
        return {
          url: `work-diary/milestones/${contractId}/steps/${stepId}/submissions/`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: MilestoneSubmissionResponse) => response,
      invalidatesTags: (result, error, { contractId, stepId }) => [
        { type: 'Milestones', id: contractId },
        { type: 'Milestones', id: `${contractId}:${stepId}` },
      ],
    }),
  }),
});

export const {
  useGetFreelancerContractsQuery,
  useGetFreelancerContractByIdQuery,
  useGetFreelancerMilestonesQuery,
  useGetFreelancerMilestoneByIdQuery,
  useSubmitMilestoneFilesMutation,
} = freelancerContractsApi;


