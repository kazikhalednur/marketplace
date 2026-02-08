"use client";

import React from "react";

export default function AdminHomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Key metrics and quick actions.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Users</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Active Jobs</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Open Milestones</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
      </div>
    </div>
  );
}


