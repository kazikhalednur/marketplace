"use client";

import React from "react";

export default function AdminReportsPage() {
  const kpis = [
    { label: "Total Users", value: "1,245" },
    { label: "Active Jobs", value: "87" },
    { label: "Open Contracts", value: "56" },
    { label: "Milestones In Review", value: "23" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Reports</h1>
      <p className="text-muted-foreground mb-4">KPIs, charts, and exports.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">{k.label}</div>
            <div className="text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg p-6 text-sm text-muted-foreground">
        Charts placeholder (static)
      </div>
    </div>
  );
}


