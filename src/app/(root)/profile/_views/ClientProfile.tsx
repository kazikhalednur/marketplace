"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { Edit, Mail, MapPin, Globe, Linkedin, Twitter, Github, CheckCircle2, GraduationCap, Check } from "lucide-react";

interface User {
  avatar?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  about?: string;
  location?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  projects?: Array<{ name: string; link: string; description: string }>;
}

export default function ClientProfile({ user, onSwitch }: { user: User; onSwitch: () => void }) {
  const [editMode, setEditMode] = useState(false);

  // Helper to get user initials
  function getUserInitials() {
    if (user?.name && user.name.trim().length > 0) {
      return user.name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
    }
    return null;
  }

  // Helper to determine if avatar is real
  function hasRealAvatar() {
    if (!user?.avatar) return false;
    const placeholderList = ["/avatar-placeholder.png", "/placeholder.png", "placeholder", "avatar-placeholder"];
    return !placeholderList.includes(user.avatar.trim());
  }

  // Modal form state
  const [form, setForm] = useState({
    avatar: user.avatar || "",
    name: user.name || "",
    about: user.about || "",
    location: user.location || "",
    email: user.email || "",
    website: user.website || "",
    linkedin: user.linkedin || "",
    twitter: user.twitter || "",
    github: user.github || "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || "");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    if (!editMode) return;
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setEditMode(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editMode]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  }
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Save logic (API call or parent callback)
    setEditMode(false);
  }
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-muted/60 to-background/80 pb-20">
      <div className="absolute inset-0 pointer-events-none select-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="max-w-3xl mx-auto px-4 pt-12">
        <section className="relative bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/60 rounded-3xl shadow-lg p-8 flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 mt-4 backdrop-blur-sm">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/60 to-accent/40 blur-md opacity-40" />
            {hasRealAvatar() ? (
              <Image
                src={user.avatar || ""}
                alt={user.name || ""}
                width={120}
                height={120}
                className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg relative z-10"
              />
            ) : getUserInitials() ? (
              <span className="w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary/70 via-accent/60 to-secondary/70 text-5xl font-extrabold text-white ring-4 ring-primary/30 shadow-lg select-none relative z-10 border-4 border-background">
                {getUserInitials()}
              </span>
            ) : (
              <Icon icon={CheckCircle2} size={64} className="w-32 h-32 rounded-full text-muted-foreground bg-muted ring-4 ring-primary/30 shadow-lg select-none relative z-10 border-4 border-background" />
            )}
            <span className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1.5 border-2 border-background z-20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </span>
          </div>
          {/* Info */}
          <div className="flex-1 flex flex-col gap-2 md:gap-3 items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">{user.name}</h1>
            <span className="text-base text-muted-foreground font-medium">{user.role}</span>
            {/* Rating */}
            <div className="flex items-center gap-2 mt-1 mb-1">
              <span className="text-2xl font-bold text-yellow-500">4.9</span>
              <span className="flex items-center">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className={`w-6 h-6 ${i <= 5 ? 'text-yellow-400' : 'text-yellow-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                ))}
              </span>
              <span className="text-sm text-muted-foreground font-medium ml-2">(18 ratings)</span>
            </div>
            <span className="text-base text-muted-foreground font-normal mt-1 mb-2 max-w-xl">{user.about}</span>
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-sm text-muted-foreground mt-2">
              {user.location && (
                <span className="inline-flex items-center gap-1"><Icon icon={MapPin} size={16} /> {user.location}</span>
              )}
              {user.email && (
                <a href={`mailto:${user.email}`} className="inline-flex items-center gap-1 hover:text-primary transition" aria-label="Email"><Icon icon={Mail} size={16} /> {user.email}</a>
              )}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-primary transition" aria-label="Website"><Icon icon={Globe} size={16} /> Website</a>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" className="rounded-full p-2 hover:bg-accent transition"><Icon icon={Linkedin} size={20} /></a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noopener" aria-label="Twitter" className="rounded-full p-2 hover:bg-accent transition"><Icon icon={Twitter} size={20} /></a>
              )}
              {user.github && (
                <a href={user.github} target="_blank" rel="noopener" aria-label="GitHub" className="rounded-full p-2 hover:bg-accent transition"><Icon icon={Github} size={20} /></a>
              )}
            </div>
          </div>
          {/* Edit/Switch Buttons */}
          <div className="absolute top-6 right-6 flex items-center gap-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onSwitch}
            >
              <GraduationCap className="w-4 h-4 mr-1" /> View as Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit className="w-4 h-4 mr-1" /> Edit Profile
            </Button>
          </div>
        </section>
        <section className="mb-8 bg-gradient-to-br from-card/90 to-card/80 border border-border/60 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          <h2 className="font-bold text-xl mb-3 text-foreground border-l-4 border-primary pl-3">About Me</h2>
          <p className="text-muted-foreground text-base leading-relaxed">{user.about}</p>
        </section>
        <section className="mb-8 bg-gradient-to-br from-card/90 to-card/80 border border-border/60 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          <h2 className="font-bold text-xl mb-3 text-foreground border-l-4 border-primary pl-3">Projects</h2>
          <ul className="flex flex-col gap-4">
            {user.projects?.map((project) => (
              <li key={project.name} className="flex flex-col">
                <a href={project.link} className="font-semibold text-primary hover:underline text-base">{project.name}</a>
                <span className="text-sm text-muted-foreground mt-0.5">{project.description}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div ref={modalRef} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg min-h-[400px] max-h-[80vh] p-0 relative animate-in fade-in-0 zoom-in-95 flex flex-col">
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-primary text-2xl font-bold"
              onClick={() => setEditMode(false)}
              aria-label="Close edit modal"
            >
              ×
            </button>
            <h2 className="font-bold text-2xl mb-2 text-center pt-8">Edit Profile</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-6 px-8 pb-8 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
              {/* Profile Image Upload */}
              <div className="flex flex-col gap-2 items-center">
                <label className="font-semibold text-sm mb-1">Profile Image</label>
                <div className="relative w-24 h-24 mb-2">
                  {avatarPreview && avatarPreview.trim() !== "" && !["/avatar-placeholder.png", "/placeholder.png", "placeholder", "avatar-placeholder"].includes(avatarPreview.trim()) ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile Preview"
                      width={48}
                      height={48}
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary/40 shadow"
                    />
                  ) : (form.name && form.name.trim().length > 0 ? (
                    <span className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary/70 via-accent/60 to-secondary/70 text-3xl font-extrabold text-white ring-4 ring-primary/30 shadow select-none border-2 border-primary/40">
                      {form.name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  ) : (
                    <Icon icon={CheckCircle2} size={48} className="w-24 h-24 rounded-full text-muted-foreground bg-muted ring-4 ring-primary/30 shadow select-none border-2 border-primary/40" />
                  ))}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Upload profile image" />
                  <span className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 text-xs shadow">Edit</span>
                </div>
              </div>
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Full name" required />
              </div>
              {/* Bio */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Bio</label>
                <textarea name="about" value={form.about} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted min-h-[60px]" placeholder="Short bio/about you" />
              </div>
              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Location" />
              </div>
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Email address" type="email" required />
              </div>
              {/* Website */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Website</label>
                <input name="website" value={form.website} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Website URL" type="url" />
              </div>
              {/* Socials */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">LinkedIn</label>
                <input name="linkedin" value={form.linkedin} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="LinkedIn profile URL" type="url" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Twitter</label>
                <input name="twitter" value={form.twitter} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Twitter profile URL" type="url" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">GitHub</label>
                <input name="github" value={form.github} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="GitHub profile URL" type="url" />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" className="btn btn-outline px-4 py-2 rounded-md" onClick={() => setEditMode(false)}>Cancel</button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-base shadow-lg bg-gradient-to-tr from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2"
                >
                  <Check className="w-5 h-5" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
} 