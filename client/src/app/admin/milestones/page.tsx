"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

// We'll leverage existing client milestones endpoint for listing by contract; for admin view, accept a contract id filter for now.
export default function AdminMilestonesPage() {
  const [contractId, setContractId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const enabled = contractId.trim().length > 0;
  const MOCK_STEPS = useMemo(() => (
    Array.from({ length: 26 }).map((_, i) => ({
      id: `m_${i+1}`,
      step_number: i + 1,
      title: `Milestone ${i+1}`,
      description: `Static milestone description ${i+1}`,
      amount: (100 + i * 10).toString(),
      start_date: new Date(Date.now() - (i + 1) * 86400000).toISOString().slice(0,10),
      due_date: new Date(Date.now() + (i + 2) * 86400000).toISOString().slice(0,10),
      status: i % 3 === 0 ? "in_review" : i % 3 === 1 ? "accepted" : "rejected",
    }))
  ), []);
  const [isUpdating, setIsUpdating] = useState(false);

  const all = useMemo(() => (!enabled ? [] : MOCK_STEPS), [enabled, MOCK_STEPS]);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allowedStatuses = ["in_review", "accepted", "rejected"] as const;

  const handleStatusChange = async (stepId: string, value: string) => {
    if (!allowedStatuses.includes(value as typeof allowedStatuses[number])) return;
    // Static mode: simulate update
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 400);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Milestones</h1>
      <p className="text-muted-foreground mb-4">Review and edit milestones.</p>

      <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={contractId}
          onChange={(e) => { setContractId(e.target.value); setPage(1); }}
          placeholder="Filter by Contract ID"
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        />
        <div />
        <div />
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">Step #</th>
              <th className="text-left px-3 py-2">Title</th>
              <th className="text-left px-3 py-2">Amount</th>
              <th className="text-left px-3 py-2">Dates</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!enabled ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={5}>Enter a Contract ID to load milestones.</td>
              </tr>
            ) : all.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={5}>No milestones found.</td>
              </tr>
            ) : (
              all.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map((m) => (
                <tr key={m.id} className="border-t border-border/60">
                  <td className="px-3 py-2">{m.step_number}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{m.description}</div>
                  </td>
                  <td className="px-3 py-2 text-sm">{m.amount}</td>
                  <td className="px-3 py-2 text-xs">{m.start_date || "—"} → {m.due_date || "—"}</td>
                  <td className="px-3 py-2 text-xs capitalize">
                    <span className={`${m.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : m.status === 'in_review' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'} px-2 py-1 rounded-full font-medium`}>{m.status === 'in_review' ? 'in review' : m.status}</span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <select
                      disabled={isUpdating}
                      value={m.status}
                      onChange={(e) => handleStatusChange(m.id as string, e.target.value)}
                      className="px-2 py-1 border border-border rounded bg-background text-foreground"
                    >
                      {allowedStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s === 'in_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enabled && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-sm text-muted-foreground">Page {page} of {totalPages} • {total} total</div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border border-border rounded-md bg-background text-foreground text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              variant="outline"
              size="sm"
            >Prev</Button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
              const p = idx + 1;
              const isActive = p === page;
              return (
                <Button key={`pg_milestones_${p}`} onClick={() => setPage(p)} variant={isActive ? undefined : "outline"} size="sm">{p}</Button>
              );
            })}
            {totalPages > 7 && <span className="px-1 text-muted-foreground">…</span>}
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              variant="outline"
              size="sm"
            >Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}


