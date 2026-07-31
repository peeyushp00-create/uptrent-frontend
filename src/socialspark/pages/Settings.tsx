import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Link2, 
  Palette,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "connections", label: "Connections", icon: Link2 },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-6 md:mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-56 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <tab.icon className={cn("h-4 w-4", activeTab === tab.id && "text-primary")} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 glass-card rounded-xl p-4 md:p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold">Profile Settings</h3>
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    QR
                  </div>
                  <Button variant="outline">Change Avatar</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue="Qasim Raza" />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input defaultValue="qasimraza" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue="qasim1212@gmail.com" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <select className="w-full rounded-lg bg-secondary/50 border border-border p-2.5 text-sm">
                      <option>Pakistan Standard Time (PKT)</option>
<option>Eastern Time (ET)</option>
<option>Pacific Time (PT)</option>
<option>UTC</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-lg bg-secondary/50 border border-border p-3 text-sm resize-none"
                    defaultValue="Content creator and digital marketer passionate about helping others grow their online presence."
                  />
                </div>

                <Button variant="gradient" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {[
                    { title: "Email Notifications", desc: "Receive email updates about your content" },
                    { title: "Push Notifications", desc: "Get notified on your device" },
                    { title: "Weekly Digest", desc: "Summary of your weekly performance" },
                    { title: "New Follower Alerts", desc: "When someone new follows you" },
                    { title: "Comment Notifications", desc: "When someone comments on your content" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={i < 3} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold">Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button variant="gradient">Update Password</Button>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold">Billing & Subscription</h3>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pro Plan</p>
                      <p className="text-2xl font-bold font-display mt-1">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    </div>
                    <Button variant="outline">Upgrade</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Payment Method</h4>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      <span>•••• •••• •••• 4242</span>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "connections" && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold">Connected Platforms</h3>
                
                <div className="space-y-3">
                  {[
                    { name: "YouTube", connected: true, account: "@alexcreates" },
                    { name: "Instagram", connected: true, account: "@alexjohnson" },
                    { name: "TikTok", connected: true, account: "@alexj" },
                    { name: "LinkedIn", connected: false, account: "" },
                  ].map((platform, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        {platform.connected && (
                          <p className="text-sm text-muted-foreground">{platform.account}</p>
                        )}
                      </div>
                      <Button variant={platform.connected ? "outline" : "gradient"} size="sm">
                        {platform.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

