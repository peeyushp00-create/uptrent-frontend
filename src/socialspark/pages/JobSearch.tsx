import { useState } from "react";
import { DashboardLayout } from "@/socialspark/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Briefcase,
  MapPin,
  Upload,
  Linkedin,
  Search,
  Building,
  DollarSign,
  Clock,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  posted: string;
  logo?: string;
}

// Mock job data
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$120k - $160k",
    type: "Full-time",
    description: "We are looking for a skilled Frontend Developer with React expertise to join our dynamic team.",
    posted: "2 days ago"
  },
  {
    id: "2",
    title: "React Developer",
    company: "StartupXYZ",
    location: "Remote",
    salary: "$80k - $110k",
    type: "Full-time",
    description: "Join our fast-growing startup as a React Developer. Work on exciting projects with modern technologies.",
    posted: "1 week ago"
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "InnovateLabs",
    location: "New York, NY",
    salary: "$100k - $140k",
    type: "Full-time",
    description: "Looking for a versatile Full Stack Developer to build scalable web applications.",
    posted: "3 days ago"
  },
  {
    id: "4",
    title: "UI/UX Developer",
    company: "DesignStudio",
    location: "Los Angeles, CA",
    salary: "$90k - $130k",
    type: "Contract",
    description: "Create beautiful and functional user interfaces. Experience with design systems preferred.",
    posted: "5 days ago"
  }
];

export default function JobSearch() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);

  const handleSearch = () => {
    const filtered = mockJobs.filter(job =>
      job.title.toLowerCase().includes(jobTitle.toLowerCase()) &&
      job.location.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredJobs(filtered);
    toast.success(`Found ${filtered.length} jobs matching your criteria`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
      toast.success(`CV uploaded: ${file.name}`);
    }
  };

  const handleLinkedInConnect = () => {
    setIsLinkedInConnected(!isLinkedInConnected);
    toast.success(isLinkedInConnected ? "Disconnected from LinkedIn" : "Connected to LinkedIn");
  };

  const formatSalary = (salary: string) => {
    return salary.replace(/\$/g, "").split(" - ").map(part => `$${part}`).join(" - ");
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pt-16 md:pt-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Job Search</h1>
          <p className="text-muted-foreground">
            Find your next opportunity and manage your job applications
          </p>
        </div>

        {/* Profile Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Profile Setup
            </CardTitle>
            <CardDescription>
              Connect your LinkedIn and upload your CV to get personalized job recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* LinkedIn Connection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isLinkedInConnected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Linkedin className={`h-5 w-5 ${
                    isLinkedInConnected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium">LinkedIn Profile</p>
                  <p className="text-sm text-muted-foreground">
                    {isLinkedInConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLinkedInConnect}
                variant={isLinkedInConnected ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4" />
                {isLinkedInConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>

            {/* CV Upload */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  cvFile ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-5 w-5 ${
                    cvFile ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium">Resume/CV</p>
                  <p className="text-sm text-muted-foreground">
                    {cvFile ? cvFile.name : "No file uploaded"}
                  </p>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cv-upload"
                />
                <Label htmlFor="cv-upload">
                  <Button variant="outline" className="flex items-center gap-2" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                      Upload CV
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Jobs
            </CardTitle>
            <CardDescription>
              Search for jobs by title and location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  placeholder="e.g. Frontend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search Jobs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Job Opportunities</h2>
            <Badge variant="secondary">{filteredJobs.length} jobs found</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job.salary)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.posted}
                    </div>
                  </div>

                  <Badge variant="outline">{job.type}</Badge>

                  <p className="text-sm text-muted-foreground">
                    {job.description}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      Apply Now
                    </Button>
                    <Button size="sm" variant="outline">
                      Save Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <Card className="p-8 text-center">
              <div className="space-y-2">
                <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or upload your CV for personalized recommendations.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

