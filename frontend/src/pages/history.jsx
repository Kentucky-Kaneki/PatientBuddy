import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import {
  ArrowLeft,
  FileText,
  Pill,
  Search,
  ChevronRight,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const History = (props) => {
  const [historyData, setHistoryData] = useState([]);
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('memberId');
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Fetch history from backend
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // 🔍 DEBUG LOGS
      console.log("🔍 Token:", token ? "✅ exists" : "❌ missing");
      console.log("🔍 UserId:", userId);
      console.log("🔍 All localStorage:", { ...localStorage });

      if (!userId) {
        setError("User ID not found. Please log in again.");
        console.error("❌ No userId in localStorage");
        return;
      }

      console.log("📤 Sending request with:", {
        userId,
        search: searchQuery,
        type: activeFilter,
      });

      const res = await axios.get("http://localhost:5050/api/history", {
        params: {
          userId,
          search: searchQuery,
          type: activeFilter,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("✅ Response received:", res.data);
      setHistoryData(res.data.data || []);
      
    } catch (error) {
      console.error("❌ Failed to fetch history:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      
      setError(
        error.response?.data?.message || 
        "Failed to load history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Refetch on search / filter change
  useEffect(() => {
    fetchHistory();
  }, [searchQuery, activeFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
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

            {/* ================= DOCUMENTS ================= */}
            <TabsContent value="documents" className="space-y-6">
              <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
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
                    {f === "all" ? "All" : `${f}s`}
                  </Button>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <Card className="border-destructive">
                  <CardContent className="p-4">
                    <p className="text-destructive text-sm">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Loading */}
              {loading && (
                <p className="text-center text-muted-foreground py-10">
                  Loading history...
                </p>
              )}

              {/* Empty */}
              {!loading && !error && historyData.length === 0 && (
                <Card>
                  <CardContent className="p-10 text-center">
                    <p className="text-muted-foreground">
                      No documents found
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a report or create a prescription to see them here
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* List */}
              {!loading &&
                !error &&
                historyData.map((item) => (
                  <Link
                    key={item.id}
                    to={
                      item.type === "report"
                        ? `/report/${item.id}`
                        : `/prescription/${item.id}`
                    }
                  >
                    <Card className="hover:border-primary/40 transition mb-4">
                      <CardContent className="p-5 flex gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            item.type === "report"
                              ? "bg-primary/10"
                              : "bg-success/10"
                          }`}
                        >
                          {item.type === "report" ? (
                            <FileText className="text-primary" />
                          ) : (
                            <Pill className="text-success" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.date).toLocaleDateString()} •{" "}
                            {item.lab}
                          </p>

                          <div className="flex gap-2 mt-2 flex-wrap">
                            {item.highlights?.slice(0, 3).map((h, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {h}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <ChevronRight className="text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </TabsContent>

            {/* ================= TRENDS ================= */}
            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Key Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Health trends will be generated automatically from your
                    reports.
                  </p>
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