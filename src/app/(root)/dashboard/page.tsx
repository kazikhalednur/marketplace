"use client";

import { Card } from '@/components/ui/card';
import JobList from './_views/JobList';
import JobDetailModal, { JobDetail } from './_views/JobDetailModal';
import { useState, useEffect } from 'react';
import DashboardFilters from './_views/DashboardFilters';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { useRouter } from 'next/navigation';

const dummyJobs: JobDetail[] = [
  {
    id: 1,
    title: 'Frontend React Developer',
    description: 'Build UI components for our dashboard using React and Tailwind.',
    tags: ['React', 'Remote', 'UI'],
    category: 'Development',
    currency: 'USD',
    min_budget: 300,
    max_budget: 500,
    duration: '2 weeks',
    experience_level: 'Intermediate',
    status: 'Open',
    posted: '2 hours ago',
    employer: 'Acme Corp',
  },
  {
    id: 2,
    title: 'Backend Node.js Engineer',
    description: 'Develop REST APIs and integrate with MongoDB.',
    tags: ['Node.js', 'API', 'Urgent'],
    category: 'Backend',
    currency: 'USD',
    min_budget: 400,
    max_budget: 600,
    duration: '1 month',
    experience_level: 'Senior',
    status: 'Open',
    posted: '1 day ago',
    employer: 'Tech Solutions',
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    description: 'Design modern interfaces for our mobile app.',
    tags: ['Design', 'Figma', 'Remote'],
    category: 'Design',
    currency: 'USD',
    min_budget: 250,
    max_budget: 350,
    duration: '3 weeks',
    experience_level: 'Junior',
    status: 'Open',
    posted: '3 days ago',
    employer: 'Designify',
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    description: 'Work on both frontend and backend for a SaaS platform.',
    tags: ['React', 'Node.js', 'Remote'],
    category: 'Full Stack',
    currency: 'USD',
    min_budget: 600,
    max_budget: 900,
    duration: '1.5 months',
    experience_level: 'Senior',
    status: 'Open',
    posted: '5 hours ago',
    employer: 'SaaSify',
  },
  {
    id: 5,
    title: 'Marketing Specialist',
    description: 'Plan and execute digital marketing campaigns.',
    tags: ['Marketing', 'Remote'],
    category: 'Marketing',
    currency: 'USD',
    min_budget: 200,
    max_budget: 300,
    duration: '1 month',
    experience_level: 'Intermediate',
    status: 'Closed',
    posted: '4 days ago',
    employer: 'MarketGenius',
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    description: 'Automate CI/CD pipelines and manage cloud infrastructure.',
    tags: ['DevOps', 'API', 'Urgent'],
    category: 'DevOps',
    currency: 'USD',
    min_budget: 500,
    max_budget: 700,
    duration: '2 weeks',
    experience_level: 'Senior',
    status: 'Open',
    posted: '6 hours ago',
    employer: 'CloudOps',
  },
  {
    id: 7,
    title: 'Content Writer',
    description: 'Write blog posts and technical documentation.',
    tags: ['Content', 'Remote'],
    category: 'Writing',
    currency: 'USD',
    min_budget: 150,
    max_budget: 200,
    duration: '1 week',
    experience_level: 'Junior',
    status: 'Open',
    posted: '2 days ago',
    employer: 'WritePro',
  },
  {
    id: 8,
    title: 'Mobile App Developer',
    description: 'Develop cross-platform mobile apps using React Native.',
    tags: ['React', 'Mobile', 'UI'],
    category: 'Mobile',
    currency: 'USD',
    min_budget: 350,
    max_budget: 500,
    duration: '1 month',
    experience_level: 'Intermediate',
    status: 'Open',
    posted: '8 hours ago',
    employer: 'Appify',
  },
  {
    id: 9,
    title: 'QA Tester',
    description: 'Test web and mobile applications for bugs and usability.',
    tags: ['QA', 'Remote'],
    category: 'QA',
    currency: 'USD',
    min_budget: 180,
    max_budget: 250,
    duration: '2 weeks',
    experience_level: 'Junior',
    status: 'Closed',
    posted: '1 hour ago',
    employer: 'TestLab',
  },
  {
    id: 10,
    title: 'Graphic Designer',
    description: 'Create graphics and assets for social media and web.',
    tags: ['Design', 'Figma', 'Marketing'],
    category: 'Design',
    currency: 'USD',
    min_budget: 220,
    max_budget: 300,
    duration: '2 weeks',
    experience_level: 'Intermediate',
    status: 'Open',
    posted: '7 days ago',
    employer: 'Brandify',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login?next=/dashboard');
      }
    }
  }, [router]);
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