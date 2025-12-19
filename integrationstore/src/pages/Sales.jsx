// SalesPage.jsx
import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";



// By category (all time – same categories as DB)
const CATEGORY_DATA_ALL = [
  { name: "DesignerMetal&MetalFrame", value: 75 },
  { name: "FrameLess", value: 80 },
  { name: "FullFrame", value: 90 },
  { name: "HalfFrame", value: 95 },
  { name: "SafetyGlassess", value: 40 },
  { name: "Sunglassess", value: 65 },
];

// Change numbers a bit for each period
const CATEGORY_DATA_YEAR = [
  { name: "DesignerMetal&MetalFrame", value: 70 },
  { name: "FrameLess", value: 60 },
  { name: "FullFrame", value: 90 },
  { name: "HalfFrame", value: 55 },
  { name: "SafetyGlassess", value: 25 },
  { name: "Sunglassess", value: 45 },
];

const CATEGORY_DATA_MONTH = [
  { name: "DesignerMetal&MetalFrame", value: 18 },
  { name: "FrameLess", value: 12 },
  { name: "FullFrame", value: 22 },
  { name: "HalfFrame", value: 15 },
  { name: "SafetyGlassess", value: 6 },
  { name: "Sunglassess", value: 10 },
];

// Order-wise financial trend (like your screenshot)
const ORDERS_ALL = Array.from({ length: 25 }).map((_, i) => ({
  order: i + 1,
  sales:
    i < 2
      ? [1200, 100][i]
      : i < 10
      ? 0
      : i < 14
      ? [0, 800, 1500, 2200][i - 10]
      : i < 18
      ? [300, 280, 260, 250][i - 14]
      : i < 22
      ? [0, 0, 0, 0][i - 18]
      : [500, 900, 1800, 1700][i - 22],
}));

// Slightly different curve per period
const ORDERS_YEAR = ORDERS_ALL.map((o, idx) => ({
  order: o.order,
  sales: idx % 2 === 0 ? o.sales * 0.7 : o.sales * 0.5,
}));

const ORDERS_MONTH = ORDERS_ALL.slice(0, 12).map((o, idx) => ({
  order: o.order,
  sales: idx % 3 === 0 ? o.sales * 0.6 : o.sales * 0.3,
}));

const COLORS = ["#4f46e5", "#22c55e", "#f97316", "#0ea5e9", "#a855f7", "#ef4444"];

function Sales() {
  const [period, setPeriod] = useState("all"); // all | year | month

  // pick data based on period
  const categoryData =
    period === "year"
      ? CATEGORY_DATA_YEAR
      : period === "month"
      ? CATEGORY_DATA_MONTH
      : CATEGORY_DATA_ALL;

  const orderData =
    period === "year"
      ? ORDERS_YEAR
      : period === "month"
      ? ORDERS_MONTH
      : ORDERS_ALL;

  const totalOrders = categoryData.reduce((sum, i) => sum + i.value, 0);
  const totalRevenue = 25178; // keep same for demo
  const avgOrderValue = (totalRevenue / totalOrders).toFixed(2);

  return (
    <div
      style={{
        padding: "24px",
        paddingLeft: "110px",
        background: "#f3f4f6",
        minHeight: "100vh",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 800,
          marginBottom: "24px",
        }}
      >
        Sales Analysis
      </h1>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "TOTAL ORDERS", value: totalOrders },
          { label: "TOTAL REVENUE", value: `₹${totalRevenue.toFixed(2)}` },
          { label: "AVERAGE ORDER VALUE", value: `₹${avgOrderValue}` },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "20px 24px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                marginBottom: "8px",
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* Period filter buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {[
          { key: "all", label: "All Time" },
          { key: "year", label: "Last Year" },
          { key: "month", label: "Last Month" },
        ].map((btn) => {
          const active = period === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => setPeriod(btn.key)}
              style={{
                border: `1px solid ${active ? "#2563eb" : "#d1d5db"}`,
                borderRadius: "999px",
                padding: "6px 16px",
                background: active ? "#2563eb" : "#ffffff",
                fontSize: "14px",
                cursor: "pointer",
                color: active ? "#ffffff" : "#374151",
                transition: "all 0.2s ease",
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Financial trend line chart */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "16px 20px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          Financial Trends by Order
        </h2>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={orderData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="order" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category charts: pie + bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Pie chart */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "16px 20px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Sales by Category (Pie)
          </h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}          
                  
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart per category */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "16px 20px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Category Performance (Bar)
          </h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
