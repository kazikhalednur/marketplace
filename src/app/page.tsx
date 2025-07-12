"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, useAuth } from '@/hooks/useAuth';
import { motion } from "framer-motion";
import { Briefcase, ChevronDown, GraduationCap, Quote, ShieldCheck, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

const testimonials = [
  {
    quote: "I landed my first remote job thanks to UniMarket. The process was smooth and secure!",
    name: "Ayesha Rahman",
    role: "Student, DIU",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote: "We found talented students for our project quickly and with full confidence in their credentials.",
    name: "Md. Karim",
    role: "Employer, TechSoft",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote: "The escrow system gave me peace of mind as a freelancer. Highly recommended!",
    name: "Tanvir Hasan",
    role: "Student, DIU",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, showLoader } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);
  if (showLoader || isAuthenticated) return <Loader />;

  return (
    <main className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] relative">
      {/* Sticky Navbar */}
{/*      <nav className="sticky top-0 z-30 w-full bg-[var(--card)]/90 backdrop-blur border-b border-[var(--border)] flex items-center justify-between px-6 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
          <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">UniMarket</span>
        </Link>
        <div className="flex gap-2 items-center">
          <Button asChild variant="ghost" className="text-base px-4 text-[var(--primary)]">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="text-base px-4 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
            <Link href="/register">Register</Link>
          </Button>
          <ThemeToggle />
        </div>
      </nav> */}

      {/* Subtle Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--background)] via-[var(--muted)] to-[var(--background)]" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 min-h-[calc(100vh-64px)] pt-2 pb-0 bg-gradient-to-b from-sky-100 via-blue-100 to-blue-200 dark:from-[#1e293b] dark:via-[#1e293b] dark:to-[#0f172a]">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium text-sm border border-[var(--accent)]/30">
          Trusted by Students & Employers
        </span>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold max-w-4xl mx-auto text-[var(--foreground)] leading-tight"
        >
          Hire Verified University Students for Real Development Jobs
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto"
        >
          A secure job marketplace where students bid with real work, and employers pay only when satisfied.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-14 flex justify-center gap-8 flex-wrap"
        >
          <Button asChild size="lg" className="px-10 py-5 text-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 shadow-md flex items-center gap-3 min-h-[56px] min-w-[220px]">
            <Link href="/register/student">
              <GraduationCap className="w-6 h-6 mr-2" />
              Join as Student
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-10 py-5 text-xl border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 flex items-center gap-3 min-h-[56px] min-w-[220px]">
            <Link href="/register/employer">
              <Briefcase className="w-6 h-6 mr-2" />
              Post a Job
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[var(--card)] text-center relative">
        <div className="flex flex-col items-center mb-14">
          <div className="bg-[var(--accent)]/10 p-2 rounded-full flex items-center justify-center mb-2">
            <Briefcase className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold inline-block text-[var(--foreground)]">How It Works</h2>
        </div>
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-start justify-center md:gap-0 gap-10">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--muted)] via-[var(--border)] to-[var(--muted)] z-0" style={{transform: 'translateY(-50%)'}} />
          {[
            {
              icon: <Briefcase className="h-10 w-10 text-[var(--primary-foreground)]" />, color: "bg-[var(--primary)]", step: 1,
              title: "Post a Job",
              desc: "Employers describe their project and fund escrow."
            },
            {
              icon: <GraduationCap className="h-10 w-10 text-[var(--primary-foreground)]" />, color: "bg-[var(--accent)]", step: 2,
              title: "Students Bid",
              desc: "Verified students submit proposals with real work."
            },
            {
              icon: <ShieldCheck className="h-10 w-10 text-[var(--primary-foreground)]" />, color: "bg-[var(--accent)]", step: 3,
              title: "Escrow Protection",
              desc: "Payment is released only after employer approval."
            },
          ].map(({ icon, color, step, title, desc }, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.04 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: "spring", stiffness: 300, delay: i * 0.15 }}
              className="relative z-10 flex-1 min-w-[260px] max-w-xs mx-auto md:mx-0 md:max-w-none md:px-6"
            >
              <Card className="rounded-2xl p-8 text-center shadow-md border-0 bg-[var(--muted)] dark:bg-[var(--secondary)] hover:shadow-lg transition-shadow flex flex-col items-center">
                {/* Step number and icon */}
                <div className="flex flex-col items-center mb-4">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-full ${color} dark:bg-[#273a56] shadow-lg mb-2 animate-fade-in`}>
                    {icon}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">Step {step}</span>
                </div>
                <CardContent className="space-y-2 p-0">
                  <h3 className="text-xl font-semibold mb-1 text-[var(--foreground)] dark:text-[var(--foreground)]">{title}</h3>
                  <p className="text-muted-foreground text-base dark:text-[var(--muted)]">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-28 px-6 bg-[var(--card)] text-center">
        <div className="flex flex-col items-center mb-14">
          <div className="bg-[var(--accent)]/10 p-2 rounded-full flex items-center justify-center mb-2">
            <Quote className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">What Our Users Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <Card key={i} className="rounded-2xl p-8 text-left shadow-lg border border-[var(--border)] bg-[var(--card)] hover:shadow-xl transition-shadow flex flex-col items-center">
              <div className="flex items-center gap-3 mb-4">
                <Image src={t.avatar} alt={t.name} width={40} height={40} className="w-10 h-10 rounded-full border border-[var(--border)] object-cover" />
                <div>
                  <div className="font-semibold text-[var(--foreground)]">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <p className="text-muted-foreground italic">“{t.quote}”</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 text-center bg-[var(--muted)]/60 border-b border-[var(--border)]">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-[var(--foreground)]">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto text-left">
          {[
            {
              icon: <Star className="text-[var(--accent)] mt-1" />,
              title: "Verified Students Only",
              desc: "We verify all students via university credentials before they can bid."
            },
            {
              icon: <Users className="text-[var(--accent)] mt-1" />,
              title: "Real Experience",
              desc: "Students build real-world portfolios while earning on flexible schedules."
            },
            {
              icon: <ShieldCheck className="text-[var(--accent)] mt-1" />,
              title: "Secure Escrow & Disputes",
              desc: "Escrow-based payment ensures fairness and transparency."
            },
            {
              icon: <Briefcase className="text-[var(--accent)] mt-1" />,
              title: "Remote-first Platform",
              desc: "Post and work from anywhere — fully remote system."
            }
          ].map(({ icon, title, desc }, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(60,60,120,0.10)' }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.08, ease: 'linear', delay: i * 0.02 }}
              className="flex gap-5 items-start bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 shadow-md transition-all hover:shadow-lg hover:border-[var(--border)]"
            >
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent)]/10 border border-[var(--border)]">{icon}</div>
              <div>
                <h4 className="font-semibold text-lg mb-1 text-[var(--foreground)]">{title}</h4>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white dark:bg-[#232a36]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Find answers to common questions about UniMarket.</p>
          </div>
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
            <FAQAccordionFlat />
            <div className="mt-3 py-5 border-t border-[var(--border)] text-center">
              <span className="text-[var(--foreground)] text-base">Still have questions? <a href="mailto:contact@unimarket.com" className="text-[var(--accent)] underline">Contact us</a></span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Full Width Modern */}
      <section className="w-full bg-[var(--primary)] py-14 px-4 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary-foreground)] mb-2">Ready to Get Started?</h2>
        <p className="text-base md:text-lg text-[var(--secondary)] mb-6 max-w-2xl mx-auto">
          Join UniMarket today and unlock real opportunities. Whether you&apos;re a student or an employer, it&apos;s free to get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl justify-center items-center">
          <a
            href="/register"
            className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold rounded-lg bg-[var(--card)] text-[var(--primary)] shadow-sm hover:bg-[var(--card)]/90 transition-colors w-full sm:w-auto"
          >
            Create Your Free Account
          </a>
          <a
            href="mailto:contact@unimarket.com"
            className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold rounded-lg border border-[var(--card)] text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary)]/90 hover:border-[var(--border)] transition-colors w-full sm:w-auto"
          >
            Contact Sales
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[var(--card)] border-t border-[var(--border)] py-6 px-6 mt-0 text-center text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">&copy; {new Date().getFullYear()} UniMarket. All rights reserved.</span>
        </div>
        <div className="flex gap-3">
          <a href="mailto:contact@unimarket.com" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </footer>
    </main>
  );
}

function FAQAccordionFlat() {
  const faqs = [
    { q: "Who can join UniMarket?", a: "Only verified university students and employers can join. Students must provide valid university credentials during registration." },
    { q: "Is there a fee to use UniMarket?", a: "Registration is free. A small service fee is deducted from each completed transaction to support platform operations and security." },
    { q: "How do I apply for jobs?", a: "Browse available jobs, submit your proposal, and attach relevant work or portfolio. Employers will review and respond if interested." },
    { q: "How do I get paid?", a: "Once your work is approved by the employer, payment is released from escrow directly to your account." },
    { q: "How does escrow work?", a: "Employers fund the project upfront. Payment is held securely and only released to the student after the employer approves the completed work." },
    { q: "What types of jobs can be posted?", a: "Any remote-friendly development, design, or tech-related job suitable for university students. All jobs must comply with our terms of service." },
    { q: "How do I get support?", a: "You can contact our support team anytime at contact@unimarket.com." },
    { q: "Is my payment information safe?", a: "All transactions are processed securely using industry-standard encryption and payment providers." },
  ];
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
      {faqs.map((item, i) => (
        <div key={i}>
          <button
            className={`w-full flex items-center justify-between py-3 px-3 md:py-4 md:px-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] group transition-colors
              ${open === i ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}
              font-semibold text-base md:text-lg
              hover:bg-[var(--accent)]/10
              rounded-lg
            `}
            aria-expanded={open === i}
            aria-controls={`faq-panel-${i}`}
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span className="flex-1 text-left text-base md:text-lg font-semibold transition-colors">{item.q}</span>
            <ChevronDown
              className={`ml-4 h-5 w-5 md:h-6 md:w-6 transform transition-transform duration-400 ease-in-out
                ${open === i ? 'rotate-180 text-[var(--accent)]' : 'text-[var(--muted-foreground)]'}
              `}
              aria-hidden="true"
            />
          </button>
          <div
            id={`faq-panel-${i}`}
            className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
            aria-hidden={open !== i}
          >
            <div className="pb-3 pr-3 pl-5 bg-blue-50/60 text-blue-900 text-base rounded-b-lg dark:text-[var(--foreground)]">
              {item.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}