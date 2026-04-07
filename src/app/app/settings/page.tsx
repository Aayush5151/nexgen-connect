"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  Eye,
  EyeOff,
  Shield,
  LogOut,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
      {children}
    </h2>
  );
}

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
        enabled ? "bg-coral" : "bg-muted"
      }`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [profileVisible, setProfileVisible] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastActive, setShowLastActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function handleToggleProfileVisible() {
    const next = !profileVisible;
    setProfileVisible(next);
    toast.success(
      next ? "Profile is now visible" : "Profile is now hidden"
    );
  }

  function handleToggleOnlineStatus() {
    const next = !showOnlineStatus;
    setShowOnlineStatus(next);
    toast.success(
      next ? "Online status visible to others" : "Online status hidden"
    );
  }

  function handleToggleLastActive() {
    const next = !showLastActive;
    setShowLastActive(next);
    toast.success(
      next ? "Last active time is now visible" : "Last active time hidden"
    );
  }

  function handleDeleteAccount() {
    toast.success("Account deletion initiated. Check your email for confirmation.");
    setDeleteDialogOpen(false);
    setDeleteText("");
  }

  function handleLogout() {
    setIsLoggingOut(true);
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your account preferences
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-8">
        {/* Account Section */}
        <div>
          <SectionTitle>Account</SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-white">
            {/* Email */}
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-5 w-5 text-text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">Email</p>
                  <p className="text-xs text-text-muted">
                    aayush@example.com
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-8 rounded-lg px-3 text-xs font-medium text-coral"
              >
                Change
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Phone className="h-5 w-5 text-text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">Phone</p>
                  <p className="text-xs text-text-muted">+91 98765 43210</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-8 rounded-lg px-3 text-xs font-medium text-coral"
              >
                Change
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div>
          <SectionTitle>Privacy</SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-white">
            {/* Profile Visibility */}
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {profileVisible ? (
                    <Eye className="h-5 w-5 text-text-secondary" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-text-secondary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">
                    Profile Visible
                  </p>
                  <p className="text-xs text-text-muted">
                    Others can see your profile in Discover
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={profileVisible}
                onToggle={handleToggleProfileVisible}
              />
            </div>

            {/* Online Status */}
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Shield className="h-5 w-5 text-text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">
                    Show Online Status
                  </p>
                  <p className="text-xs text-text-muted">
                    Let others see when you&apos;re active
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={showOnlineStatus}
                onToggle={handleToggleOnlineStatus}
              />
            </div>

            {/* Last Active */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Eye className="h-5 w-5 text-text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">
                    Show Last Active
                  </p>
                  <p className="text-xs text-text-muted">
                    Display when you were last online
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={showLastActive}
                onToggle={handleToggleLastActive}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <SectionTitle>Danger Zone</SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-destructive/20 bg-white">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy">
                    Delete Account
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Permanently delete your account and all associated data. This
                    action cannot be undone.
                  </p>

                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="mt-3 h-8 rounded-lg text-xs"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setDeleteText("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This will permanently delete your profile, matches, and all data.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <p className="text-sm text-text-secondary">
                Type <strong className="text-navy">DELETE</strong> below to confirm:
              </p>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-destructive focus:ring-1 focus:ring-destructive"
                autoComplete="off"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeleteText("");
                }}
                className="h-9 rounded-lg text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteText !== "DELETE"}
                onClick={handleDeleteAccount}
                className="h-9 rounded-lg text-sm"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Permanently Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-11 w-full rounded-xl border-border text-sm font-semibold text-navy hover:bg-muted disabled:opacity-70"
        >
          {isLoggingOut ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging out...
            </span>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </>
          )}
        </Button>

        {/* Footer info */}
        <p className="text-center text-[10px] text-text-muted">
          NexGen Connect v1.0.0
        </p>
      </div>
    </div>
  );
}
