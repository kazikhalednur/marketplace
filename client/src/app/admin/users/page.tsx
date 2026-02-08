"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/ui/Avatar";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  usePatchUserMutation,
  useDeleteUserMutation,
  type AdminUser,
  type CreateUserPayload,
} from "@/features/api/adminApi";

// Helper to extract page number from URL
function extractPageFromUrl(url: string | null): number | null {
  if (!url) return null;
  const match = url.match(/[?&]page=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Helper to calculate total pages from count and page size
function calculateTotalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  
  // Password visibility states
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateUserPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    phone: null,
    role: "client",
    is_active: true,
    is_staff: false,
  });

  // API queries
  const { data, isLoading, error, refetch } = useGetUsersQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    role: role || undefined,
    is_active: isActive === "active" ? true : isActive === "inactive" ? false : undefined,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [patchUser, { isLoading: isPatching }] = usePatchUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Calculate pagination
  const total = data?.count || 0;
  const totalPages = useMemo(() => calculateTotalPages(total, pageSize), [total, pageSize]);
  const users = data?.results || [];
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  // Update page when next/previous URLs change
  useEffect(() => {
    if (data?.next) {
      const nextPage = extractPageFromUrl(data.next);
      if (nextPage && nextPage === page + 1) {
        // Page is correct
      }
    }
  }, [data, page]);

  const allSelectedOnPage = useMemo(
    () => users.length > 0 && users.every((u) => selected[u.id]),
    [users, selected]
  );

  const toggleSelectAll = (checked: boolean) => {
    const next = { ...selected };
    users.forEach((u) => {
      next[u.id] = checked;
    });
    setSelected(next);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setIsActive(value);
    setPage(1);
  };

  const openCreateDialog = () => {
    setFormData({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      phone: null,
      role: "client",
      is_active: true,
      is_staff: false,
    });
    setShowCreatePassword(false);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      is_staff: user.is_staff,
    });
    setShowEditPassword(false);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (userId: string) => {
    setDeletingUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = async () => {
    try {
      // Remove read-only fields from payload
      const createData = { ...formData };
      delete (createData as any).email_verified;
      delete (createData as any).is_google_login;
      delete (createData as any).is_resent_email;
      delete (createData as any).is_superuser;
      delete (createData as any).groups;
      delete (createData as any).user_permissions;
      
      await createUser(createData).unwrap();
      setIsCreateDialogOpen(false);
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        phone: null,
        role: "client",
        is_active: true,
        is_staff: false,
      });
    } catch (error) {
      console.error("Failed to create user:", error);
      // You can add toast notification here
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      // Remove password from data if it's empty, and remove read-only fields
      const updateData = { ...formData };
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }
      // Remove read-only fields that shouldn't be updated
      delete (updateData as any).email_verified;
      delete (updateData as any).is_google_login;
      delete (updateData as any).is_resent_email;
      delete (updateData as any).is_superuser;
      delete (updateData as any).groups;
      delete (updateData as any).user_permissions;
      
      await updateUser({ id: editingUser.id, data: updateData }).unwrap();
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
      // You can add toast notification here
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      await deleteUser(deletingUserId).unwrap();
      setIsDeleteDialogOpen(false);
      setDeletingUserId(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      // You can add toast notification here
    }
  };

  const exportCSV = () => {
    const cols = [
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "role",
      "is_active",
      "email_verified",
      "is_google_login",
      "date_joined",
    ];
    const rows = (Object.keys(selected).some((id) => selected[id])
      ? users.filter((u) => selected[u.id])
      : users
    ).map((u) => [
      u.id,
      u.username,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.is_active ? "active" : "inactive",
      u.email_verified ? "yes" : "no",
      u.is_google_login ? "yes" : "no",
      u.date_joined,
    ]);
    const csv = [
      cols.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get user display name
  const getUserDisplayName = (user: AdminUser) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user.username;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">Search, filter, and manage users.</p>
        </div>
        <Button onClick={openCreateDialog}>Create User</Button>
      </div>

      <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search name, username, email"
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        />
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        >
          <option value="">All Roles</option>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={isActive}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div />
      </div>

      <div className="flex items-center justify-end mb-2">
        <Button variant="outline" size="sm" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {isLoading && (
        <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
          Loading users...
        </div>
      )}

      {error && (
        <div className="border border-border rounded-lg p-4 bg-destructive/10 text-destructive">
          Error loading users. Please try again.
        </div>
      )}

      {!isLoading && !error && (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="text-left px-3 py-2">User</th>
                <th className="text-left px-3 py-2">Username</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Role</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Email Verified</th>
                <th className="text-left px-3 py-2">Google Login</th>
                <th className="text-left px-3 py-2">Joined</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-6 text-muted-foreground text-center"
                    colSpan={10}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-border/60">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!selected[u.id]}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [u.id]: e.target.checked,
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar
                          name={getUserDisplayName(u)}
                          size={28}
                        />
                        <div className="min-w-0">
                          <div className="font-medium leading-tight truncate">
                            {getUserDisplayName(u)}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs">{u.username}</td>
                    <td className="px-3 py-2 text-xs">{u.email}</td>
                    <td className="px-3 py-2 capitalize">
                      <span className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-medium">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs capitalize">
                      <span
                        className={`${
                          u.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        } px-2 py-1 rounded-full font-medium`}
                      >
                        {u.is_active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={`${
                          u.email_verified
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20"
                        } px-2 py-1 rounded-full font-medium`}
                      >
                        {u.email_verified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={`${
                          u.is_google_login
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20"
                        } px-2 py-1 rounded-full font-medium`}
                      >
                        {u.is_google_login ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(u)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(u.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages} • {total} total
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-border rounded-md bg-background text-foreground text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrevious || page <= 1}
              variant="outline"
              size="sm"
            >
              Prev
            </Button>
            {/* Show page numbers around current page */}
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              const isActive = pageNum === page;
              return (
                <Button
                  key={`pg_${pageNum}`}
                  onClick={() => setPage(pageNum)}
                  variant={isActive ? undefined : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 7 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasNext || page >= totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Create a new user account. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Username *</label>
                <input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <input
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <input
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Password *</label>
              <div className="relative mt-1">
                <input
                  type={showCreatePassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCreatePassword ? "Hide password" : "Show password"}
                >
                  {showCreatePassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value || null,
                    })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "client" | "freelancer" | "admin",
                    })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_staff}
                  onChange={(e) =>
                    setFormData({ ...formData, is_staff: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Staff</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Username *</label>
                <input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <input
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <input
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Password (leave empty to keep current)</label>
              <div className="relative mt-1">
                <input
                  type={showEditPassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground"
                  placeholder="Enter new password or leave empty"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showEditPassword ? "Hide password" : "Show password"}
                >
                  {showEditPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value || null,
                    })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "client" | "freelancer" | "admin",
                    })
                  }
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_staff}
                  onChange={(e) =>
                    setFormData({ ...formData, is_staff: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Staff</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
