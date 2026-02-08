"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Briefcase, FileText, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import UnauthorizedPage from "@/app/unauthorized/page";

export default function ManageWorkPage() {
  const { user, isAuthenticated, showLoader } = useAuth();
  const [mounted, setMounted] = useState(false);

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

  // Redirect non-clients or unauthenticated users
  if (!isAuthenticated || user?.role !== "client") {
    return <UnauthorizedPage />;
  }

  const workManagementCards = [
    {
      title: "Active Contracts",
      description: "Manage your ongoing contracts and project progress",
      icon: FileText,
      href: "/contract",
      stats: "12 Active",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Project Overview",
      description: "View all your projects and their current status",
      icon: Briefcase,
      href: "/my-jobs",
      stats: "8 Projects",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Team Management",
      description: "Manage your freelancers and team members",
      icon: Users,
      href: "#",
      stats: "5 Members",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Performance Analytics",
      description: "Track project performance and metrics",
      icon: TrendingUp,
      href: "#",
      stats: "95% Success",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "Contract signed for Web Development project",
      time: "2 hours ago",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: 2,
      title: "New milestone reached in Mobile App project",
      time: "5 hours ago",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: 3,
      title: "Payment processed for UI/UX Design project",
      time: "1 day ago",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: 4,
      title: "Review pending for Data Analysis project",
      time: "2 days ago",
      status: "pending",
      icon: Clock,
    },
  ];

  return (
    <main className="min-h-screen w-full bg-background text-foreground px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Work</h1>
          <p className="text-muted-foreground">
            Oversee your projects, contracts, and team performance from one central location.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Work Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {workManagementCards.map((card, index) => (
            <Link key={index} href={card.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{card.description}</p>
                    <p className="text-sm font-medium text-primary">{card.stats}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activities */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <activity.icon className={`h-4 w-4 ${
                    activity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
