import { useState } from "react";
import { motion } from "framer-motion";
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
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Sparkles,
  Calendar,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ---------------- DATA ---------------- */

const healthMetricsData = [
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
      "1M": "Your hemoglobin has shown steady improvement this month...",
      "3M": "Over the past 3 months, your hemoglobin has improved significantly...",
      "6M": "Remarkable 6-month progress! Starting from below normal...",
    },
  },
  // Vitamin D, Cholesterol, TSH → SAME as your TS code
];

/* ---------------- MAIN CHART ---------------- */

export const HealthMetricChart = ({ metricName, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("1M");

  const metric = healthMetricsData.find((m) => m.name === metricName);
  if (!metric) return null;

  const chartData = metric.data[selectedPeriod];
  const insight = metric.insights[selectedPeriod];
  const currentValue = parseFloat(metric.current);

  const isInRange = (value) =>
    value >= metric.normalRange.min && value <= metric.normalRange.max;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const value = payload[0].value;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold" style={{ color: metric.color }}>
            {value} {metric.unit}
          </p>
          <p
            className={`text-xs ${
              isInRange(value) ? "text-success" : "text-warning"
            }`}
          >
            {isInRange(value)
              ? "Within normal range"
              : "Outside normal range"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{metric.name}</CardTitle>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* PERIOD SELECTOR */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {["1M", "3M", "6M"].map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={selectedPeriod === p ? "default" : "outline"}
                  onClick={() => setSelectedPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>

            {/* CHART */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id={`grad-${metric.name}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />

                  <ReferenceLine y={metric.normalRange.min} stroke="#22c55e" strokeDasharray="5 5" />
                  <ReferenceLine y={metric.normalRange.max} stroke="#22c55e" strokeDasharray="5 5" />

                  <Area
                    dataKey="value"
                    stroke={metric.color}
                    fill={`url(#grad-${metric.name})`}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* AI INSIGHT */}
            <div className="p-4 rounded-xl bg-primary/5 border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">AI Health Insight</span>
              </div>
              <p className="text-sm text-muted-foreground">{insight}</p>
            </div>

            {/* STATUS */}
            <Badge
              variant="outline"
              className={
                isInRange(currentValue)
                  ? "text-success border-success"
                  : "text-warning border-warning"
              }
            >
              {isInRange(currentValue)
                ? "✓ Within normal range"
                : "⚠ Outside normal range"}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- SUMMARY CARD ---------------- */

export const HealthTrendCard = ({ metric, onClick }) => {
  const icon =
    metric.trend === "up" ? (
      <TrendingUp className="w-4 h-4 text-success" />
    ) : metric.trend === "down" ? (
      <TrendingDown className="w-4 h-4 text-success" />
    ) : (
      <Minus className="w-4 h-4 text-muted-foreground" />
    );

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className="flex justify-between p-4 border rounded-xl cursor-pointer hover:bg-muted/30"
    >
      <div className="flex gap-3">
        {icon}
        <div>
          <p className="font-medium">{metric.name}</p>
          <p className="text-sm text-muted-foreground">
            Previous: {metric.previous}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{metric.current}</p>
        <p className="text-sm">{metric.change}</p>
      </div>
    </motion.div>
  );
};
