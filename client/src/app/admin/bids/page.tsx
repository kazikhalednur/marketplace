"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type AdminBid = {
  id: string;
  job: string;
  bidder: string;
  amount: string;
  status: "pending" | "accepted" | "rejected";
  submitted_at: string;
};

const MOCK_BIDS: AdminBid[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `b_${i+1}`,
  job: `Sample Job ${((i % 10) + 1)}`,
  bidder: `freelancer${i+1}`,
  amount: `${150 + i}`,
  status: i % 3 === 0 ? "pending" : i % 3 === 1 ? "accepted" : "rejected",
  submitted_at: new Date(Date.now() - i * 7200000).toISOString(),
}));

export default function AdminBidsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return MOCK_BIDS.filter((b) => {
      if (status && b.status !== status) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${b.id} ${b.job} ${b.bidder}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [status, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  const exportCSV = () => {
    const cols = ["id","job","bidder","amount","status","submitted_at"];
    const rows = filtered.map(b => [b.id, b.job, b.bidder, b.amount, b.status, b.submitted_at]);
    const csv = [cols.join(","), ...rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bids.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Bids</h1>
      <p className="text-muted-foreground mb-4">Review and moderate bids.</p>

      <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search by job or bidder"
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        />
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <div />
      </div>

      <div className="flex items-center justify-end mb-2">
        <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">Bid ID</th>
              <th className="text-left px-3 py-2">Job</th>
              <th className="text-left px-3 py-2">Bidder</th>
              <th className="text-left px-3 py-2">Amount</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={6}>No bids found.</td>
              </tr>
            ) : (
              paged.map((b) => (
                <tr key={b.id} className="border-t border-border/60">
                  <td className="px-3 py-2 text-xs">{b.id}</td>
                  <td className="px-3 py-2">{b.job}</td>
                  <td className="px-3 py-2 text-sm">{b.bidder}</td>
                  <td className="px-3 py-2 text-sm">{b.amount}</td>
                  <td className="px-3 py-2 text-xs capitalize">
                    <span className={`${b.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : b.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'} px-2 py-1 rounded-full font-medium`}>{b.status}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(b.submitted_at).toLocaleString()}</td>
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
              <Button key={`pg_bids_${p}`} onClick={() => setPage(p)} variant={isActive ? undefined : "outline"} size="sm">{p}</Button>
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


