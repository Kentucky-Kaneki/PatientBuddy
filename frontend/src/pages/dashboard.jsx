import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Pill, MessageCircle, History, Users, Plus, Upload, TrendingUp, Bell, Settings, Heart, ChevronRight, Calendar, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const recentActivity = [
  {
    type: "report",
    title: "Blood Test Report",
    date: "Dec 28, 2024",
    status: "analyzed",
    statusColor: "text-success",
  },
  {
    type: "prescription",
    title: "Dr. Smith Prescription",
    date: "Dec 25, 2024",
    status: "analyzed",
    statusColor: "text-success",
  },
  {
    type: "report",
    title: "Thyroid Panel",
    date: "Dec 20, 2024",
    status: "needs attention",
    statusColor: "text-warning",
  },
];

const familyMembers = [
  { name: "You", initials: "JD", color: "bg-primary" },
  { name: "Sarah", initials: "SD", color: "bg-info" },
  { name: "Dad", initials: "RD", color: "bg-success" },
];

const Dashboard = () => {
  const [selectedMember, setSelectedMember] = useState("You");

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
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
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
                Good morning, John! 👋
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
                {quickActions.map((action, index) => (
                  <Link key={action.title} to={action.href}>
                    <Card className="group cursor-pointer card-hover border-border hover:border-primary/30">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <Link to="/history">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <Card className="border-border">
                <CardContent className="p-0 divide-y divide-border">
                  {recentActivity.map((item, index) => (
                    <Link 
                      key={index} 
                      to={item.type === "report" ? "/report/1" : "/prescription/1"}
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
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{item.date}</span>
                          <span className={`${item.statusColor} font-medium`}>• {item.status}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Insight Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Health Insight</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your Vitamin D levels from your last test were below optimal range. 
                      Consider discussing supplementation with your healthcare provider.
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
                  {familyMembers.map((member) => (
                    <button
                      key={member.name}
                      onClick={() => setSelectedMember(member.name)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        selectedMember === member.name 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`${member.color} text-primary-foreground`}>
                          {member.initials}
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

            {/* Health Trends */}
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
                  <div className="flex items-center justify-between p-3 rounded-xl bg-success/10">
                    <span className="text-sm font-medium text-foreground">Hemoglobin</span>
                    <span className="text-sm text-success font-medium">↑ Improved</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-warning/10">
                    <span className="text-sm font-medium text-foreground">Vitamin D</span>
                    <span className="text-sm text-warning font-medium">→ Stable (Low)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-success/10">
                    <span className="text-sm font-medium text-foreground">Cholesterol</span>
                    <span className="text-sm text-success font-medium">↓ Reduced</span>
                  </div>
                  <Link to="/history">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View Full Timeline
                    </Button>
                  </Link>
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