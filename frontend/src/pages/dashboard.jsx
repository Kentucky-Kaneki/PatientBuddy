import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, LogOut, Pill, MessageCircle, History, Users, Plus, Upload, TrendingUp, Bell, Settings, Heart, ChevronRight, Calendar, AlertCircle, CheckCircle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const navigate = useNavigate();
  const [healthInsights, setHealthInsights] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [healthTrends, setHealthTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/dashboard", { replace: true });
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
        }
        
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
        setSelectedMember(data.user.members[0]._id)  // Populated members array
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const userId = "507f1f77bcf86cd799439011"; // Replace with actual user ID from auth

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMember]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch health insights
      const insightsRes = await fetch(`http://localhost:5050/api/insights/${userId}/insights`);
      const insightsData = await insightsRes.json();
      if (insightsData.success) {
        setHealthInsights(insightsData.insights);
      }

      // Fetch recent reports for activity
      const reportsRes = await fetch(`http://localhost:5050/api/reports/patient/${userId}`);
      const reportsData = await reportsRes.json();
      if (reportsData.success) {
        const activities = reportsData.reports.slice(0, 3).map(report => ({
          type: "report",
          title: report.reportType || "Medical Report",
          date: new Date(report.uploadDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          status: report.summary ? "analyzed" : "processing",
          statusColor: report.summary ? "text-success" : "text-warning",
          id: report._id,
        }));
        setRecentActivity(activities);

        // Extract trends from reports
        extractHealthTrends(reportsData.reports);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractHealthTrends = (reports) => {
    const trends = [];
    
    // Analyze reports for trends (this is a simple example)
    reports.forEach(report => {
      const findings = (report.keyFindings || "").toLowerCase();
      
      if (findings.includes('hemoglobin')) {
        if (!trends.find(t => t.metric === 'Hemoglobin')) {
          trends.push({
            metric: 'Hemoglobin',
            status: findings.includes('improved') || findings.includes('normal') ? 'improved' : 'stable',
            color: findings.includes('improved') || findings.includes('normal') ? 'success' : 'warning',
            icon: '↑',
          });
        }
      }
      
      if (findings.includes('vitamin d')) {
        if (!trends.find(t => t.metric === 'Vitamin D')) {
          trends.push({
            metric: 'Vitamin D',
            status: findings.includes('low') || findings.includes('deficient') ? 'stable-low' : 'improved',
            color: findings.includes('low') || findings.includes('deficient') ? 'warning' : 'success',
            icon: '→',
          });
        }
      }
      
      if (findings.includes('cholesterol')) {
        if (!trends.find(t => t.metric === 'Cholesterol')) {
          trends.push({
            metric: 'Cholesterol',
            status: findings.includes('reduced') || findings.includes('normal') ? 'reduced' : 'stable',
            color: findings.includes('reduced') || findings.includes('normal') ? 'success' : 'warning',
            icon: '↓',
          });
        }
      }
    });

    setHealthTrends(trends.slice(0, 3));
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return AlertCircle;
      case 'attention':
        return AlertCircle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getInsightStyle = (type) => {
    switch (type) {
      case 'warning':
        return {
          card: 'border-warning/30 bg-warning/5',
          icon: 'bg-warning/20 text-warning',
        };
      case 'attention':
        return {
          card: 'border-orange-500/30 bg-orange-500/5',
          icon: 'bg-orange-500/20 text-orange-500',
        };
      case 'success':
        return {
          card: 'border-success/30 bg-success/5',
          icon: 'bg-success/20 text-success',
        };
      default:
        return {
          card: 'border-info/30 bg-info/5',
          icon: 'bg-info/20 text-info',
        };
    }
  };

  if (isLoading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MediClear</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                  </Button>
                </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Good morning, {user.name}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's your health dashboard. Upload a new document or review your history.
              </p>
            </motion.div>

            {/* Quick Actions */}
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
                    navigate(`/upload/prescription?memberId=${selectedMember}`);
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
                      <Clock className="w-6 h-6 text-warning" />
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

            {/* Health Insights - Dynamic */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {loading ? (
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : healthInsights.length > 0 ? (
                healthInsights.map((insight, index) => {
                  const InsightIcon = getInsightIcon(insight.type);
                  const styles = getInsightStyle(insight.type);
                  
                  return (
                    <Card key={index} className={styles.card}>
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg ${styles.icon} flex items-center justify-center flex-shrink-0`}>
                          <InsightIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.message}
                          </p>
                          <Link to="/chat">
                            <Button variant="soft" size="sm">
                              Ask AI About This
                              <MessageCircle className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="p-6 text-center">
                    <Info className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No health insights yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload a medical report to get personalized insights</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
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
                    <CardTitle className="text-lg">Family Profiles</CardTitle>
                    <Link to="/family">
                      <Button variant="ghost" size="icon-sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription>Switch between family members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {members.map((member) => (                   
                    <button
                      key={member.name}
                      onClick={() => setSelectedMember(member._id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        selectedMember === member._id 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={"bg-primary text-primary-foreground"}>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{member.name}</span>
                      {selectedMember === member.name && (
                        <span className="ml-auto text-xs text-primary font-medium">Active</span>
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Trends - Dynamic */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <CardTitle className="text-lg">Health Trends</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-12 bg-muted rounded-xl"></div>
                      <div className="h-12 bg-muted rounded-xl"></div>
                      <div className="h-12 bg-muted rounded-xl"></div>
                    </div>
                  ) : healthTrends.length > 0 ? (
                    <>
                      {healthTrends.map((trend, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-xl bg-${trend.color}/10`}>
                          <span className="text-sm font-medium text-foreground">{trend.metric}</span>
                          <span className={`text-sm text-${trend.color} font-medium`}>
                            {trend.icon} {trend.status === 'stable-low' ? 'Stable (Low)' : trend.status.charAt(0).toUpperCase() + trend.status.slice(1)}
                          </span>
                        </div>
                      ))}
                      <Link to="/history">
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View Full Timeline
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No trends available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Upload */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Quick Upload</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop your medical document here
                  </p>
                  <Link to="/upload/report">
                    <Button variant="hero" size="sm">
                      Browse Files
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;