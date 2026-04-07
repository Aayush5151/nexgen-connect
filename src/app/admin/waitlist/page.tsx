"use client";

import { Download, Clock, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const waitlistStats = [
  {
    label: "Total Entries",
    value: "4,218",
    icon: Clock,
    iconBg: "bg-navy/10",
    iconColor: "text-navy",
  },
  {
    label: "This Week",
    value: "142",
    icon: TrendingUp,
    iconBg: "bg-emerald/10",
    iconColor: "text-emerald",
  },
  {
    label: "Top Destination",
    value: "Germany",
    icon: Globe,
    iconBg: "bg-coral/10",
    iconColor: "text-coral",
  },
];

const waitlistEntries = [
  {
    id: "1",
    email: "riya.desai@gmail.com",
    phone: "+91 98112 34567",
    city: "Mumbai",
    destination: "Germany",
    intake: "Winter 2027",
    date: "4 Apr 2026",
  },
  {
    id: "2",
    email: "aditya.kumar@outlook.com",
    phone: "+91 87234 56789",
    city: "Delhi",
    destination: "Canada",
    intake: "Fall 2026",
    date: "3 Apr 2026",
  },
  {
    id: "3",
    email: "ishita.banerjee@yahoo.com",
    phone: "+91 76345 67890",
    city: "Kolkata",
    destination: "UK",
    intake: "Spring 2027",
    date: "3 Apr 2026",
  },
  {
    id: "4",
    email: "harsh.patel@gmail.com",
    phone: "+91 65456 78901",
    city: "Ahmedabad",
    destination: "Australia",
    intake: "Winter 2027",
    date: "2 Apr 2026",
  },
  {
    id: "5",
    email: "nandini.rao@gmail.com",
    phone: "+91 54567 89012",
    city: "Bangalore",
    destination: "Germany",
    intake: "Fall 2027",
    date: "1 Apr 2026",
  },
  {
    id: "6",
    email: "tanmay.shah@outlook.com",
    phone: "+91 43678 90123",
    city: "Pune",
    destination: "Singapore",
    intake: "Spring 2027",
    date: "31 Mar 2026",
  },
];

export default function WaitlistPage() {
  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Waitlist</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Pre-launch interest and signups
          </p>
        </div>
        <Button className="h-9 rounded-xl bg-coral text-sm font-semibold text-white shadow-sm hover:bg-coral-hover">
          <Download className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {waitlistStats.map((stat) => (
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

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Intake</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {waitlistEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-border/30 last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-navy">
                    {entry.email}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                    {entry.phone}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {entry.city}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className="bg-navy/10 text-[10px] font-semibold text-navy">
                      {entry.destination}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                    {entry.intake}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-text-muted">
                    {entry.date}
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
