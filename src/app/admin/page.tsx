"use client";

import {
  Users,
  IndianRupee,
  FolderKanban,
  Flag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    label: "Total Users",
    value: "23,847",
    change: "+12.5%",
    trending: "up" as const,
    icon: Users,
    iconBg: "bg-navy/10",
    iconColor: "text-navy",
  },
  {
    label: "Revenue",
    value: "\u20B914.2L",
    change: "+8.2%",
    trending: "up" as const,
    icon: IndianRupee,
    iconBg: "bg-emerald/10",
    iconColor: "text-emerald",
  },
  {
    label: "Active Cohorts",
    value: "156",
    change: "+3.1%",
    trending: "up" as const,
    icon: FolderKanban,
    iconBg: "bg-coral/10",
    iconColor: "text-coral",
  },
  {
    label: "Pending Reports",
    value: "12",
    change: "-24%",
    trending: "down" as const,
    icon: Flag,
    iconBg: "bg-amber/10",
    iconColor: "text-amber",
  },
];

const recentSignups = [
  {
    name: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    city: "Mumbai",
    destination: "Germany",
    date: "4 Apr 2026",
    status: "Verified",
  },
  {
    name: "Rohan Patel",
    email: "rohan.patel@outlook.com",
    city: "Ahmedabad",
    destination: "Canada",
    date: "3 Apr 2026",
    status: "Pending",
  },
  {
    name: "Priya Nair",
    email: "priya.nair@yahoo.com",
    city: "Kochi",
    destination: "Australia",
    date: "3 Apr 2026",
    status: "Verified",
  },
  {
    name: "Arjun Reddy",
    email: "arjun.reddy@gmail.com",
    city: "Hyderabad",
    destination: "UK",
    date: "2 Apr 2026",
    status: "Unverified",
  },
  {
    name: "Sneha Kulkarni",
    email: "sneha.k@gmail.com",
    city: "Pune",
    destination: "Germany",
    date: "2 Apr 2026",
    status: "Verified",
  },
];

// Mock revenue data for the week (in thousands INR)
const revenueData = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 35 },
  { day: "Thu", value: 72 },
  { day: "Fri", value: 65 },
  { day: "Sat", value: 28 },
  { day: "Sun", value: 18 },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.value));

export default function AdminDashboardPage() {
  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Overview of NexGen Connect platform
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <Badge
                className={`text-[10px] font-semibold ${
                  stat.trending === "up"
                    ? "bg-emerald/10 text-emerald"
                    : "bg-amber/10 text-amber"
                }`}
              >
                {stat.trending === "up" ? (
                  <TrendingUp className="mr-0.5 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-0.5 h-3 w-3" />
                )}
                {stat.change}
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold text-navy">{stat.value}</p>
            <p className="mt-0.5 text-sm text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Signups */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/50 bg-white shadow-sm">
            <div className="border-b border-border/50 px-5 py-4">
              <h2 className="text-base font-semibold text-navy">
                Recent Signups
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">City</th>
                    <th className="px-5 py-3">Destination</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignups.map((user) => (
                    <tr
                      key={user.email}
                      className="border-b border-border/30 transition-colors hover:bg-muted/30 last:border-0"
                    >
                      <td className="px-5 py-3 font-medium text-navy">
                        {user.name}
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        {user.email}
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        {user.city}
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        {user.destination}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-text-muted">
                        {user.date}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={`text-[10px] font-semibold ${
                            user.status === "Verified"
                              ? "bg-emerald/10 text-emerald"
                              : user.status === "Pending"
                                ? "bg-amber/10 text-amber"
                                : "bg-muted text-text-muted"
                          }`}
                        >
                          {user.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Revenue This Week - CSS Bar Chart */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border/50 bg-white shadow-sm">
            <div className="border-b border-border/50 px-5 py-4">
              <h2 className="text-base font-semibold text-navy">
                Revenue This Week
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Daily revenue in thousands (INR)
              </p>
            </div>
            <div className="px-5 py-6">
              <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
                {revenueData.map((item) => {
                  const heightPercent = (item.value / maxRevenue) * 100;
                  return (
                    <div
                      key={item.day}
                      className="group flex flex-1 flex-col items-center gap-1.5"
                    >
                      {/* Tooltip on hover */}
                      <span className="text-[10px] font-semibold text-navy opacity-0 transition-opacity group-hover:opacity-100">
                        {"\u20B9"}{item.value}K
                      </span>
                      {/* Bar */}
                      <div
                        className="w-full rounded-t-md bg-coral/80 transition-all duration-200 group-hover:bg-coral"
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: 8,
                        }}
                      />
                      {/* Day label */}
                      <span className="text-[10px] font-medium text-text-muted">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Total */}
              <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3">
                <span className="text-xs text-text-muted">Weekly Total</span>
                <span className="text-sm font-bold text-navy">
                  {"\u20B9"}{revenueData.reduce((sum, d) => sum + d.value, 0)}K
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
