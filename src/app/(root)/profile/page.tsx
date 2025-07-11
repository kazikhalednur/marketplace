"use client";
import { useState } from "react";
import ClientProfile from "./_views/ClientProfile";
import StudentProfile from "./_views/StudentProfile";

const mockClient = {
  avatar: "/avatar-placeholder.png",
  name: "Jane Doe",
  role: "Client / Employer",
  location: "San Francisco, CA",
  email: "jane.doe@email.com",
  website: "https://janedoe.dev",
  linkedin: "https://linkedin.com/in/janedoe",
  twitter: "https://twitter.com/janedoe",
  github: "https://github.com/janedoe",
  about: "Business owner looking for talented students to join exciting projects. Passionate about innovation and collaboration.",
  skills: ["Project Management", "Hiring", "Leadership", "Product Design"],
  projects: [
    { name: "Marketplace Redesign", link: "#", description: "Led the redesign of the UniMarket platform for better UX." },
    { name: "Job Board", link: "#", description: "Built a scalable job board for students and employers." },
  ],
};

const mockStudent = {
  avatar: "/avatar-placeholder.png",
  name: "John Smith",
  role: "Student / Developer",
  location: "Boston, MA",
  email: "john.smith@email.com",
  website: "https://johnsmith.dev",
  linkedin: "https://linkedin.com/in/johnsmith",
  twitter: "https://twitter.com/johnsmith",
  github: "https://github.com/johnsmith",
  about: "CS student passionate about web development, open source, and learning new technologies. Seeking internships and freelance gigs.",
  skills: ["React", "TypeScript", "Next.js", "UI/UX", "Tailwind CSS"],
  education: [
    { school: "MIT", degree: "BSc Computer Science", start: "2021-09", end: "Present" },
    { school: "Boston High School", degree: "High School Diploma", start: "2017-09", end: "2021-06" },
    { school: "Online Academy", degree: "Certificate in Web Development", start: "2020-01", end: "2020-08" },
  ],
  experience: [
    { title: "Frontend Intern", company: "TechSoft", start: "2024-01", end: "Present", description: "Worked on a real-world SaaS dashboard with React and TypeScript." },
    { title: "Freelance Developer", company: "Various Clients", start: "2023-06", end: "2024-01", description: "Built responsive websites and web applications for small businesses and startups." },
    { title: "Research Assistant", company: "MIT Computer Science", start: "2023-01", end: "2023-12", description: "Assisted in research on machine learning algorithms and data visualization techniques." },
    { title: "Teaching Assistant", company: "MIT", start: "2022-09", end: "2023-05", description: "Led programming tutorials and helped students with Python, Java, and web development projects." },
  ],
  projects: [
    { name: "Student Portfolio", link: "#", description: "Personal website and project showcase." },
    { name: "Open Source PRs", link: "#", description: "Contributed to several open source React libraries." },
  ],
};

export default function ProfilePage() {
  const [role, setRole] = useState<"client" | "student">("client");
  return role === "client" ? (
    <ClientProfile user={mockClient} onSwitch={() => setRole("student")} />
  ) : (
    <StudentProfile user={mockStudent} onSwitch={() => setRole("client")} />
  );
} 