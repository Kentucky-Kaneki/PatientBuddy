import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FileText, LogOut, Pill, MessageCircle, History,
  Plus, Upload, TrendingUp, Heart, ChevronRight,
  Calendar, AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ---------------- STATIC (UNCHANGED) ---------------- */

const quickActions = [
  {
    icon: FileText,
    title: "Upload Report",
    description: "Medical or lab report",
    href: "/upload/report",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Pill,
    title: "Upload Prescription",
    description: "Handwritten or printed",
    href: "/upload/prescription",
    color: "bg-success/10 text-success",
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description: "Ask health questions",
    href: "/chat",
    color: "bg-info/10 text-info",
  },
  {
    icon: History,
    title: "View History",
    description: "Past reports & trends",
    href: "/history",
    color: "bg-warning/10 text-warning",
  },
];

const familyMembers = [
  { name: "You", initials: "JD", color: "bg-primary", id: "self" },
  { name: "Sarah", initials: "SD", color: "bg-info", id: "sarah" },
  { name: "Dad", initials: "RD", color: "bg-success", id: "dad" },
];

/* ---------------- COMPONENT ---------------- */

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedMember, setSelectedMember] = useState(familyMembers[0].id);

  /* ---------- DYNAMIC STATE ---------- */
  const [recentActivity, setRecentActivity] = useState([]);
  const [healthInsight, setHealthInsight] = useState(null);
  const [healthTrends, setHealthTrends] = useState([]);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (!selectedMember) return;

    /* Recent Activity + Trends */
    const fetchReports = async () => {
      try {
        const res = await fetch(
          `http://localhost:5050/api/reports/patient/${selectedMember}`
        );
        const data = await res.json();

        if (data.success) {
          const activity = data.reports.slice(0, 3).map((r) => ({
            type: r.reportType === "prescription" ? "prescription" : "report",
            title: r.reportName || "Medical Report",
            date: new Date(r.uploadDate).toLocaleDateString(),
            status: r.summary ? "analyzed" : "needs attention",
            statusColor: r.summary ? "text-success" : "text-warning",
            id: r._id,
          }));

          setRecentActivity(activity);
          setHealthTrends(extractTrends(data.reports));
        }
      } catch (err) {
        console.error("Reports fetch failed", err);
      }
    };

    /* Health Insight */
    const fetchInsight = async () => {
      try {
        const res = await fetch(
          `http://localhost:5050/api/insights/${selectedMember}/insights`
        );
        const data = await res.json();

        if (data.success && data.insights.length > 0) {
          setHealthInsight(data.insights[0]);
        }
      } catch (err) {
        console.error("Insight fetch failed", err);
      }
    };

    fetchReports();
    fetchInsight();
  }, [selectedMember]);

  /* ---------- HELPERS ---------- */
  const extractTrends = (reports) => {
    const trends = [];

    reports.forEach((r) => {
      const text = (r.keyFindings || "").toLowerCase();

      if (text.includes("hemoglobin")) {
        trends.push({ label: "Hemoglobin", value: "↑ Improved", color: "success" });
      }
      if (text.includes("vitamin d")) {
        trends.push({ label: "Vitamin D", value: "→ Stable (Low)", color: "warning" });
      }
      if (text.includes("cholesterol")) {
        trends.push({ label: "Cholesterol", value: "↓ Reduced", color: "success" });
      }
    });

    return trends.slice(0, 3);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };


  /* ---------------- UI (UNCHANGED) ---------------- */

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
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarImage />
              <AvatarFallback className="bg-primary text-primary-foreground">
                JD
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
              Good morning, {user.name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's your health dashboard. Upload a new document or review your history.
            </p>
          </motion.div>

          {/* Quick Actions (UNCHANGED) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.href}>
                  <Card className="group cursor-pointer card-hover">
                    <CardContent className="p-5 flex gap-4">
                      <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <ChevronRight />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity (DYNAMIC) */}
          <Card>
            <CardContent className="p-0 divide-y">
              {recentActivity.map((item, i) => (
                <Link
                  key={i}
                  to={item.type === "report" ? `/report/${item.id}` : `/prescription/${item.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50"
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
                    <div className="flex gap-2 text-sm">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                      <span className={`${item.statusColor} font-medium`}>
                        • {item.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Health Insight (DYNAMIC) */}
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-5 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
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
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* Family Profiles */}
          <Card>
            <CardHeader>
              <CardTitle>Family Profiles</CardTitle>
              <CardDescription>Switch between family members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {familyMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMember(m.id)}
                  className={`w-full flex gap-3 p-3 rounded-xl ${
                    selectedMember === m.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                  }`}
                >
                  <Avatar>
                    <AvatarFallback className={`${m.color} text-primary-foreground`}>
                      {m.initials}
                    </AvatarFallback>
                  </Avatar>
                  {m.name}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Health Trends (DYNAMIC) */}
          <Card>
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthTrends.map((t, i) => (
                <div
                  key={i}
                  className={`flex justify-between p-3 rounded-xl ${
                    t.color === "success" ? "bg-success/10" : "bg-warning/10"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={t.color === "success" ? "text-success" : "text-warning"}>
                    {t.value}
                  </span>
                </div>
              ))}
              <Link to="/history">
                <Button variant="outline" size="sm" className="w-full">
                  View Full Timeline
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Upload (UNCHANGED) */}
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <Upload className="mx-auto mb-3" />
              <Link to="/upload/report">
                <Button variant="hero" size="sm">
                  Browse Files
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
