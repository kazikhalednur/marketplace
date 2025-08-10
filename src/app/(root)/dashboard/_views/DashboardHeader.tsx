import { Card } from '@/components/ui/card';
import DashboardFilters from './DashboardFilters';
import DashboardFiltersSkeleton from './DashboardFiltersSkeleton';

type DashboardHeaderProps = {
  isLoading: boolean;
};

export default function DashboardHeader({ isLoading }: DashboardHeaderProps) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-center">Job Dashboard</h1>
      <Card className="p-6 mb-8">
        {isLoading ? <DashboardFiltersSkeleton /> : <DashboardFilters />}
      </Card>
    </>
  );
} 