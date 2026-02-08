"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
};

const MOCK_AUDIT: AuditEntry[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `a_${i+1}`,
  actor: i % 3 === 0 ? "admin1" : "admin2",
  action: i % 2 === 0 ? "updated" : "deleted",
  target: i % 2 === 0 ? `job j_${i+3}` : `user u_${i+5}`,
  at: new Date(Date.now() - i * 1800000).toISOString(),
}));

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filtered = useMemo(() => {
    return MOCK_AUDIT.filter((e) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${e.actor} ${e.action} ${e.target}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), [filtered, page, pageSize]);

  const exportCSV = () => {
    const cols = ["id","actor","action","target","at"];
    const rows = filtered.map(e => [e.id, e.actor, e.action, e.target, e.at]);
    const csv = [cols.join(","), ...rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Audit Logs</h1>
      <p className="text-muted-foreground mb-4">Track admin actions and changes.</p>

      <div className="border border-border rounded-lg p-4 mb-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actor/action/target"
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
        />
      </div>
      <div className="flex items-center justify-end mb-2">
        <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">Actor</th>
              <th className="text-left px-3 py-2">Action</th>
              <th className="text-left px-3 py-2">Target</th>
              <th className="text-left px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={4}>No entries</td>
              </tr>
            ) : (
              paged.map((e) => (
                <tr key={e.id} className="border-t border-border/60">
                  <td className="px-3 py-2">{e.actor}</td>
                  <td className="px-3 py-2">{e.action}</td>
                  <td className="px-3 py-2">{e.target}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(e.at).toLocaleString()}</td>
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
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border border-border rounded text-sm"
          >Prev</button>
          {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
            const p = idx + 1;
            const isActive = p === page;
            return (
              <button key={`pg_audit_${p}`} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>{p}</button>
            );
          })}
          {totalPages > 7 && <span className="px-1 text-muted-foreground">…</span>}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border border-border rounded text-sm"
          >Next</button>
        </div>
      </div>
    </div>
  );
}


