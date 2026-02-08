"use client";

import React, { useMemo, useState } from "react";

type Conversation = {
  id: string;
  participants: string[];
  last_message: string;
  updated_at: string;
};

const MOCK_CONVOS: Conversation[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `room_${i+1}`,
  participants: ["client1", `freelancer${i+1}`],
  last_message: `Last message sample ${i+1}`,
  updated_at: new Date(Date.now() - i * 5400000).toISOString(),
}));

export default function AdminMessagesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filtered = useMemo(() => {
    return MOCK_CONVOS.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${c.id} ${c.participants.join(" ")} ${c.last_message}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), [filtered, page, pageSize]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Messages</h1>
      <p className="text-muted-foreground mb-4">Moderate conversations and messages.</p>

      <div className="border border-border rounded-lg p-4 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search room/participants/message"
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
        />
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">Room</th>
              <th className="text-left px-3 py-2">Participants</th>
              <th className="text-left px-3 py-2">Last Message</th>
              <th className="text-left px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={4}>No conversations found.</td>
              </tr>
            ) : (
              paged.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-3 py-2 text-xs">{c.id}</td>
                  <td className="px-3 py-2 text-sm">{c.participants.join(", ")}</td>
                  <td className="px-3 py-2 text-xs">{c.last_message}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(c.updated_at).toLocaleString()}</td>
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
              <button key={`pg_msgs_${p}`} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>{p}</button>
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


