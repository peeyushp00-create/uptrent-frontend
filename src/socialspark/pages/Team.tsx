import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Mail,
  MoreVertical,
  Shield,
  Edit2,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const teamMembers = [
  {
    name: "Qasim",
    email: "Qasim1212@gmail.com",
    role: "Owner",
    avatar: "QS",
    status: "active",
  },
  {
    name: "Nimra Ghaffar",
    email: "nimra098098@gmail.com",
    role: "Admin",
    avatar: "NA",
    status: "active",
  },
  {
    name: "Ahmad Zain",
    email: "zain1212@gmail.com",
    role: "Editor",
    avatar: "AZ",
    status: "active",
  },
  {
    name: "Ayesha",
    email: "ayesha@gmail.com",
    role: "Viewer",
    avatar: "AY",
    status: "pending",
  },
  {
    name: "Uraiza",
    email: "Uraiza@gmail.com",
    role: "Viewer",
    avatar: "UR",
    status: "pending",
  },
];

const roleColors = {
  Owner: "bg-amber-500/20 text-amber-400",
  Admin: "bg-cyan-500/20 text-cyan-400",
  Editor: "bg-emerald-500/20 text-emerald-400",
  Viewer: "bg-muted text-muted-foreground",
};

export default function Team() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
         <div>
            <h1 className="text-2xl md:text-3xl font-bold">Team</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team members and their permissions.
            </p>
          </div>
          <Button variant="gradient" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <span className="text-sm text-muted-foreground">
                {teamMembers.length} members
              </span>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition"
                >
                  {/* Left */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-semibold text-black shrink-0">
                      {member.avatar}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium leading-snug line-clamp-2">
                          {member.name}
                        </p>
                        {member.role === "Owner" && (
                          <Crown className="h-4 w-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full",
                        roleColors[member.role]
                      )}
                    >
                      {member.role}
                    </span>

                    {member.status === "pending" && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400">
                        Pending
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Invite */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Invite by Email</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="colleague@example.com"
                    className="pl-10"
                  />
                </div>
                <select className="w-full rounded-lg bg-secondary/50 border border-border p-2.5 text-sm">
                  <option>Editor</option>
                  <option>Viewer</option>
                  <option>Admin</option>
                </select>
                <Button variant="gradient" className="w-full">
                  Send Invitation
                </Button>
              </div>
            </div>

            {/* Roles */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Roles & Permissions
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <Shield className="h-4 w-4 text-amber-400 mt-1" />
                  <div>
                    <p className="font-medium">Owner</p>
                    <p className="text-muted-foreground">
                      Full access to all features
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Shield className="h-4 w-4 text-cyan-400 mt-1" />
                  <div>
                    <p className="font-medium">Admin</p>
                    <p className="text-muted-foreground">
                      Manage team and settings
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Edit2 className="h-4 w-4 text-emerald-400 mt-1" />
                  <div>
                    <p className="font-medium">Editor</p>
                    <p className="text-muted-foreground">
                      Create and edit content
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

