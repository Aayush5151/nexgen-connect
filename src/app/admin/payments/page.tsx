"use client";

import { useState, useMemo } from "react";
import {
  IndianRupee,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PaymentStatus = "success" | "pending" | "failed";

interface Payment {
  id: string;
  user: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  date: string;
}

const payments: Payment[] = [
  {
    id: "1",
    user: "Aarav Mehta",
    amount: 599,
    currency: "INR",
    method: "UPI",
    status: "success",
    date: "4 Apr 2026, 2:15 PM",
  },
  {
    id: "2",
    user: "Diya Iyer",
    amount: 599,
    currency: "INR",
    method: "Credit Card",
    status: "success",
    date: "4 Apr 2026, 11:32 AM",
  },
  {
    id: "3",
    user: "Kabir Singh",
    amount: 599,
    currency: "INR",
    method: "Debit Card",
    status: "failed",
    date: "3 Apr 2026, 9:47 PM",
  },
  {
    id: "4",
    user: "Meera Joshi",
    amount: 599,
    currency: "INR",
    method: "UPI",
    status: "success",
    date: "3 Apr 2026, 6:20 PM",
  },
  {
    id: "5",
    user: "Vikram Rao",
    amount: 599,
    currency: "INR",
    method: "Net Banking",
    status: "pending",
    date: "3 Apr 2026, 3:05 PM",
  },
  {
    id: "6",
    user: "Sneha Kulkarni",
    amount: 599,
    currency: "INR",
    method: "UPI",
    status: "success",
    date: "2 Apr 2026, 7:55 PM",
  },
  {
    id: "7",
    user: "Arjun Reddy",
    amount: 599,
    currency: "INR",
    method: "Credit Card",
    status: "success",
    date: "2 Apr 2026, 1:18 PM",
  },
  {
    id: "8",
    user: "Priya Nair",
    amount: 599,
    currency: "INR",
    method: "Debit Card",
    status: "failed",
    date: "1 Apr 2026, 10:42 AM",
  },
];

const statusStyles: Record<PaymentStatus, string> = {
  success: "bg-emerald/10 text-emerald",
  pending: "bg-amber/10 text-amber",
  failed: "bg-destructive/10 text-destructive",
};

const statusFilterOptions = ["All", "Success", "Pending", "Failed"];

function formatCurrency(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter payments based on status
  const filteredPayments = useMemo(() => {
    if (statusFilter === "All") return payments;
    return payments.filter(
      (p) => p.status === statusFilter.toLowerCase()
    );
  }, [statusFilter]);

  // Compute dynamic summary stats from filtered data
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const successCount = filteredPayments.filter(
      (p) => p.status === "success"
    ).length;
    const pendingCount = filteredPayments.filter(
      (p) => p.status === "pending"
    ).length;
    const failedCount = filteredPayments.filter(
      (p) => p.status === "failed"
    ).length;

    return [
      {
        label: "Total Revenue",
        value: formatCurrency(totalRevenue),
        icon: IndianRupee,
        iconBg: "bg-navy/10",
        iconColor: "text-navy",
      },
      {
        label: "Successful",
        value: successCount.toString(),
        icon: CheckCircle,
        iconBg: "bg-emerald/10",
        iconColor: "text-emerald",
      },
      {
        label: "Pending",
        value: pendingCount.toString(),
        icon: Clock,
        iconBg: "bg-amber/10",
        iconColor: "text-amber",
      },
      {
        label: "Failed",
        value: failedCount.toString(),
        icon: XCircle,
        iconBg: "bg-destructive/10",
        iconColor: "text-destructive",
      },
    ];
  }, [filteredPayments]);

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Payments</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Transaction history and revenue overview
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.iconBg}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
            <p className="mt-2 text-xl font-bold text-navy">{stat.value}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-xl border border-border/50 bg-white px-3 text-sm text-text-secondary outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        >
          {statusFilterOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="flex items-center text-xs text-text-muted">
          {filteredPayments.length} transaction{filteredPayments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Currency</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-text-muted"
                  >
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-navy">
                      {payment.user}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {payment.currency}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                      {payment.method}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        className={`text-[10px] font-semibold capitalize ${statusStyles[payment.status]}`}
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-text-muted">
                      {payment.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
