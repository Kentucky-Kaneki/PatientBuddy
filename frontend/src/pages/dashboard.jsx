import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText, LogOut, Pill, MessageCircle, History,
  Plus, Upload, TrendingUp, TrendingDown, Minus, User, Heart, ChevronRight,
  Calendar, AlertCircle, ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import AddFamilyMemberModal from "@/components/AddFamilyMemberModal";

// Default health metrics data
const defaultHealthMetrics = [
  {
    name: "Hemoglobin",
    current: "14.2 g/dL",
    previous: "12.8 g/dL",
    trend: "up",
    change: "+10.9%",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  },
  {
    name: "Vitamin D",
    current: "38 ng/mL",
    previous: "22 ng/mL",
    trend: "up",
    change: "+72.7%",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  },
  {
    name: "Total Cholesterol",
    current: "185 mg/dL",
    previous: "220 mg/dL",
    trend: "down",
    change: "-15.9%",
    icon: TrendingDown,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  },
  {
    name: "TSH",
    current: "2.8 mIU/L",
    previous: "2.7 mIU/L",
    trend: "stable",
    change: "+3.7%",
    icon: Minus,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-muted"
  }
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [recentActivity, setRecentActivity] = useState([]);
  const [healthTrends, setHealthTrends] = useState([]);
  const [healthInsight, setHealthInsight] = useState({
    title: "No new insights",
    message: "Upload more reports to get personalized health insights."
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/", { replace: true });
  };

  // fetch user and members data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login.');
          return;
        };
        
        
        const response = await fetch('http://localhost:5050/api/patient/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        setUser(data.user);
        setMembers(data.user.members || []);
        setSelectedMember(data.user.members[0]._id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /* ---------- FETCH ACTIVITY DATA ---------- */
  useEffect(() => {
    if (!selectedMember) return;

    /* Recent Activity */
    const fetchReports = async () => {
      try {
        const res = await fetch(
          `http://localhost:5050/api/reports/recent/${selectedMember}`
        );
        const data = await res.json();
        
        if (data.success) {
          const activity = data.reports.slice(0, 3).map((r) => ({
            type: "report",
            title: r.fileName || "Medical Report",
            date: new Date(r.uploadDate).toLocaleDateString(),
            id: r._id,
            summary: r.summary,
            fullText: r.fullText,
          }));

          console.log("Recent Reports are", activity);

          setRecentActivity(activity);
          
          // Only update trends if we get actual data from reports
          const extractedTrends = extractTrendsFromReports(data.reports);
          if (extractedTrends.length > 0) {
            setHealthTrends(extractedTrends);
          }
        }
      } catch (err) {
        console.error("Reports fetch failed", err);
      }
    };

    fetchReports();
  }, [selectedMember]);

  /* ---------- HELPERS ---------- */
  const extractTrendsFromReports = (reports) => {
    // You can parse actual data from reports here in the future
    // For now, return default metrics
    return defaultHealthMetrics;
  };

  if (isLoading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MediClear</span>
          </Link>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Good morning, {user?.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's your health dashboard. Upload a new document or review your history.
            </p>
          </motion.div>

          {/* Quick Actions*/}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* 1. Upload Report */}
              <Card 
                className="group cursor-pointer card-hover border-border hover:border-primary/30"
                onClick={() => {
                  navigate(`/upload/report?memberId=${selectedMember}`);
                }}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Upload Report</h3>
                    <p className="text-sm text-muted-foreground">Medical or lab report</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>

              {/* 2. Upload Prescription */}
              <Card 
                className="group cursor-pointer card-hover border-border hover:border-primary/30"
                onClick={() => {
                  navigate(`/upload/prescription?memberId=${selectedMember}`);
                }}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Pill className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Upload Prescription</h3>
                    <p className="text-sm text-muted-foreground">Handwritten or printed</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>

              {/* 3. AI Assistant */}
              <Card 
                className="group cursor-pointer card-hover border-border hover:border-primary/30"
                onClick={() => {
                  navigate(`/chat?memberId=${selectedMember}`);
                }}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-info" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">Ask health questions</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>

              {/* 4. View History */}
              <Card 
                className="group cursor-pointer card-hover border-border hover:border-primary/30"
                onClick={() => {
                  navigate(`/history?memberId=${selectedMember}`);
                }}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <History className="w-6 h-6 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">View History</h3>
                    <p className="text-sm text-muted-foreground">Past reports & trends</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>

            </div>
          </motion.div>

          {/* Recent Activity*/}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <Link
                    key={i}
                    to={item.type === "report" ? `/report/${item.id}` : `/prescription/${item.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${item.type === "report" ? "bg-primary/10" : "bg-success/10"} flex items-center justify-center`}>
                      {item.type === "report" ? (
                        <FileText className="w-5 h-5 text-primary" />
                      ) : (
                        <Pill className="w-5 h-5 text-success" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="flex gap-2 text-sm text-muted-foreground items-center">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                        <span className={`${item.statusColor} font-medium`}>
                          • {item.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Insight (DYNAMIC) */}
          {healthInsight && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {healthInsight?.title || "Health Insight"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {healthInsight?.message || "No insights available yet."}
                  </p>
                  <Link to="/chat">
                    <Button variant="soft" size="sm">
                      Ask AI About This
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* Family Profiles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Member Profiles</CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>Switch between members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.map((member) => (                   
                  <button
                    key={member._id}
                    onClick={() => setSelectedMember(member._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      selectedMember === member._id 
                        ? "bg-primary/10 border border-primary/30" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{member.name}</span>
                    {selectedMember === member._id && (
                      <span className="ml-auto text-xs text-primary font-medium">Active</span>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Health Trends - DETAILED METRICS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Health Trends</CardTitle>
                <Link to={`/history?memberId=${selectedMember}`}>
                  <Button variant="ghost" size="sm" className="h-8">
                    <span className="text-xs">View All</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {healthTrends.map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={i}
                    className={`flex justify-between items-center p-4 rounded-xl border ${metric.borderColor} ${metric.bgColor} hover:scale-[1.02] transition-all cursor-pointer`}
                    onClick={() => navigate(`/history?memberId=${selectedMember}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${metric.bgColor} border ${metric.borderColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{metric.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Prev: {metric.previous}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{metric.current}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${metric.color} border-current`}
                      >
                        {metric.change}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Upload */}
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground mb-3">
                Drag & drop or click to upload
              </p>
              <Link to={`/upload/report?memberId=${selectedMember}`}>
                <Button variant="hero" size="sm">
                  Browse Files
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {user && (
        <AddFamilyMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={user._id}
        />
      )}
    </div>
  );
};

export default Dashboard;