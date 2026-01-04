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

const healthMetrics = [
  {
    name: "Hemoglobin",
    current: "14.2 g/dL",
    previous: "12.8 g/dL",
    trend: "up",
    change: "+10.9%",
    unit: "g/dL",
    normalRange: { min: 12, max: 16 },
    color: "#ef4444",
    data: {
      "1M": [
        { date: "Dec 1", value: 13.1 },
        { date: "Dec 8", value: 13.4 },
        { date: "Dec 15", value: 13.8 },
        { date: "Dec 22", value: 14.0 },
        { date: "Dec 28", value: 14.2 },
      ],
      "3M": [
        { date: "Oct", value: 12.8 },
        { date: "Nov", value: 13.2 },
        { date: "Dec", value: 14.2 },
      ],
      "6M": [
        { date: "Jul", value: 11.5 },
        { date: "Aug", value: 12.0 },
        { date: "Sep", value: 12.4 },
        { date: "Oct", value: 12.8 },
        { date: "Nov", value: 13.2 },
        { date: "Dec", value: 14.2 },
      ],
    },
    insights: {
      "1M": "Your hemoglobin has shown steady improvement this month, increasing from 13.1 to 14.2 g/dL.",
      "3M": "Over 3 months, your hemoglobin improved from 12.8 to 14.2 g/dL, now within normal range.",
      "6M": "Remarkable 6-month progress from 11.5 to 14.2 g/dL. Excellent treatment adherence!",
    },
  },
  {
    name: "Vitamin D",
    current: "38 ng/mL",
    previous: "22 ng/mL",
    trend: "up",
    change: "+72.7%",
    unit: "ng/mL",
    normalRange: { min: 30, max: 50 },
    color: "#f59e0b",
    data: {
      "1M": [
        { date: "Dec 1", value: 32 },
        { date: "Dec 8", value: 34 },
        { date: "Dec 15", value: 36 },
        { date: "Dec 22", value: 37 },
        { date: "Dec 28", value: 38 },
      ],
      "3M": [
        { date: "Oct", value: 22 },
        { date: "Nov", value: 28 },
        { date: "Dec", value: 38 },
      ],
      "6M": [
        { date: "Jul", value: 18 },
        { date: "Aug", value: 20 },
        { date: "Sep", value: 24 },
        { date: "Oct", value: 22 },
        { date: "Nov", value: 28 },
        { date: "Dec", value: 38 },
      ],
    },
    insights: {
      "1M": "Vitamin D reached optimal range this month. Maintain current supplementation.",
      "3M": "Excellent 3-month progress from deficient (22) to optimal (38 ng/mL).",
      "6M": "Outstanding improvement from severe deficiency. Now in ideal range!",
    },
  },
  {
    name: "Total Cholesterol",
    current: "185 mg/dL",
    previous: "220 mg/dL",
    trend: "down",
    change: "-15.9%",
    unit: "mg/dL",
    normalRange: { min: 125, max: 200 },
    color: "#8b5cf6",
    data: {
      "1M": [
        { date: "Dec 1", value: 198 },
        { date: "Dec 8", value: 195 },
        { date: "Dec 15", value: 190 },
        { date: "Dec 22", value: 187 },
        { date: "Dec 28", value: 185 },
      ],
      "3M": [
        { date: "Oct", value: 220 },
        { date: "Nov", value: 205 },
        { date: "Dec", value: 185 },
      ],
      "6M": [
        { date: "Jul", value: 235 },
        { date: "Aug", value: 228 },
        { date: "Sep", value: 222 },
        { date: "Oct", value: 220 },
        { date: "Nov", value: 205 },
        { date: "Dec", value: 185 },
      ],
    },
    insights: {
      "1M": "Great progress! Cholesterol decreased steadily to healthy range.",
      "3M": "Impressive reduction from 220 to 185 mg/dL lowers cardiovascular risk.",
      "6M": "Fantastic achievement reducing from borderline high to healthy level!",
    },
  },
  {
    name: "TSH",
    current: "2.8 mIU/L",
    previous: "2.7 mIU/L",
    trend: "stable",
    change: "+3.7%",
    unit: "mIU/L",
    normalRange: { min: 0.5, max: 4.5 },
    color: "#06b6d4",
    data: {
      "1M": [
        { date: "Dec 1", value: 2.6 },
        { date: "Dec 8", value: 2.7 },
        { date: "Dec 15", value: 2.8 },
        { date: "Dec 22", value: 2.7 },
        { date: "Dec 28", value: 2.8 },
      ],
      "3M": [
        { date: "Oct", value: 2.7 },
        { date: "Nov", value: 2.8 },
        { date: "Dec", value: 2.8 },
      ],
      "6M": [
        { date: "Jul", value: 2.9 },
        { date: "Aug", value: 2.8 },
        { date: "Sep", value: 2.7 },
        { date: "Oct", value: 2.7 },
        { date: "Nov", value: 2.8 },
        { date: "Dec", value: 2.8 },
      ],
    },
    insights: {
      "1M": "TSH levels stable and well-controlled. No adjustment needed.",
      "3M": "Excellent thyroid stability over 3 months. Current dosage working well.",
      "6M": "Consistently stable over 6 months. Optimal medication management!",
    },
  },
];

const historyItems = [
  {
    id: "1",
    type: "report",
    title: "Complete Blood Count",
    date: "2024-12-28",
    lab: "City Hospital Lab",
    highlights: ["Hemoglobin: 14.2", "WBC: Normal", "Platelets: Normal"],
  },
  {
    id: "2",
    type: "prescription",
    title: "Vitamin D Supplement",
    date: "2024-12-15",
    lab: "Dr. Smith",
    highlights: ["60,000 IU weekly", "3 months"],
  },
  {
    id: "3",
    type: "report",
    title: "Lipid Profile",
    date: "2024-12-10",
    lab: "MedCheck Labs",
    highlights: ["Total Cholesterol: 185", "HDL: Good", "LDL: Normal"],
  },
  {
    id: "4",
    type: "report",
    title: "Thyroid Function Test",
    date: "2024-11-28",
    lab: "City Hospital Lab",
    highlights: ["TSH: 2.8", "T3: Normal", "T4: Normal"],
  },
  {
    id: "5",
    type: "prescription",
    title: "Cholesterol Medication",
    date: "2024-10-15",
    lab: "Dr. Johnson",
    highlights: ["Atorvastatin 10mg", "Once daily"],
  },
];

function HealthMetricChart({ metricName, onClose }) {
  const [period, setPeriod] = useState("1M");
  const m = healthMetrics.find((x) => x.name === metricName);
  
  if (!m) return null;

  const data = m.data[period];
  const insight = m.insights[period];
  const val = parseFloat(m.current);
  const gradId = metricName.replace(/\s/g, '');

  const inRange = (v) => v >= m.normalRange.min && v <= m.normalRange.max;

  const Tip = ({ active, payload, label }) => {
    if (active && payload?.[0]) {
      const v = payload[0].value;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold" style={{ color: m.color }}>
            {v} {m.unit}
          </p>
          <p className={`text-xs ${inRange(v) ? "text-green-600" : "text-amber-600"}`}>
            {inRange(v) ? "Within normal range" : "Outside normal range"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{m.name}</CardTitle>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {["1M", "3M", "6M"].map((p) => (
                <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}>
                  {p}
                </Button>
              ))}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={m.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<Tip />} />
                  <ReferenceLine y={m.normalRange.min} stroke="#22c55e" strokeDasharray="5 5" />
                  <ReferenceLine y={m.normalRange.max} stroke="#22c55e" strokeDasharray="5 5" />
                  <Area dataKey="value" stroke={m.color} fill={`url(#${gradId})`} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">AI Health Insight</span>
              </div>
              <p className="text-sm text-muted-foreground">{insight}</p>
            </div>
            <Badge variant="outline" className={inRange(val) ? "text-green-600 border-green-600" : "text-amber-600 border-amber-600"}>
              {inRange(val) ? "✓ Within normal range" : "⚠ Outside normal range"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrendCard({ metric, onClick }) {
  const icon = metric.trend === "up" ? (
    <TrendingUp className="w-4 h-4 text-green-600" />
  ) : metric.trend === "down" ? (
    <TrendingDown className="w-4 h-4 text-green-600" />
  ) : (
    <Minus className="w-4 h-4 text-muted-foreground" />
  );

  return (
    <div onClick={onClick} className="flex justify-between p-4 border rounded-xl cursor-pointer hover:bg-muted/30 transition-all">
      <div className="flex gap-3">
        {icon}
        <div>
          <p className="font-medium">{metric.name}</p>
          <p className="text-sm text-muted-foreground">Previous: {metric.previous}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{metric.current}</p>
        <p className="text-sm text-muted-foreground">{metric.change}</p>
      </div>
    </div>
  );
}

export default function History() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = historyItems.filter((i) => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || i.type === filter;
    return matchSearch && matchFilter;
  });

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