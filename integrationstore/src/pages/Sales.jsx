// Custom label for PieChart to prevent overlap and hiding
function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={14}
      fontWeight={500}
      style={{ pointerEvents: 'none' }}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}
// src/pages/Sales.jsx
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, subYears } from "date-fns";
import "./Sales.css";

// Colors
const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#6EE7B7",
  "#F87171",
  "#2DD4BF",
];
const GRADIENT_COLORS = [
  { start: "#3B82F6", end: "#60A5FA" },
  { start: "#10B981", end: "#34D399" },
  { start: "#F59E0B", end: "#FBBF24" },
  { start: "#EF4444", end: "#F87171" },
];

// Firestore category collections
const CATEGORY_COLLECTIONS = [
  "DesignerMetal&MetalFrame",
  "FrameLess",
  "FullFrame",
  "HalfFrame",
  "SafetyGlassess",
  "Sunglassess",
];

// ---------- Custom components ----------

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        {label && <p className="tooltip-label">{label}</p>}
        {data?.month && (
          <p className="tooltip-month">Month: {data.month}</p>
        )}
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-item" style={{ color: entry.color || "#111827" }}>
            {entry.name}:{" "}
            {entry.name?.toLowerCase() === "sales"
              ? `₹${entry.value.toFixed(2)}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div className="custom-legend">
    {payload?.map((entry, index) => (
      <div key={index} className="legend-item">
        <span
          className="legend-color"
          style={{ backgroundColor: entry.color }}
        />
        <span className="legend-text">{entry.value}</span>
      </div>
    ))}
  </div>
);

const CustomTick = (props) => {
  const { x, y, payload } = props;
  const { value, month, dateOrdered } = payload.value || {};
  const isValidDate =
    dateOrdered && !isNaN(new Date(dateOrdered).getTime());
  const fullDate = isValidDate
    ? format(new Date(dateOrdered), "dd MMM yyyy")
    : null;

  return (
    <g transform={`translate(${x},${y})`}>
      {value != null && (
        <text
          x={0}
          y={-14}
          textAnchor="middle"
          fill="#4B5563"
          fontSize={12}
          fontWeight={500}
        >
          {value}
        </text>
      )}
      {month && (
        <text x={0} y={0} textAnchor="middle" fill="#6B7280" fontSize={10}>
          {month}
        </text>
      )}
      {fullDate && (
        <text
          x={0}
          y={16}
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize={9}
        >
          {fullDate}
        </text>
      )}
    </g>
  );
};

// ---------- Main Sales page ----------

export default function Sales() {
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState("all"); // all | year | month
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasInvalidData, setHasInvalidData] = useState(false);
  const [unmatchedProductIds, setUnmatchedProductIds] = useState([]);

  const db = getFirestore();

  // Fetch + map orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const ordersRef = collection(db, "detailsorder");
        const querySnapshot = await getDocs(ordersRef);

        const allOrders = [];
        const productIds = new Set();
        const productIdToCategory = {};
        const unmatchedIds = new Set();
        let invalidDataFound = false;

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.orders || !Array.isArray(data.orders)) {
            invalidDataFound = true;
            return;
          }

          data.orders.forEach((order) => {
            const totalAmount = parseFloat(order.totalAmount);
            if (isNaN(totalAmount)) {
              invalidDataFound = true;
            }

            const productId = order.productDetails?.productID;
            if (productId) {
              productIds.add(productId);
            } else {
              invalidDataFound = true;
              unmatchedIds.add(`Half Frame-${docSnap.id}-${Date.now()}`);
            }

            const validAmount = !isNaN(totalAmount)
              ? Math.abs(totalAmount)
              : 0;
            const timestamp = order.timestamp
              ? new Date(order.timestamp)
              : new Date();

            allOrders.push({
              id: `${docSnap.id}-${timestamp.getTime()}`,
              productId,
              category: null,
              dateOrdered: timestamp,
              totalAmount: validAmount,
              lensOption: order.lensOption?.name || "Only Frame",
              docId: docSnap.id,
            });
          });
        });

        // Map productID -> category
        const productIdArray = Array.from(productIds);
        for (const collectionId of CATEGORY_COLLECTIONS) {
          const promises = productIdArray.map(async (productId) => {
            const productRef = doc(db, collectionId, productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              productIdToCategory[productId] = collectionId;
            }
          });
          await Promise.all(promises);
        }

        // Attach categories
        const finalOrders = allOrders.map((order) => {
          const category =
            productIdToCategory[order.productId] || "Half Frame";
          if (category === "Half Frame" && order.productId) {
            unmatchedIds.add(order.productId);
            invalidDataFound = true;
          }
          return { ...order, category };
        });

        // Time range filter
        const now = new Date();
        const filteredOrders = finalOrders.filter((order) => {
          if (timeRange === "month") {
            return order.dateOrdered >= subMonths(now, 1);
          }
          if (timeRange === "year") {
            return order.dateOrdered >= subYears(now, 1);
          }
          return true;
        });

        setOrders(filteredOrders);
        setHasInvalidData(invalidDataFound);
        setUnmatchedProductIds(Array.from(unmatchedIds));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load order data");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [db, timeRange]);

  // ---------- Aggregations ----------

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const getCategoryDistribution = () => {
    const categoryCount = {};
    const categoryLatestMonth = {};

    orders.forEach((order) => {
      const category = order.category || "Unknown";
      const date = order.dateOrdered;
      const month =
        timeRange === "month"
          ? format(date, "dd MMM")
          : format(date, "MMM");

      categoryCount[category] = (categoryCount[category] || 0) + 1;

      if (
        !categoryLatestMonth[category] ||
        date > categoryLatestMonth[category].date
      ) {
        categoryLatestMonth[category] = { month, date };
      }
    });

    return Object.entries(categoryCount)
      .map(([name, value]) => ({
        name,
        value,
        month: categoryLatestMonth[name]?.month || "",
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getFinancialTrendsData = () => {
    const trendsData = {};
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    orders.forEach((order, index) => {
      const date = order.dateOrdered;
      const orderIndex = index + 1;
      const month =
        timeRange === "month"
          ? format(date, "dd MMM")
          : monthNames[date.getMonth()];

      if (!trendsData[orderIndex]) {
        trendsData[orderIndex] = {
          orderIndex,
          month,
          dateOrdered: date,
          sales: 0,
        };
      }
      trendsData[orderIndex].sales += order.totalAmount;
    });

    return Object.values(trendsData).sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
  };

  const getCategoryWiseData = () => {
    const categoryData = {};
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    orders.forEach((order, index) => {
      const category = order.category || "Unknown";
      const date = order.dateOrdered;
      const orderIndex = index + 1;

      if (!categoryData[category]) categoryData[category] = {};

      if (!categoryData[category][orderIndex]) {
        categoryData[category][orderIndex] = {
          orderIndex,
          month:
            timeRange === "month"
              ? format(date, "dd MMM")
              : monthNames[date.getMonth()],
          dateOrdered: date,
          sales: 0,
        };
      }
      categoryData[category][orderIndex].sales += order.totalAmount;
    });

    return categoryData;
  };

  const categoryDistribution = getCategoryDistribution();
  const financialTrendsData = getFinancialTrendsData();
  const categoryWiseData = getCategoryWiseData();

  // ---------- UI ----------

  return (
    <div className="sales-page">
      {/* Header */}
      <div className="sales-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Sales Analysis Dashboard</h1>
            <p className="page-subtitle">
              Comprehensive overview of sales performance, revenue trends, and category insights
            </p>
          </div>
          <div className="header-actions">
            <button className="export-button">
              <svg className="export-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Export Report
            </button>
            <div className="date-info">
              <span className="date-label">Last updated:</span>
              <span className="date-value">{format(new Date(), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-container">
        <div className="range-selector">
          <div className="range-label">Time Range:</div>
          <div className="range-buttons">
            {["all", "year", "month"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`range-button ${timeRange === range ? 'active' : ''}`}
              >
                {range === "all"
                  ? "All Time"
                  : range === "year"
                  ? "Last Year"
                  : "Last Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-container">
        {[
          { 
            label: "Total Orders", 
            value: totalOrders,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h2l1 5h13" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="20" r="1.6" fill="currentColor"/>
                <circle cx="18" cy="20" r="1.6" fill="currentColor"/>
              </svg>
            ),
            color: "#3B82F6",
            change: "+12%"
          },
          {
            label: "Total Revenue",
            value: `₹${totalRevenue.toFixed(2)}`,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 6H9a3 3 0 000 6h6a3 3 0 010 6H7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            color: "#10B981",
            change: "+24%"
          },
          {
            label: "Avg Order Value",
            value: `₹${averageOrderValue.toFixed(2)}`,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            color: "#F59E0B",
            change: "+8%"
          },
        ].map((stat, idx) => (
          <div key={stat.label} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
                {stat.icon}
              </div>
              <div className="stat-change" style={{ color: stat.color }}>
                {stat.change}
              </div>
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Category Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Sales by Category</h3>
            <div className="chart-legend">
              <div className="legend-items">
                {categoryDistribution.slice(0, 3).map((cat, idx) => (
                  <div key={cat.name} className="legend-item-small">
                    <span className="legend-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="legend-text-small">{cat.name}</span>
                    <span className="legend-percent">{((cat.value / categoryDistribution.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-container">
            {categoryDistribution.length === 0 ? (
              <div className="empty-chart">
                <p>No data for selected range</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {categoryDistribution.map((_, index) => (
                      <linearGradient
                        key={index}
                        id={`gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            GRADIENT_COLORS[index % GRADIENT_COLORS.length]
                              .start
                          }
                        />
                        <stop
                          offset="100%"
                          stopColor={
                            GRADIENT_COLORS[index % GRADIENT_COLORS.length]
                              .end
                          }
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={`url(#gradient-${index})`}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>

                  label={renderCustomizedLabel}
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Financial Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Financial Trends</h3>
            <div className="trend-indicator">
              <div className="trend-up">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>24% growth</span>
              </div>
            </div>
          </div>
          <div className="chart-container">
            {financialTrendsData.length === 0 ? (
              <div className="empty-chart">
                <p>No data for selected range</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={financialTrendsData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="orderIndex" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3B82F6", stroke: "white", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="performance-section">
        <div className="section-header">
          <h3 className="section-title">Category Performance Details</h3>
          <div className="section-actions">
            <span className="data-count">{Object.keys(categoryWiseData).length} categories</span>
          </div>
        </div>
        
        <div className="category-grid">
          {Object.entries(categoryWiseData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, data], index) => {
              const chartData = Object.values(data).sort(
                (a, b) => a.orderIndex - b.orderIndex
              );
              const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
              const orderCount = chartData.length;
              
              return (
                <div key={category} className="category-card">
                  <div className="category-header">
                    <div className="category-title-section">
                      <div 
                        className="category-color" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <h4 className="category-name">{category}</h4>
                    </div>
                    <div className="category-stats">
                      <div className="category-stat">
                        <span className="stat-number">{orderCount}</span>
                        <span className="stat-label">Orders</span>
                      </div>
                      <div className="category-stat">
                        <span className="stat-number">₹{totalSales.toFixed(0)}</span>
                        <span className="stat-label">Revenue</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="category-chart">
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 20, bottom: 30 }}
                      >
                        {/* Y Axis Label */}
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#6B7280" }}
                          label={{
                            value: "Sales (₹)",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                            style: { textAnchor: "middle", fill: "#6B7280", fontSize: 11 }
                          }}
                        />
                        {/* X Axis Label */}
                        <XAxis
                          dataKey="orderIndex"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#6B7280" }}
                          label={{
                            value: "Order Sequence",
                            position: "insideBottom",
                            offset: -15,
                            style: { textAnchor: "middle", fill: "#6B7280", fontSize: 11 }
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading sales data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h4>Data Loading Error</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && categoryDistribution.every((c) => c.name === "Unknown") && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-content">
            <h4>No Sales Data Available</h4>
            <p>No valid sales data found for the selected time range.</p>
          </div>
        </div>
      )}
    </div>
  );
}