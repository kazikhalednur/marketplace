import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { JobDetail } from '@/app/(root)/dashboard/_views/JobDetailModal';

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }), // Replace with real API base URL
  endpoints: (builder) => ({
    getJobs: builder.query<JobDetail[], { search?: string; tags?: string[] }>(
      {
        query: () => {
          // For real API: return { url: '/jobs', params: { search, tags } }
          return '/jobs'; // Dummy endpoint
        },
        // For now, use a transformResponse to filter dummy data client-side
        transformResponse: (response: unknown, meta, arg) => {
          const dummyJobs: JobDetail[] = [
            {
              id: 1,
              title: 'Frontend React Developer',
              description: 'Build UI components for our dashboard using React and Tailwind.',
              price: 300,
              tags: ['React', 'Remote', 'UI'],
              posted: '2 hours ago',
              employer: 'Acme Corp',
            },
            {
              id: 2,
              title: 'Backend Node.js Engineer',
              description: 'Develop REST APIs and integrate with MongoDB.',
              price: 400,
              tags: ['Node.js', 'API', 'Urgent'],
              posted: '1 day ago',
              employer: 'Tech Solutions',
            },
            {
              id: 3,
              title: 'UI/UX Designer',
              description: 'Design modern interfaces for our mobile app.',
              price: 250,
              tags: ['Design', 'Figma', 'Remote'],
              posted: '3 days ago',
              employer: 'Designify',
            },
            {
              id: 4,
              title: 'Full Stack Developer',
              description: 'Work on both frontend and backend for a SaaS platform.',
              price: 600,
              tags: ['React', 'Node.js', 'Remote'],
              posted: '5 hours ago',
              employer: 'SaaSify',
            },
            {
              id: 5,
              title: 'Marketing Specialist',
              description: 'Plan and execute digital marketing campaigns.',
              price: 200,
              tags: ['Marketing', 'Remote'],
              posted: '4 days ago',
              employer: 'MarketGenius',
            },
            {
              id: 6,
              title: 'DevOps Engineer',
              description: 'Automate CI/CD pipelines and manage cloud infrastructure.',
              price: 500,
              tags: ['DevOps', 'API', 'Urgent'],
              posted: '6 hours ago',
              employer: 'CloudOps',
            },
            {
              id: 7,
              title: 'Content Writer',
              description: 'Write blog posts and technical documentation.',
              price: 150,
              tags: ['Content', 'Remote'],
              posted: '2 days ago',
              employer: 'WritePro',
            },
            {
              id: 8,
              title: 'Mobile App Developer',
              description: 'Develop cross-platform mobile apps using React Native.',
              price: 350,
              tags: ['React', 'Mobile', 'UI'],
              posted: '8 hours ago',
              employer: 'Appify',
            },
            {
              id: 9,
              title: 'QA Tester',
              description: 'Test web and mobile applications for bugs and usability.',
              price: 180,
              tags: ['QA', 'Remote'],
              posted: '1 hour ago',
              employer: 'TestLab',
            },
            {
              id: 10,
              title: 'Graphic Designer',
              description: 'Create graphics and assets for social media and web.',
              price: 220,
              tags: ['Design', 'Figma', 'Marketing'],
              posted: '7 days ago',
              employer: 'Brandify',
            },
          ];
          const search = arg?.search || '';
          const tags = arg?.tags || [];
          let jobs = dummyJobs;
          if (search) {
            jobs = jobs.filter(job => job.title.toLowerCase().includes(search.toLowerCase()) || job.description.toLowerCase().includes(search.toLowerCase()));
          }
          if (tags.length > 0) {
            jobs = jobs.filter(job => tags.every((tag: string) => job.tags.includes(tag)));
          }
          return jobs;
        },
      }
    ),
  }),
});

export const { useGetJobsQuery } = jobsApi; 