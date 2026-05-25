'use client';

import { Card } from '@/components/ui/card';
import { Briefcase, GraduationCap, ArrowLeft } from 'lucide-react';

interface RegisterRolePickerProps {
  title?: string;
  subtitle?: string;
  onSelectFreelancer: () => void;
  onSelectClient: () => void;
  onBack?: () => void;
}

export default function RegisterRolePicker({
  title,
  subtitle,
  onSelectFreelancer,
  onSelectClient,
  onBack,
}: RegisterRolePickerProps) {
  return (
    <div className="flex flex-col items-center w-full">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-medium self-start max-w-xl w-full"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}
      {title && (
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">{title}</h1>
      )}
      {subtitle && (
        <p className="text-muted-foreground text-center mb-10 max-w-md">{subtitle}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-6">
        <Card
          onClick={onSelectFreelancer}
          className="cursor-pointer hover:shadow-lg transition-all p-8 w-64 text-center border border-blue-300"
        >
          <GraduationCap className="mx-auto text-blue-600 mb-4" size={44} />
          <h2 className="font-semibold text-lg">I&apos;m a Freelancer</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Verified students can earn by working on real-world projects.
          </p>
        </Card>

        <Card
          onClick={onSelectClient}
          className="cursor-pointer hover:shadow-lg transition-all p-8 w-64 text-center border border-green-300"
        >
          <Briefcase className="mx-auto text-green-600 mb-4" size={44} />
          <h2 className="font-semibold text-lg">I&apos;m a Client</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Hire talented university students for remote dev jobs.
          </p>
        </Card>
      </div>
    </div>
  );
}
