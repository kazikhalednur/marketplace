"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Briefcase, ChevronDown, GraduationCap, Quote, ShieldCheck, Star, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
  return (
    <main className="min-h-screen w-full bg-neutral-100 text-gray-900 relative">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur border-b border-neutral-200 flex items-center justify-between px-6 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">UniMarket</span>
        </Link>
        <div className="flex gap-2">
          <Button asChild variant="ghost" className="text-base px-4 text-blue-600">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="text-base px-4 bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </nav>

      {/* Subtle Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-neutral-50 to-neutral-100" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 min-h-[calc(100vh-64px)] pt-2 pb-0 bg-neutral-100">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-50 text-blue-600 font-medium text-sm border border-blue-200">
          Trusted by Students & Employers
        </span>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold max-w-4xl mx-auto text-gray-900 leading-tight"
        >
          Hire Verified University Students for Real Development Jobs
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-700 mt-6 max-w-2xl mx-auto"
        >
          A secure job marketplace where students bid with real work, and employers pay only when satisfied.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-14 flex justify-center gap-8 flex-wrap"
        >
          <Button asChild size="lg" className="px-10 py-5 text-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center gap-3 min-h-[56px] min-w-[220px]">
            <Link href="/register/student">
              <GraduationCap className="w-6 h-6 mr-2" />
              Join as Student
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-10 py-5 text-xl border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-3 min-h-[56px] min-w-[220px]">
            <Link href="/register/employer">
              <Briefcase className="w-6 h-6 mr-2" />
              Post a Job
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white text-center relative">
        <div className="flex flex-col items-center mb-14">
          <div className="bg-blue-100 p-2 rounded-full flex items-center justify-center mb-2">
            <Briefcase className="h-7 w-7 text-blue-700" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold inline-block text-blue-900">How It Works</h2>
        </div>
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-start justify-center md:gap-0 gap-10">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 z-0" style={{transform: 'translateY(-50%)'}} />
          {[
            {
              icon: <Briefcase className="h-10 w-10 text-white" />, color: "bg-blue-700", step: 1,
              title: "Post a Job",
              desc: "Employers describe their project and fund escrow."
            },
            {
              icon: <GraduationCap className="h-10 w-10 text-white" />, color: "bg-blue-500", step: 2,
              title: "Students Bid",
              desc: "Verified students submit proposals with real work."
            },
            {
              icon: <ShieldCheck className="h-10 w-10 text-white" />, color: "bg-blue-400", step: 3,
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
              <Card className="rounded-2xl p-8 text-center shadow-md border-0 bg-neutral-50 hover:shadow-lg transition-shadow flex flex-col items-center">
                {/* Step number and icon */}
                <div className="flex flex-col items-center mb-4">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-full ${color} shadow-lg mb-2 animate-fade-in`}>
                    {icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Step {step}</span>
                </div>
                <CardContent className="space-y-2 p-0">
                  <h3 className="text-xl font-semibold mb-1 text-blue-900">{title}</h3>
                  <p className="text-gray-600 text-base">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-28 px-6 bg-white text-center">
        <div className="flex flex-col items-center mb-14">
          <div className="bg-blue-50 p-2 rounded-full flex items-center justify-center mb-2">
            <Quote className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What Our Users Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <Card key={i} className="rounded-2xl p-8 text-left shadow-lg border border-neutral-200 bg-white hover:shadow-xl transition-shadow flex flex-col items-center">
              <div className="flex items-center gap-3 mb-4">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border border-border object-cover" />
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
              <p className="text-gray-700 italic">“{t.quote}”</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-28 px-6 text-center bg-neutral-100">
        <h2 className="text-3xl md:text-4xl font-bold mb-14 text-gray-900">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto text-left">
          {[
            {
              icon: <Star className="text-blue-600 mt-1" />,
              title: "Verified Students Only",
              desc: "We verify all students via university credentials before they can bid."
            },
            {
              icon: <Users className="text-blue-600 mt-1" />,
              title: "Real Experience",
              desc: "Students build real-world portfolios while earning on flexible schedules."
            },
            {
              icon: <ShieldCheck className="text-blue-600 mt-1" />,
              title: "Secure Escrow & Disputes",
              desc: "Escrow-based payment ensures fairness and transparency."
            },
            {
              icon: <Briefcase className="text-blue-600 mt-1" />,
              title: "Remote-first Platform",
              desc: "Post and work from anywhere — fully remote system."
            }
          ].map(({ icon, title, desc }, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="flex gap-4 items-start bg-white rounded-xl shadow-lg border border-neutral-200 hover:shadow-xl transition-shadow p-8"
            >
              <div className="shrink-0">{icon}</div>
              <div>
                <h4 className="font-semibold text-lg mb-1 text-gray-900">{title}</h4>
                <p className="text-gray-700">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-28 px-6 bg-neutral-100">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Find answers to common questions about UniMarket.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
            <FAQAccordion />
            <div className="mt-10 pt-6 border-t border-neutral-100 text-center">
              <span className="text-gray-700 text-base">Still have questions? <a href="mailto:contact@unimarket.com" className="text-blue-600 underline">Contact us</a></span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 flex justify-center items-center bg-white">
        <Card className="w-full max-w-2xl border border-neutral-200 shadow-lg rounded-2xl bg-white text-center">
          <CardContent className="space-y-8 py-16 px-10">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold mb-2 text-gray-900"
            >
              Ready to Get Started?
            </motion.h2>
            <p className="text-lg mb-6 max-w-xl mx-auto text-gray-700">
              Whether you're a student looking to build your future or an individual seeking remote help — we've got you covered.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/register">Create Your Free Account</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-neutral-200 py-6 px-6 mt-10 text-center text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between gap-2">
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

function FAQAccordion() {
  const faqs = [
    {
      q: "Who can join UniMarket?",
      a: "Only verified university students and employers can join. Students must provide valid university credentials during registration.",
    },
    {
      q: "How does escrow work?",
      a: "Employers fund the project upfront. Payment is held securely and only released to the student after the employer approves the completed work.",
    },
    {
      q: "What types of jobs can be posted?",
      a: "Any remote-friendly development, design, or tech-related job suitable for university students. All jobs must comply with our terms of service.",
    },
    {
      q: "Is there a fee to use UniMarket?",
      a: "Registration is free. A small service fee is deducted from each completed transaction to support platform operations and security.",
    },
    {
      q: "How do I get support?",
      a: "You can contact our support team anytime at contact@unimarket.com.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <div>
      {faqs.map((item, i) => (
        <div key={i} className="border-b border-neutral-100 last:border-b-0">
          <button
            className={`w-full flex items-center justify-between py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group ${open === i ? 'text-blue-600' : 'text-gray-900'} font-semibold text-lg transition-colors`}
            aria-expanded={open === i}
            aria-controls={`faq-panel-${i}`}
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span>{item.q}</span>
            <ChevronDown
              className={`ml-4 h-6 w-6 transform transition-transform duration-300 ${open === i ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}
              aria-hidden="true"
            />
          </button>
          <div
            id={`faq-panel-${i}`}
            className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
            aria-hidden={open !== i}
          >
            <div className="pb-5 pr-2 text-gray-700 text-base">
              {item.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
