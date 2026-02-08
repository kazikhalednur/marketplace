"use client";

import React from "react";
import { useGetDropdownsQuery } from "@/features/api/jobsApi";

export default function AdminTaxonomyPage() {
  const { data, isLoading } = useGetDropdownsQuery();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Taxonomy</h1>
      <p className="text-muted-foreground mb-4">Manage categories, skills, and tags.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Categories</h2>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <ul className="text-sm list-disc pl-5">
              {(data?.categories ?? []).map((c) => (
                <li key={c.id} className="py-0.5">{c.name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Skills</h2>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <ul className="text-sm list-disc pl-5 columns-1 md:columns-2">
              {(data?.skills ?? []).map((s) => (
                <li key={s.id} className="py-0.5 break-inside-avoid">{s.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


