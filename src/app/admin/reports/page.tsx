"use client";

import { useState } from "react";
import { Flag, XCircle, ShieldAlert, AlertTriangle, UserX, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

interface Report {
  id: string;
  reporter: string;
  reportedUser: string;
  reason: string;
  description: string;
  date: string;
}

const initialReports: Report[] = [
  {
    id: "1",
    reporter: "Ananya Sharma",
    reportedUser: "Rahul Verma",
    reason: "fake_profile",
    description:
      "This user appears to be using someone else's photos. The profile pictures don't match the video verification submitted. Multiple users have flagged similar concerns.",
    date: "4 Apr 2026",
  },
  {
    id: "2",
    reporter: "Vikram Rao",
    reportedUser: "Deepika Gupta",
    reason: "spam",
    description:
      "This user has been sending unsolicited promotional messages about visa consulting services to multiple cohort members. Several people in our group received the same templated message.",
    date: "3 Apr 2026",
  },
  {
    id: "3",
    reporter: "Meera Joshi",
    reportedUser: "Siddharth Kapoor",
    reason: "harassment",
    description:
      "Repeated unwanted messages after being asked to stop. The user has been making inappropriate comments on profile photos and sending follow-up messages despite being blocked once.",
    date: "2 Apr 2026",
  },
];

const reasonLabels: Record<string, { label: string; color: string }> = {
  fake_profile: {
    label: "Fake Profile",
    color: "bg-destructive/10 text-destructive",
  },
  spam: {
    label: "Spam",
    color: "bg-amber/10 text-amber",
  },
  harassment: {
    label: "Harassment",
    color: "bg-destructive/10 text-destructive",
  },
  inappropriate_photo: {
    label: "Inappropriate Photo",
    color: "bg-coral/10 text-coral",
  },
  other: {
    label: "Other",
    color: "bg-muted text-text-muted",
  },
};

const actionOptions = [
  { key: "warn", label: "Warn User", icon: AlertTriangle },
  { key: "suspend", label: "Suspend User", icon: ShieldAlert },
  { key: "ban", label: "Ban User", icon: UserX },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const dismissReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Report dismissed");
  };

  const takeAction = (reportId: string, actionKey: string) => {
    const actionLabel = actionOptions.find((a) => a.key === actionKey)?.label ?? actionKey;
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setActionMenuId(null);
    toast.success(`${actionLabel} action applied`);
  };

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Reports</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Moderation queue for user-submitted reports
        </p>
      </div>

      {/* Pending count */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10">
          <Flag className="h-4 w-4 text-amber" />
        </div>
        <p className="text-sm font-medium text-navy">
          {reports.length} pending report{reports.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Report Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {reports.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-white py-16 shadow-sm"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10">
                <Inbox className="h-7 w-7 text-emerald" />
              </div>
              <p className="text-base font-semibold text-navy">
                No pending reports
              </p>
              <p className="mt-1 text-sm text-text-muted">
                All reports have been addressed
              </p>
            </motion.div>
          ) : (
            reports.map((report) => {
              const reasonInfo =
                reasonLabels[report.reason] || reasonLabels.other;
              return (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Reporter / Reported */}
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium text-navy">
                          {report.reporter}
                        </span>
                        <span className="text-text-muted">reported</span>
                        <span className="font-medium text-navy">
                          {report.reportedUser}
                        </span>
                      </div>

                      {/* Reason badge */}
                      <div className="mt-2">
                        <Badge
                          className={`text-[10px] font-semibold ${reasonInfo.color}`}
                        >
                          {reasonInfo.label}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                        {report.description}
                      </p>

                      {/* Date */}
                      <p className="mt-2 text-xs text-text-muted">
                        {report.date}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 border-t border-border/30 pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg border-border/50 text-xs text-text-secondary"
                        onClick={() => dismissReport(report.id)}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Dismiss
                      </Button>

                      {actionMenuId === report.id ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {actionOptions.map((action) => (
                            <Button
                              key={action.key}
                              size="sm"
                              variant="outline"
                              className={`h-8 rounded-lg text-xs font-medium ${
                                action.key === "ban"
                                  ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                                  : action.key === "suspend"
                                    ? "border-amber/30 text-amber hover:bg-amber/10"
                                    : "border-navy/30 text-navy hover:bg-navy/10"
                              }`}
                              onClick={() =>
                                takeAction(report.id, action.key)
                              }
                            >
                              <action.icon className="mr-1 h-3.5 w-3.5" />
                              {action.label}
                            </Button>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg px-2 text-xs text-text-muted"
                            onClick={() => setActionMenuId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-8 rounded-lg bg-coral text-xs font-semibold text-white hover:bg-coral-hover"
                          onClick={() => setActionMenuId(report.id)}
                        >
                          <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
