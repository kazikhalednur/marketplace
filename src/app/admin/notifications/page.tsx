"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type NotificationLog = {
  id: string;
  user: string;
  type: string;
  message: string;
  delivered_at: string;
};

const MOCK_NOTIFICATIONS: NotificationLog[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `n_${i+1}`,
  user: `user${(i%7)+1}`,
  type: i % 2 === 0 ? "chat" : "system",
  message: `Demo notification ${i+1}`,
  delivered_at: new Date(Date.now() - i * 3600000).toISOString(),
}));

export default function AdminNotificationsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return MOCK_NOTIFICATIONS.filter((n) => {
      if (type && n.type !== type) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${n.user} ${n.message}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, type]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), [filtered, page, pageSize]);

  const exportCSV = () => {
    const cols = ["id","user","type","message","delivered_at"];
    const rows = filtered.map(n => [n.id, n.user, n.type, n.message, n.delivered_at]);
    const csv = [cols.join(","), ...rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notifications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Notifications</h1>
      <p className="text-muted-foreground mb-4">Logs, templates, and broadcasts.</p>

      <div className="border border-border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user/message"
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        >
          <option value="">All Types</option>
          <option value="chat">Chat</option>
          <option value="system">System</option>
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
              <th className="text-left px-3 py-2">User</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Message</th>
              <th className="text-left px-3 py-2">Delivered</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={4}>No notifications found.</td>
              </tr>
            ) : (
              paged.map((n) => (
                <tr key={n.id} className="border-t border-border/60">
                  <td className="px-3 py-2 text-sm">{n.user}</td>
                  <td className="px-3 py-2 text-xs capitalize"><span className={`${n.type === 'chat' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'} px-2 py-1 rounded-full font-medium`}>{n.type}</span></td>
                  <td className="px-3 py-2 text-xs">{n.message}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(n.delivered_at).toLocaleString()}</td>
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
              <Button key={`pg_notifs_${p}`} onClick={() => setPage(p)} variant={isActive ? undefined : "outline"} size="sm">{p}</Button>
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


