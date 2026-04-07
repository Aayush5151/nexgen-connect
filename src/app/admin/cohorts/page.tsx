"use client";

import { useState } from "react";
import { Eye, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const cohorts = [
  {
    id: "1",
    name: "Mumbai \u2192 Germany, Winter 2027",
    level: 3,
    members: 34,
    active: 12,
    created: "15 Jan 2026",
    status: "Active" as const,
  },
  {
    id: "2",
    name: "Delhi \u2192 Canada, Fall 2026",
    level: 4,
    members: 56,
    active: 23,
    created: "10 Dec 2025",
    status: "Active" as const,
  },
  {
    id: "3",
    name: "Bangalore \u2192 UK, Spring 2027",
    level: 2,
    members: 28,
    active: 8,
    created: "20 Feb 2026",
    status: "Active" as const,
  },
  {
    id: "4",
    name: "Chennai \u2192 Australia, Winter 2026",
    level: 4,
    members: 42,
    active: 0,
    created: "5 Aug 2025",
    status: "Archived" as const,
  },
  {
    id: "5",
    name: "Hyderabad \u2192 USA, Fall 2027",
    level: 1,
    members: 15,
    active: 7,
    created: "1 Mar 2026",
    status: "Active" as const,
  },
  {
    id: "6",
    name: "Pune \u2192 Singapore, Spring 2026",
    level: 3,
    members: 38,
    active: 0,
    created: "12 Jun 2025",
    status: "Archived" as const,
  },
];

const levelOptions = ["All Levels", "Level 1", "Level 2", "Level 3", "Level 4"];
const statusOptions = ["All Status", "Active", "Archived"];

export default function CohortsPage() {
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [statusFilter, setStatusFilter] = useState("All Status");

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Cohorts</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage student cohort groups and intake periods
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="h-9 rounded-xl border border-border/50 bg-white px-3 text-sm text-text-secondary outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        >
          {levelOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-xl border border-border/50 bg-white px-3 text-sm text-text-secondary outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3">Cohort Name</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Members</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <tr
                  key={cohort.id}
                  className="border-b border-border/30 last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-navy">
                    {cohort.name}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className="bg-navy/10 text-[10px] font-semibold text-navy">
                      Level {cohort.level}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {cohort.members}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {cohort.active}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-text-muted">
                    {cohort.created}
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        cohort.status === "Active"
                          ? "bg-emerald/10 text-emerald"
                          : "bg-muted text-text-muted"
                      }`}
                    >
                      {cohort.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-7 rounded-lg px-2 text-xs text-navy hover:text-coral"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-7 rounded-lg px-2 text-xs text-text-muted hover:text-amber"
                      >
                        <Archive className="mr-1 h-3.5 w-3.5" />
                        Archive
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
