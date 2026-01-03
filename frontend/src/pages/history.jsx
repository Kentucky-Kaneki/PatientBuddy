import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Pill,
  Search,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const historyData = [
  {
    id: 1,
    type: "report",
    title: "Complete Blood Count (CBC)",
    date: "Dec 28, 2024",
    lab: "HealthFirst Diagnostics",
    status: "analyzed",
    highlights: ["Vitamin D low", "Hemoglobin improved"],
    trend: "improved",
  },
  {
    id: 2,
    type: "prescription",
    title: "Dr. Michael Chen Prescription",
    date: "Dec 25, 2024",
    lab: "Family Health Center",
    status: "analyzed",
    highlights: ["Amoxicillin 500mg", "Vitamin C"],
  },
  {
    id: 3,
    type: "report",
    title: "Thyroid Function Test",
    date: "Dec 20, 2024",
    lab: "Metro Labs",
    status: "needs attention",
    highlights: ["TSH slightly elevated"],
    trend: "watch",
  },
  {
    id: 4,
    type: "report",
    title: "Lipid Profile",
    date: "Dec 15, 2024",
    lab: "HealthFirst Diagnostics",
    status: "analyzed",
    highlights: ["Cholesterol normal", "HDL good"],
    trend: "improved",
  },
];

const healthTrends = [
  { name: "Hemoglobin", current: "14.2 g/dL", previous: "12.8 g/dL", trend: "up", change: "+10.9%" },
  { name: "Vitamin D", current: "18 ng/mL", previous: "15 ng/mL", trend: "up", change: "+20%" },
  { name: "Cholesterol", current: "185 mg/dL", previous: "210 mg/dL", trend: "down", change: "-11.9%" },
  { name: "TSH", current: "4.8 mIU/L", previous: "3.5 mIU/L", trend: "up", change: "+37%" },
];

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredHistory = historyData.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || item.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getTrendIcon = (trend) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-success" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = (name, trend) => {
    if (name === "Cholesterol") {
      return trend === "down" ? "text-success" : "text-warning";
    }
    if (name === "TSH") {
      return trend === "up" ? "text-warning" : "text-success";
    }
    return trend === "up" ? "text-success" : "text-warning";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Health History</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs defaultValue="documents" className="space-y-6">
            <TabsList className="grid grid-cols-2 h-12">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="trends">Health Trends</TabsTrigger>
            </TabsList>

            {/* DOCUMENTS */}
            <TabsContent value="documents" className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                {["all", "report", "prescription"].map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={activeFilter === f ? "default" : "outline"}
                    onClick={() => setActiveFilter(f)}
                    className="capitalize"
                  >
                    {f === "all" ? "All" : f + "s"}
                  </Button>
                ))}
              </div>

              {filteredHistory.map((item) => (
                <Link
                  key={item.id}
                  to={item.type === "report" ? `/report/${item.id}` : `/prescription/${item.id}`}
                >
                  <Card className="hover:border-primary/40 transition mb-4">
                    <CardContent className="p-5 flex gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          item.type === "report" ? "bg-primary/10" : "bg-success/10"
                        }`}
                      >
                        {item.type === "report" ? (
                          <FileText className="text-primary" />
                        ) : (
                          <Pill className="text-success" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.date} • {item.lab}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {item.highlights.map((h, i) => (
                            <Badge key={i} variant="outline">{h}</Badge>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            {/* TRENDS */}
            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Key Health Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthTrends.map((m) => (
                    <div key={m.name} className="flex justify-between p-4 border rounded-xl">
                      <div className="flex gap-3">
                        {getTrendIcon(m.trend)}
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Previous: {m.previous}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{m.current}</p>
                        <p className={`text-sm ${getTrendColor(m.name, m.trend)}`}>
                          {m.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default History;