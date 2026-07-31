import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  EyeOff,
  MessageSquare,
  FileText,
  Search,
  Shield,
  Lock,
  Key,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tabs = [
  { id: "dashboard", label: "Security Dashboard", icon: BarChart3 },
  { id: "hide-messages", label: "Hide Messages", icon: EyeOff },
  { id: "extract-messages", label: "Extract Messages", icon: FileText },
  { id: "encryption", label: "Encryption", icon: Lock },
];

export default function Security() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [messageToHide, setMessageToHide] = useState("");
  const [hiddenMessage, setHiddenMessage] = useState("");
  const [messageToExtract, setMessageToExtract] = useState("");
  const [extractedMessage, setExtractedMessage] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");

  // Mock data for security dashboard charts
  const securityIncidentsData = [
    { date: "Dec 20", incidents: 2, threats: 5 },
    { date: "Dec 21", incidents: 1, threats: 3 },
    { date: "Dec 22", incidents: 4, threats: 8 },
    { date: "Dec 23", incidents: 0, threats: 2 },
    { date: "Dec 24", incidents: 3, threats: 6 },
    { date: "Dec 25", incidents: 1, threats: 4 },
    { date: "Dec 26", incidents: 2, threats: 5 },
  ];

  const threatTypesData = [
    { name: "Malware", value: 35, color: "#ef4444" },
    { name: "Phishing", value: 25, color: "#f97316" },
    { name: "Unauthorized Access", value: 20, color: "#eab308" },
    { name: "Data Breach", value: 15, color: "#22c55e" },
    { name: "Other", value: 5, color: "#8b5cf6" },
  ];

  const accessLogsData = [
    { time: "09:00", successful: 45, failed: 2 },
    { time: "12:00", successful: 67, failed: 1 },
    { time: "15:00", successful: 52, failed: 3 },
    { time: "18:00", successful: 78, failed: 0 },
    { time: "21:00", successful: 34, failed: 1 },
  ];

  const handleHideMessage = () => {
    // Simple steganography simulation - in real app this would be proper encryption
    const encoded = btoa(messageToHide);
    setHiddenMessage(`Hidden: ${encoded}`);
  };

  const handleExtractMessage = () => {
    // Simple extraction simulation
    if (messageToExtract.startsWith("Hidden: ")) {
      const decoded = atob(messageToExtract.replace("Hidden: ", ""));
      setExtractedMessage(decoded);
    } else {
      setExtractedMessage("No hidden message found");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-6 md:mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold">Security</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage your security features and protect your content.
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
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold">Security Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor your security status, incidents, and threats in real-time.
                </p>

                {/* Security Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: "Active Threats", value: "3", change: "+1", icon: Shield, positive: false, desc: "Malware, phishing, unauthorized access" },
                    { label: "Security Incidents", value: "12", change: "-2", icon: TrendingUp, positive: true, desc: "Blocked attacks this week" },
                    { label: "Encrypted Files", value: "847", change: "+23", icon: Lock, positive: true, desc: "Protected content" },
                    { label: "Access Attempts", value: "2.4K", change: "+156", icon: Key, positive: true, desc: "Successful logins" },
                  ].map((stat, i) => (
                    <div key={i} className="glass-card rounded-xl p-3 md:p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-1 md:mb-2">
                        <span className="text-xs md:text-sm text-muted-foreground">{stat.label}</span>
                        <stat.icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xl md:text-2xl font-bold font-display">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mb-1">{stat.desc}</p>
                      <p className={`text-xs md:text-sm flex items-center gap-1 ${stat.positive ? 'text-emerald-400' : 'text-destructive'}`}>
                        {stat.positive ? <TrendingUp className="h-2 w-2 md:h-3 md:w-3" /> : <TrendingUp className="h-2 w-2 md:h-3 md:w-3 rotate-180" />}
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Security Recommendations */}
                <div className="glass-card rounded-xl p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                  <h4 className="font-display text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-white/60 border border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-2xl mb-2">🔐</div>
                      <h5 className="font-medium text-sm text-blue-800 mb-2">Enable 2FA</h5>
                      <p className="text-xs text-blue-700 mb-2">Add an extra layer of protection to your account</p>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-yellow-700">Recommended</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/60 border border-green-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-2xl mb-2">🔄</div>
                      <h5 className="font-medium text-sm text-green-800 mb-2">Update Password</h5>
                      <p className="text-xs text-green-700 mb-2">Change password every 90 days</p>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-700">Completed</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/60 border border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-2xl mb-2">�️</div>
                      <h5 className="font-medium text-sm text-purple-800 mb-2">Run Security Scan</h5>
                      <p className="text-xs text-purple-700 mb-2">Scan for vulnerabilities in your content</p>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Scan Now
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-white/60 border border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-2xl mb-2">�</div>
                      <h5 className="font-medium text-sm text-orange-800 mb-2">Backup Data</h5>
                      <p className="text-xs text-orange-700 mb-2">Regular encrypted backups</p>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs text-orange-700">Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Score */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-300">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-green-800">Security Health Score</h5>
                      <span className="text-2xl font-bold text-green-700">87%</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                    <p className="text-xs text-green-700 mt-2">Excellent security posture! Keep up the good work.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Security Incidents Chart */}
                  <div className="glass-card rounded-xl p-4 md:p-6">
                    <h4 className="font-display text-lg font-semibold mb-4">Security Incidents & Threats</h4>
                    <div className="h-[250px] md:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={securityIncidentsData}>
                          <defs>
                            <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="incidents"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorIncidents)"
                            name="Incidents"
                          />
                          <Area
                            type="monotone"
                            dataKey="threats"
                            stroke="#f97316"
                            fillOpacity={1}
                            fill="url(#colorThreats)"
                            name="Threats"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Threat Types Pie Chart */}
                  <div className="glass-card rounded-xl p-4 md:p-6">
                    <h4 className="font-display text-lg font-semibold mb-4">Threat Distribution</h4>
                    <div className="h-[250px] md:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={threatTypesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {threatTypesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {threatTypesData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Access Logs Chart */}
                <div className="glass-card rounded-xl p-4 md:p-6">
                  <h4 className="font-display text-lg font-semibold mb-4">Access Patterns (Last 24 Hours)</h4>
                  <div className="h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accessLogsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="successful" fill="#22c55e" name="Successful" />
                        <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Security Events */}
                <div className="glass-card rounded-xl p-4 md:p-6">
                  <h4 className="font-display text-lg font-semibold mb-4">Recent Security Events</h4>
                  <div className="space-y-3">
                    {[
                      { time: "2 hours ago", event: "Suspicious login attempt blocked", type: "warning", ip: "192.168.1.100" },
                      { time: "4 hours ago", event: "File encryption completed", type: "success", ip: "N/A" },
                      { time: "6 hours ago", event: "Security scan completed - No threats found", type: "success", ip: "N/A" },
                      { time: "8 hours ago", event: "Failed login attempt from unknown IP", type: "error", ip: "203.0.113.45" },
                      { time: "12 hours ago", event: "New encryption key generated", type: "info", ip: "N/A" },
                    ].map((event, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            event.type === 'success' ? 'bg-green-500' :
                            event.type === 'warning' ? 'bg-yellow-500' :
                            event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{event.event}</p>
                            <p className="text-xs text-muted-foreground">{event.time} • IP: {event.ip}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          event.type === 'success' ? 'bg-green-100 text-green-800' :
                          event.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          event.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hide-messages" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold">Hide Messages</h3>
                    <p className="text-muted-foreground text-sm">
                      Conceal sensitive information within your content using steganography.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700">System Ready</span>
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold font-display text-primary mb-1">
                      {messageToHide.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Characters to Hide</p>
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((messageToHide.length / 500) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold font-display text-blue-600 mb-1">
                      {hiddenMessage ? '1' : '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Messages Hidden</p>
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${hiddenMessage ? 'bg-blue-600 w-full' : 'bg-secondary w-0'}`}
                      ></div>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold font-display text-green-600 mb-1">
                      100%
                    </div>
                    <p className="text-xs text-muted-foreground">Security Level</p>
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                      <div className="bg-green-600 h-1.5 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Message to Hide
                      </Label>
                      <Textarea
                        placeholder="Enter the sensitive information you want to conceal..."
                        value={messageToHide}
                        onChange={(e) => setMessageToHide(e.target.value)}
                        className="min-h-[120px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {messageToHide.length}/500 characters
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleHideMessage}
                        variant="gradient"
                        className="gap-2 flex-1"
                        disabled={!messageToHide.trim()}
                      >
                        <EyeOff className="h-4 w-4" />
                        Hide Message
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessageToHide("My API key is sk-1234567890abcdef")}
                        className="sm:w-auto"
                      >
                        Load Example
                      </Button>
                    </div>
                  </div>

                  {/* Output Section */}
                  <div className="space-y-4">
                    {hiddenMessage ? (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-green-700">
                          <Lock className="h-4 w-4" />
                          Hidden Message Generated
                        </Label>
                        <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200 font-mono text-sm">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
                              Encrypted Content
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => navigator.clipboard.writeText(hiddenMessage)}
                            >
                              📋
                            </Button>
                          </div>
                          {hiddenMessage}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Ready to embed in your content
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-8 rounded-lg bg-secondary/20 border-2 border-dashed border-secondary">
                        <div className="text-center">
                          <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Hidden message will appear here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Use Cases */}
                <div className="border-t border-border pt-6">
                  <h4 className="font-medium mb-4">Steganography Applications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                      <div className="text-2xl mb-2">🔑</div>
                      <h5 className="font-medium text-sm text-blue-800 mb-1">API Keys</h5>
                      <p className="text-xs text-blue-600">Hide credentials in public content</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                      <div className="text-2xl mb-2">🔒</div>
                      <h5 className="font-medium text-sm text-purple-800 mb-1">Passwords</h5>
                      <p className="text-xs text-purple-600">Secure shared documents</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <div className="text-2xl mb-2">📝</div>
                      <h5 className="font-medium text-sm text-green-800 mb-1">Private Notes</h5>
                      <p className="text-xs text-green-600">Conceal personal information</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                      <div className="text-2xl mb-2">©️</div>
                      <h5 className="font-medium text-sm text-orange-800 mb-1">Watermarking</h5>
                      <p className="text-xs text-orange-600">Embed copyright data</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "extract-messages" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold">Extract Messages</h3>
                    <p className="text-muted-foreground text-sm">
                      Extract hidden messages from content using steganography decoding.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-700">Scanner Active</span>
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold font-display text-primary mb-1">
                      {messageToExtract.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Characters Scanned</p>
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((messageToExtract.length / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold font-display text-blue-600 mb-1">
                      {extractedMessage && extractedMessage !== "No hidden message found" ? '1' : '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Messages Found</p>
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          extractedMessage && extractedMessage !== "No hidden message found"
                            ? 'bg-blue-600 w-full'
                            : 'bg-secondary w-0'
                        }`}
                      ></div>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold font-display text-green-600 mb-1">
                      {extractedMessage === "No hidden message found" ? '0%' : '100%'}
                    </div>
                    <p className="text-xs text-muted-foreground">Detection Rate</p>
                    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${
                        extractedMessage && extractedMessage !== "No hidden message found"
                          ? 'bg-green-600 w-full'
                          : 'bg-red-600 w-0'
                      }`}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Content to Analyze
                      </Label>
                      <Textarea
                        placeholder="Paste content containing hidden message..."
                        value={messageToExtract}
                        onChange={(e) => setMessageToExtract(e.target.value)}
                        className="min-h-[120px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {messageToExtract.length}/1000 characters
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleExtractMessage}
                        variant="gradient"
                        className="gap-2 flex-1"
                        disabled={!messageToExtract.trim()}
                      >
                        <Search className="h-4 w-4" />
                        Scan & Extract
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessageToExtract("Hidden: TXkgQVBJIGtleSBpcyBzay0xMjM0NTY3ODkwYWJjZGVm")}
                        className="sm:w-auto"
                      >
                        Load Example
                      </Button>
                    </div>
                  </div>

                  {/* Output Section */}
                  <div className="space-y-4">
                    {extractedMessage ? (
                      <div className="space-y-2">
                        <Label className={`flex items-center gap-2 ${
                          extractedMessage === "No hidden message found"
                            ? 'text-red-700'
                            : 'text-green-700'
                        }`}>
                          {extractedMessage === "No hidden message found" ? (
                            <Search className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          {extractedMessage === "No hidden message found"
                            ? 'Scan Results'
                            : 'Hidden Message Detected'
                          }
                        </Label>
                        <div className={`p-4 rounded-lg font-mono text-sm border ${
                          extractedMessage === "No hidden message found"
                            ? 'bg-red-50 border-red-200'
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <span className={`text-xs font-medium uppercase tracking-wide ${
                              extractedMessage === "No hidden message found"
                                ? 'text-red-700'
                                : 'text-green-700'
                            }`}>
                              {extractedMessage === "No hidden message found"
                                ? 'No Hidden Content Found'
                                : 'Decrypted Message'
                              }
                            </span>
                            {extractedMessage !== "No hidden message found" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => navigator.clipboard.writeText(extractedMessage)}
                              >
                                📋
                              </Button>
                            )}
                          </div>
                          {extractedMessage}
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${
                          extractedMessage === "No hidden message found"
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            extractedMessage === "No hidden message found"
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}></div>
                          {extractedMessage === "No hidden message found"
                            ? 'No steganographic content detected'
                            : 'Message successfully decrypted and extracted'
                          }
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-8 rounded-lg bg-secondary/20 border-2 border-dashed border-secondary">
                        <div className="text-center">
                          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Extracted message will appear here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Scenarios */}
                <div className="border-t border-border pt-6">
                  <h4 className="font-medium mb-4">Steganography Detection Scenarios</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                      <div className="text-2xl mb-2">📄</div>
                      <h5 className="font-medium text-sm text-blue-800 mb-1">Documents</h5>
                      <p className="text-xs text-blue-600">Scan shared files for hidden data</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                      <div className="text-2xl mb-2">🖼️</div>
                      <h5 className="font-medium text-sm text-purple-800 mb-1">Images</h5>
                      <p className="text-xs text-purple-600">Extract metadata and hidden content</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <div className="text-2xl mb-2">💻</div>
                      <h5 className="font-medium text-sm text-green-800 mb-1">Code Files</h5>
                      <p className="text-xs text-green-600">Find concealed API keys in comments</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                      <div className="text-2xl mb-2">📱</div>
                      <h5 className="font-medium text-sm text-orange-800 mb-1">Social Posts</h5>
                      <p className="text-xs text-orange-600">Detect private messages in public content</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "encryption" && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold">Encryption Settings</h3>
                <p className="text-muted-foreground text-sm">
                  Configure encryption settings for your data. Protect sensitive files and communications with advanced encryption.
                </p>

                {/* Security Status */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Security Status: Protected</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your data is currently encrypted with AES-256 encryption. Last security scan: 2 hours ago.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Master Encryption Key</Label>
                    <Input
                      type="password"
                      placeholder="Enter your master encryption key..."
                      value={encryptionKey}
                      onChange={(e) => setEncryptionKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This key is used to encrypt/decrypt all your sensitive data. Keep it secure!
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Auto-Encrypt Files</p>
                      <p className="text-sm text-muted-foreground">Automatically encrypt uploaded files</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">End-to-End Encryption</p>
                      <p className="text-sm text-muted-foreground">Enable end-to-end encryption for messages</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">Two-Factor Encryption</p>
                      <p className="text-sm text-muted-foreground">Require additional authentication for decryption</p>
                    </div>
                    <Switch />
                  </div>

                  <Button variant="gradient" className="gap-2">
                    <Key className="h-4 w-4" />
                    Save Encryption Settings
                  </Button>
                </div>

                {/* Mock Data Examples */}
                <div className="border-t border-border pt-6">
                  <h4 className="font-medium mb-3">Encryption Features</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/20 text-sm">
                      <strong>AES-256 Encryption:</strong> Military-grade encryption for your files
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20 text-sm">
                      <strong>Zero-Knowledge:</strong> We cannot access your encrypted data
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20 text-sm">
                      <strong>Cloud Sync:</strong> Encrypted files sync securely across devices
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20 text-sm">
                      <strong>Auto-Lock:</strong> Files automatically lock after inactivity
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

