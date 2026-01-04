import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ArrowLeft,
  FileText,
  Pill,
  Search,
  ChevronRight,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Sparkles,
  Calendar,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

      // 🔍 DEBUG LOGS
      console.log("🔍 Token:", token ? "✅ exists" : "❌ missing");

      const res = await axios.get("http://localhost:5050/api/patient/history", {
        params: {
          memberId: memberId,
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
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Health History</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid grid-cols-2 h-12">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="trends">Health Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12" />
              </div>
              {["all", "report", "prescription"].map((f) => (
                <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">
                  {f === "all" ? "All" : `${f}s`}
                </Button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <p className="text-muted-foreground">No documents found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {search || filter !== "all" ? "Try adjusting your search or filters" : "Upload a report or prescription to see them here"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((i) => (
                <Card key={i.id} className="hover:border-primary/40 transition cursor-pointer">
                  <CardContent className="p-5 flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${i.type === "report" ? "bg-primary/10" : "bg-green-500/10"}`}>
                      {i.type === "report" ? <FileText className="text-primary w-5 h-5" /> : <Pill className="text-green-600 w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{i.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(i.date).toLocaleDateString()} • {i.lab}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {i.highlights?.slice(0, 3).map((h, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {h}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground shrink-0 w-5 h-5" />
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Health Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthMetrics.map((m) => (
                  <TrendCard key={m.name} metric={m} onClick={() => setSelected(m.name)} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {selected && <HealthMetricChart metricName={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}