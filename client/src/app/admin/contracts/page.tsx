"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FreelancerContractListItem } from "@/features/api/freelancerContractsApi";

export default function AdminContractsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const MOCK_CONTRACTS: FreelancerContractListItem[] = useMemo(() => (
    Array.from({ length: 31 }).map((_, i) => ({
      id: `c_${i+1}`,
      job_title: `Contract for Job ${i+1}`,
      status: i % 4 === 0 ? "active" : i % 4 === 1 ? "completed" : i % 4 === 2 ? "pending" : "cancelled",
      start_date: new Date(Date.now() - (i + 3) * 86400000).toISOString(),
      end_date: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
    }))
  ), []);
  const contracts = useMemo(() => MOCK_CONTRACTS.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), [MOCK_CONTRACTS, page, pageSize]);
  const total = MOCK_CONTRACTS.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const exportCSV = () => {
    const cols = ["id","job_title","status","start_date","end_date"];
    const rows = MOCK_CONTRACTS.map(c => [c.id, c.job_title, c.status, c.start_date, c.end_date]);
    const csv = [cols.join(","), ...rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contracts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Contracts</h1>
      <p className="text-muted-foreground mb-4">Monitor and manage contracts.</p>

      <div className="flex items-center justify-end mb-2">
        <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Title</th>
              <th className="text-left px-3 py-2">Start</th>
              <th className="text-left px-3 py-2">End</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={6}>No contracts found.</td>
              </tr>
            ) : (
              contracts.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-3 py-2 text-xs">{c.id}</td>
                  <td className="px-3 py-2">{c.job_title || "—"}</td>
                  <td className="px-3 py-2 text-sm">{c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 text-sm">{c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 text-xs capitalize">
                    <span className={`${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : c.status === 'completed' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : c.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'} px-2 py-1 rounded-full font-medium`}>{c.status || "—"}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            <Button key={`pg_contracts_${p}`} onClick={() => setPage(p)} variant={isActive ? undefined : "outline"} size="sm">{p}</Button>
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
    </div>
  );
}


