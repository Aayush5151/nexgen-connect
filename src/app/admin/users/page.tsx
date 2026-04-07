"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type UserStatus = "verified" | "unverified" | "banned";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  destination: string;
  verified: boolean;
  paid: boolean;
  status: UserStatus;
}

const initialUsers: UserData[] = [
  {
    id: "1",
    name: "Aarav Mehta",
    email: "aarav.mehta@gmail.com",
    phone: "+91 98765 43210",
    city: "Mumbai",
    destination: "Germany",
    verified: true,
    paid: true,
    status: "verified",
  },
  {
    id: "2",
    name: "Diya Iyer",
    email: "diya.iyer@outlook.com",
    phone: "+91 87654 32109",
    city: "Chennai",
    destination: "Canada",
    verified: true,
    paid: false,
    status: "verified",
  },
  {
    id: "3",
    name: "Kabir Singh",
    email: "kabir.singh@yahoo.com",
    phone: "+91 76543 21098",
    city: "Delhi",
    destination: "UK",
    verified: false,
    paid: false,
    status: "unverified",
  },
  {
    id: "4",
    name: "Meera Joshi",
    email: "meera.joshi@gmail.com",
    phone: "+91 65432 10987",
    city: "Pune",
    destination: "Australia",
    verified: true,
    paid: true,
    status: "verified",
  },
  {
    id: "5",
    name: "Vikram Rao",
    email: "vikram.rao@gmail.com",
    phone: "+91 54321 09876",
    city: "Bangalore",
    destination: "Germany",
    verified: true,
    paid: true,
    status: "verified",
  },
  {
    id: "6",
    name: "Sneha Kulkarni",
    email: "sneha.k@gmail.com",
    phone: "+91 43210 98765",
    city: "Pune",
    destination: "Germany",
    verified: true,
    paid: true,
    status: "verified",
  },
  {
    id: "7",
    name: "Arjun Reddy",
    email: "arjun.reddy@gmail.com",
    phone: "+91 32109 87654",
    city: "Hyderabad",
    destination: "UK",
    verified: false,
    paid: false,
    status: "unverified",
  },
  {
    id: "8",
    name: "Priya Nair",
    email: "priya.nair@yahoo.com",
    phone: "+91 21098 76543",
    city: "Kochi",
    destination: "Australia",
    verified: true,
    paid: false,
    status: "verified",
  },
  {
    id: "9",
    name: "Rohan Patel",
    email: "rohan.patel@outlook.com",
    phone: "+91 10987 65432",
    city: "Ahmedabad",
    destination: "Canada",
    verified: true,
    paid: true,
    status: "verified",
  },
];

const statusOptions = ["All", "Verified", "Unverified", "Banned"];
const ITEMS_PER_PAGE = 3;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);
  const [banConfirmId, setBanConfirmId] = useState<string | null>(null);

  // Filter users
  const filteredUsers = useMemo(() => {
    let result = users;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      const filterVal = statusFilter.toLowerCase() as UserStatus;
      result = result.filter((u) => u.status === filterVal);
    }

    return result;
  }, [users, search, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: "banned" as UserStatus, verified: false }
          : u
      )
    );
    setBanConfirmId(null);
    toast.success("User has been banned");
  };

  const getStatusBadge = (user: UserData) => {
    if (user.status === "banned") {
      return (
        <Badge className="bg-destructive/10 text-[10px] font-semibold text-destructive">
          Banned
        </Badge>
      );
    }
    return (
      <Badge
        className={`text-[10px] font-semibold ${
          user.verified
            ? "bg-emerald/10 text-emerald"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        {user.verified ? "Verified" : "Unverified"}
      </Badge>
    );
  };

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Users</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage platform users and verification status
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 rounded-xl border-border/50 bg-white pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="h-9 rounded-xl border border-border/50 bg-white px-3 text-sm text-text-secondary outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Route</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Paid</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-text-muted"
                  >
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-navy">
                      {user.name}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                      {user.phone}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                      {user.city} &rarr; {user.destination}
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(user)}</td>
                    <td className="px-5 py-3">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          user.paid
                            ? "bg-emerald/10 text-emerald"
                            : "bg-muted text-text-muted"
                        }`}
                      >
                        {user.paid ? "Paid" : "Free"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="h-7 rounded-lg px-2 text-xs text-navy hover:text-coral"
                          onClick={() => setViewingUser(user)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View
                        </Button>
                        {banConfirmId === user.id ? (
                          <div className="flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-2 py-1">
                            <span className="text-[11px] font-medium text-destructive">
                              Ban?
                            </span>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-5 px-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
                              onClick={() => handleBan(user.id)}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-5 px-1.5 text-[11px] text-text-muted hover:bg-muted"
                              onClick={() => setBanConfirmId(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="xs"
                            className="h-7 rounded-lg px-2 text-xs text-text-muted hover:text-destructive"
                            disabled={user.status === "banned"}
                            onClick={() => setBanConfirmId(user.id)}
                          >
                            <Ban className="mr-1 h-3.5 w-3.5" />
                            {user.status === "banned" ? "Banned" : "Ban"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Showing{" "}
          {filteredUsers.length === 0
            ? "0"
            : `${(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                safeCurrentPage * ITEMS_PER_PAGE,
                filteredUsers.length
              )}`}{" "}
          of {filteredUsers.length} users
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-border/50"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-text-secondary">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-border/50"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View User Dialog */}
      <Dialog
        open={viewingUser !== null}
        onOpenChange={(open) => {
          if (!open) setViewingUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Full profile information
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-text-muted">Name</span>
                <span className="text-navy">{viewingUser.name}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-text-muted">Email</span>
                <span className="text-navy">{viewingUser.email}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-text-muted">Phone</span>
                <span className="text-navy">{viewingUser.phone}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-text-muted">City</span>
                <span className="text-navy">{viewingUser.city}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-text-muted">Destination</span>
                <span className="text-navy">{viewingUser.destination}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-text-muted">Status</span>
                {getStatusBadge(viewingUser)}
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-text-muted">Payment</span>
                <Badge
                  className={`w-fit text-[10px] font-semibold ${
                    viewingUser.paid
                      ? "bg-emerald/10 text-emerald"
                      : "bg-muted text-text-muted"
                  }`}
                >
                  {viewingUser.paid ? "Paid" : "Free"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
