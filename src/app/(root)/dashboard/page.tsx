"use client";

import { Card } from '@/components/ui/card';
import JobList from './_views/JobList';
import JobDetailModal, { JobDetail } from './_views/JobDetailModal';
import { useState } from 'react';
import DashboardFilters from './_views/DashboardFilters';
import { useAppSelector } from '@/hooks/useTypedSelector';

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

export default function DashboardPage() {
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { searchText, selectedTags } = useAppSelector((state) => state.jobsFilter);

  // Filter jobs based on searchText and selectedTags
  const filteredJobs = dummyJobs.filter((job) => {
    const matchesSearch =
      !searchText ||
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.description.toLowerCase().includes(searchText.toLowerCase()) ||
      job.employer.toLowerCase().includes(searchText.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((tag) => job.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleJobClick = (job: JobDetail) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedJob(null);
  };

    return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Job Dashboard</h1>
        <Card className="p-6 mb-8">
          <DashboardFilters />
        </Card>
        {/* Job List */}
        <section className="space-y-4 min-h-[200px]">
          <JobList jobs={filteredJobs} onJobClick={handleJobClick} />
        </section>
        <JobDetailModal open={modalOpen} onClose={handleCloseModal} job={selectedJob} />
      </div>
    </main>
  );
}