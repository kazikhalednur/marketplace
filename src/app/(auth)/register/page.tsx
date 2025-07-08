"use client";

import { Card } from "@/components/ui/card";
import { Briefcase, GraduationCap } from "lucide-react";
import { useState } from "react";
import EmployerForm from "./EmployerForm";
import StudentForm from "./StudentForm";

export default function RegisterPage() {
  const [role, setRole] = useState<"student" | "employer" | null>(null);

  if (role === "student") return <StudentForm onBack={() => setRole(null)} />;
  if (role === "employer") return <EmployerForm onBack={() => setRole(null)} />;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-20 text-foreground">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Join as a Student or Employer
      </h1>
      <div className="flex gap-6">
        <Card
          onClick={() => setRole("student")}
          className="cursor-pointer hover:shadow-lg transition-all p-8 w-64 text-center border border-blue-300"
        >
          <GraduationCap className="mx-auto text-blue-600 mb-4" size={44} />
          <h2 className="font-semibold text-lg">I&apos;m a Student</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Verified students can earn by working on real-world projects.
          </p>
        </Card>

        <Card
          onClick={() => setRole("employer")}
          className="cursor-pointer hover:shadow-lg transition-all p-8 w-64 text-center border border-green-300"
        >
          <Briefcase className="mx-auto text-green-600 mb-4" size={44} />
          <h2 className="font-semibold text-lg">I&apos;m an Employer</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Hire talented university students for remote dev jobs.
          </p>
        </Card>
      </div>
    </main>
  );
}
