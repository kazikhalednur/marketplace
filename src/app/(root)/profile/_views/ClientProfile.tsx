"use client";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { useUpdateClientProfileMutation, useUploadImageMutation } from "@/features/api/apiSlice";
import { useGetMyJobsQuery } from "@/features/api/jobsApi";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { transformClientFormToPayload } from "@/utils/profile";
import { getStatusBadge } from "@/utils/statusBadge";
import { Briefcase, Building2, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, DollarSign, Edit, Globe, Key, Linkedin, Mail, Phone, Shield, Twitter, User } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface User {
  avatar?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  about?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  company_name?: string;
  phone?: string;
  email_verified?: boolean;
  is_payment_verified?: boolean;
  is_phone_verified?: boolean;
  username?: string;
  is_google_login?: boolean;
  student_id?: string;
  projects?: Array<{ name: string; link: string; description: string }>;
}

export default function ClientProfile({ user, onProfileUpdate }: { user: User; onProfileUpdate?: () => void }) {
  const [editMode, setEditMode] = useState(false);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateClientProfileMutation();
  const [uploadImage] = useUploadImageMutation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalForm, setOriginalForm] = useState<typeof form | null>(null);
  const userState = useAppSelector((state) => state.user);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  // Fetch client's jobs
  const { data: jobsData, isLoading: jobsLoading } = useGetMyJobsQuery({
    page: currentPage,
    pageSize: pageSize,
  });

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
    const avatarUrl = user.avatar.trim();
    if (!avatarUrl) return false;
    
    // Check if it's a placeholder
    const placeholderList = ["/avatar-placeholder.png", "/placeholder.png", "placeholder", "avatar-placeholder"];
    const isPlaceholder = placeholderList.some(placeholder => 
      avatarUrl.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    return !isPlaceholder;
  }

  // Helper to get display name
  const getDisplayName = useCallback(() => {
    if (user?.name && user.name.trim().length > 0) {
      return user.name;
    }
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    }
    return 'Client User';
  }, [user]);

  // Helper to format budget
  function formatBudget(minBudget: string, maxBudget: string, isFixed: boolean) {
    if (isFixed) {
      return `$${minBudget} - $${maxBudget}`;
    } else {
      return `$${minBudget}/hr - $${maxBudget}/hr`;
    }
  }



  // Modal form state
  const [form, setForm] = useState({
    avatar: user.avatar || "",
    name: getDisplayName(),
    about: user.about || "",
    email: user.email || "",
    website: user.website || "",
    linkedin: user.linkedin || "",
    twitter: user.twitter || "",
    company_name: user.company_name || "",
    phone: user.phone || "",
  });

  // Update form when user prop changes
  useEffect(() => {
    setForm({
      avatar: user.avatar || "",
      name: getDisplayName(),
      about: user.about || "",
      email: user.email || "",
      website: user.website || "",
      linkedin: user.linkedin || "",
      twitter: user.twitter || "",
      company_name: user.company_name || "",
      phone: user.phone || "",
    });
    setAvatarPreview(user.avatar || "");
  }, [user, getDisplayName]);

  // Set original form when edit mode is opened
  useEffect(() => {
    if (editMode && !originalForm) {
      setOriginalForm({
        avatar: user.avatar || "",
        name: getDisplayName(),
        about: user.about || "",
        email: user.email || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
        twitter: user.twitter || "",
        company_name: user.company_name || "",
        phone: user.phone || "",
      });
    }
  }, [editMode, user, originalForm, getDisplayName]);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar || "");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    if (!editMode) return;
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setEditMode(false);
        setOriginalForm(null);
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
      setSelectedImage(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  // Helper: check if form has changes
  const hasChanges = useCallback(() => {
    if (!originalForm) return false;
    
    // Check if there's a selected image (new image to upload)
    if (selectedImage) return true;
    
    const formKeys = Object.keys(form) as (keyof typeof form)[];
    for (const key of formKeys) {
      if (form[key] !== originalForm[key]) {
        return true;
      }
    }
    return false;
  }, [form, originalForm, selectedImage]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updatedForm = { ...form };
      
      // If there's a selected image, upload it first
      if (selectedImage) {
        try {
          const formData = new FormData();
          formData.append('image', selectedImage);

          const response = await uploadImage(formData).unwrap();
          
          if (response.success) {
            updatedForm.avatar = response.data.image;
            setAvatarPreview(response.data.image);
            setSelectedImage(null);
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
          return; // Don't proceed with profile update if image upload fails
        }
      }
      
      const payload = transformClientFormToPayload(updatedForm, userState);
      await updateProfile(payload).unwrap();
      setEditMode(false);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-muted/60 to-background/80 pb-20">
      <div className="absolute inset-0 pointer-events-none select-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <section className="relative bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/60 rounded-3xl shadow-lg p-8 flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 mt-4 backdrop-blur-sm">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/60 to-accent/40 blur-md opacity-40" />
            {hasRealAvatar() ? (
              <Image
                src={user.avatar || ""}
                alt={getDisplayName() || ""}
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
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">{getDisplayName()}</h1>
            <span className="text-base text-muted-foreground font-medium">{user.role}</span>
            
            {/* Username */}
            {user.username && (
              <div className="flex items-center gap-2 mt-1">
                <Icon icon={User} size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">@{user.username}</span>
              </div>
            )}
            
            {/* Company Name */}
            {user.company_name && (
              <div className="flex items-center gap-2 mt-2">
                <Icon icon={Building2} size={16} className="text-primary" />
                <span className="text-sm font-semibold text-primary">{user.company_name}</span>
              </div>
            )}
            
            {/* Bio */}
            {user.about && (
            <span className="text-base text-muted-foreground font-normal mt-1 mb-2 max-w-xl">{user.about}</span>
            )}
            
            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-sm text-muted-foreground mt-2">
              {user.email && (
                <a href={`mailto:${user.email}`} className="inline-flex items-center gap-1 hover:text-primary transition" aria-label="Email">
                  <Icon icon={Mail} size={16} /> {user.email}
                </a>
              )}
              {user.phone && (
                <span className="inline-flex items-center gap-1">
                  <Icon icon={Phone} size={16} /> {user.phone}
                </span>
              )}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-primary transition" aria-label="Website">
                  <Icon icon={Globe} size={16} /> Website
                </a>
              )}
            </div>
            
            {/* Social Links */}
            {(user.linkedin || user.twitter) && (
            <div className="flex gap-2 mt-3">
              {user.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" className="rounded-full p-2 hover:bg-accent transition">
                    <Icon icon={Linkedin} size={20} />
                  </a>
                )}
                {user.twitter && (
                  <a href={user.twitter} target="_blank" rel="noopener" aria-label="Twitter" className="rounded-full p-2 hover:bg-accent transition">
                    <Icon icon={Twitter} size={20} />
                  </a>
                )}
              </div>
            )}
            
            {/* Verification Status */}
            <div className="flex flex-wrap gap-3 mt-4">
              {user.email_verified && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Email Verified
                </span>
              )}
              {user.is_payment_verified && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  Payment Verified
                </span>
              )}
              {user.is_phone_verified && (
                <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  <Phone className="w-3 h-3" />
                  Phone Verified
                </span>
              )}
              {user.is_google_login && (
                <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  <Key className="w-3 h-3" />
                  Google Login
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div className="absolute top-6 right-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit className="w-4 h-4 mr-1" /> Edit Profile
            </Button>
          </div>
        </section>
        
        {/* About Section */}
        <section className="mb-8 bg-gradient-to-br from-card/90 to-card/80 border border-border/60 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          <h2 className="font-bold text-xl mb-3 text-foreground border-l-4 border-primary pl-3">About</h2>
          {user.about ? (
            <p className="text-muted-foreground text-base leading-relaxed">
              {user.about}
            </p>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-base leading-relaxed mb-2">
                Tell us about yourself
              </p>
              <p className="text-muted-foreground text-sm">
                Share your story, experience, and what drives you in your professional journey.
              </p>
            </div>
          )}
        </section>
        
        {/* Jobs Section */}
        <section className="mb-8 bg-gradient-to-br from-card/90 to-card/80 border border-border/60 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          <h2 className="font-bold text-xl mb-6 text-foreground border-l-4 border-primary pl-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            My Jobs
          </h2>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading jobs...</span>
            </div>
          ) : jobsData && jobsData.jobs.length > 0 ? (
            <div className="space-y-4">
              {jobsData.jobs.map((job) => (
                <div key={job.id} className="bg-gradient-to-br from-muted/60 to-muted/30 rounded-xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-primary text-lg truncate">{job.title || 'Untitled Job'}</h3>
                                            {getStatusBadge(job.status)}
                  </div>
                  
                  {job.description && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-primary mb-1 block">About:</span>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    {/* Budget */}
                    <div className="flex items-center gap-2">
                      <Icon icon={DollarSign} size={14} className="text-primary" />
                      <span className="text-foreground font-medium">
                        {formatBudget(String(job.min_budget || '0'), String(job.max_budget || '0'), job.is_fixed || false)}
                      </span>
                    </div>
                    
                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <Icon icon={Calendar} size={14} className="text-primary" />
                      <span className="text-muted-foreground">{job.duration?.toString() || 'N/A'}</span>
                    </div>
                    
                    {/* Experience Level */}
                    <div className="flex items-center gap-2">
                      <Icon icon={User} size={14} className="text-primary" />
                      <span className="text-muted-foreground">{job.experience_level}</span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          +{job.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Pagination */}
              {jobsData && jobsData.jobs.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/20">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, jobsData.count || 0)} of {jobsData.count || 0} jobs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      Page {currentPage} of {Math.ceil((jobsData.count || 0) / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil((jobsData.count || 0) / pageSize)}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon icon={Briefcase} size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-base leading-relaxed">
                No jobs posted yet. Start by creating your first job posting.
              </p>
              <Button className="mt-4" variant="outline">
                Create Job
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div ref={modalRef} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg min-h-[400px] max-h-[80vh] p-0 relative animate-in fade-in-0 zoom-in-95 flex flex-col">
            {/* Loading overlay */}
            {isUpdating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
                  <p className="text-foreground font-medium">Saving profile...</p>
                </div>
              </div>
            )}
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-primary text-2xl font-bold z-10"
              onClick={() => {
                setEditMode(false);
                setOriginalForm(null);
              }}
              aria-label="Close edit modal"
              disabled={isUpdating}
            >
              ×
            </button>
            <h2 className="font-bold text-2xl mb-2 text-center pt-8">Edit Profile</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-6 px-8 pb-8 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
              {/* Profile Image Upload */}
              <div className="flex flex-col gap-2 items-center">
                <label className="font-semibold text-sm mb-1">Profile Image</label>
                <div className="relative w-24 h-24 mb-2">
                  {avatarPreview && avatarPreview.trim() !== "" && !["/avatar-placeholder.png", "/placeholder.png", "placeholder", "avatar-placeholder"].some(placeholder => 
                    avatarPreview.trim().toLowerCase().includes(placeholder.toLowerCase())
                  ) ? (
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

              {/* Form Fields */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Full name" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Company Name</label>
                <input name="company_name" value={form.company_name} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Company name" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Phone number" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Bio</label>
                <textarea name="about" value={form.about} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted min-h-[60px]" placeholder="Short bio/about you" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Email address" type="email" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Website</label>
                <input name="website" value={form.website} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Website URL" type="url" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">LinkedIn</label>
                <input name="linkedin" value={form.linkedin} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="LinkedIn profile URL" type="url" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Twitter</label>
                <input name="twitter" value={form.twitter} onChange={handleChange} className="input rounded-md border px-3 py-2 bg-muted" placeholder="Twitter profile URL" type="url" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  className="btn btn-outline px-4 py-2 rounded-md" 
                  onClick={() => {
                    setEditMode(false);
                    setOriginalForm(null);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !hasChanges()}
                  className="flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-base shadow-lg bg-gradient-to-tr from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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