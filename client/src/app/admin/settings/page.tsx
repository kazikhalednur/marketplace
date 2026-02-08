"use client";

import React, { useState } from "react";

export default function AdminSettingsPage() {
  const [apiBaseUrl, setApiBaseUrl] = useState("https://api.example.com");
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-4">Platform configuration.</p>

      <div className="space-y-4">
        <div className="border border-border rounded-lg p-4">
          <label className="text-sm font-medium">API Base URL</label>
          <input
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrl(e.target.value)}
            className="mt-2 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
          />
        </div>

        <div className="border border-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Maintenance Mode</div>
            <div className="text-xs text-muted-foreground">Temporarily disable user access</div>
          </div>
          <input type="checkbox" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} />
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 border border-border rounded bg-primary/10 text-primary">Save (Mock)</button>
        </div>
      </div>
    </div>
  );
}


