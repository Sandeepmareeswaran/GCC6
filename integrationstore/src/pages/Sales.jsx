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
import styles from "./Sales.module.css";

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
      <div className="bg-white p-3 rounded-md shadow-md border border-gray-200 text-sm">
        {label && <p className="font-semibold text-gray-800 mb-1">{label}</p>}
        {data?.month && (
          <p className="text-xs text-gray-500 mb-1">Month: {data.month}</p>
        )}
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || "#111827" }}>
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
  <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
    {payload?.map((entry, index) => (
      <div key={index} className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-gray-700">{entry.value}</span>
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
    <div className={`${styles.page} px-6 py-8 bg-gray-50 minHeight-screen`}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={`text-3xl font-bold mb-0 text-gray-800 ${styles.title}`}>
            Sales Analysis
          </h1>
          <p className={styles.subtitle}>Overview of orders, revenue and category performance.</p>
        </div>
        <div className={styles.toolbar}>
          <button className={styles.exportBtn} title="Export summary">Export CSV</button>
        </div>
      </div>

      

      {/* Summary cards */}
      <div className={`${styles.statsGrid} mb-8`}>
        {[
          { label: "Total Orders", value: totalOrders },
          {
            label: "Total Revenue",
            value: `₹${totalRevenue.toFixed(2)}`,
          },
          {
            label: "Average Order Value",
            value: `₹${averageOrderValue.toFixed(2)}`,
          },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className={`bg-white rounded-lg shadow-sm border border-gray-100 p-5 ${styles.card} ${styles.statCard}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
              <div
                className={styles.statIcon}
                style={{ background: COLORS[idx % COLORS.length] }}
                aria-hidden
              >
                {idx === 0 ? (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 3h2l1 5h13" stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="10" cy="20" r="1.6" fill="rgba(255,255,255,0.95)"/>
                    <circle cx="18" cy="20" r="1.6" fill="rgba(255,255,255,0.95)"/>
                  </svg>
                ) : idx === 1 ? (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 3v18" stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 6H9a3 3 0 000 6h6a3 3 0 010 6H7" stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 17l6-6 4 4 8-8" stroke="rgba(255,255,255,0.95)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p className={`text-xs tracking-wide uppercase ${styles.statLabel}`}>
                  {stat.label}
                </p>
                <p className={`${styles.statValue} mt-2`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">
          Loading order data...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : categoryDistribution.every((c) => c.name === "Unknown") ? (
        <div className="text-center py-12 text-red-500">
          No valid category data found. Check product IDs and collections.
        </div>
      ) : (
        <>
          {/* Time range selector */}
          <div className="flex justify-center mb-8">
            <div className={`inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm ${styles.rangeGroup}`}>
              {["all", "year", "month"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`${styles.rangeButton} ${styles.rangeBtn} ${
                    timeRange === range
                      ? `bg-blue-600 text-white ${styles.activeRange}`
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
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

          {/* Category distribution Pie */}
          <div className={`bg-white rounded-lg shadow-sm p-5 mb-8 ${styles.card}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Sales by Category
            </h2>
            {categoryDistribution.length === 0 ? (
              <p className="text-center text-gray-600">
                No data for selected range.
              </p>
            ) : (
              <div className={`${styles.chartWrap} h-80`}>
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
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={110}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={`url(#gradient-${index})`}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Financial trends line chart */}
          <div className={`bg-white rounded-lg shadow-sm p-5 mb-8 ${styles.card}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Financial Trends by Order
            </h2>
            {financialTrendsData.length === 0 ? (
              <p className="text-center text-gray-600">
                No data for selected range.
              </p>
            ) : (
              <div className={`${styles.chartWrap} h-80`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={financialTrendsData}
                    margin={{ top: 10, right: 24, left: 16, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="orderIndex"
                      tick={<CustomTick />}
                      height={70}
                    />
                    <YAxis
                      label={{
                        value: "Sales (₹)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#4B5563",
                        fontSize: 12,
                      }}
                      tick={{ fontSize: 11, fill: "#4B5563" }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Legend content={<CustomLegend />} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="Sales"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: "#3B82F6",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category-wise performance */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Category Performance
            </h2>
            {Object.keys(categoryWiseData).length === 0 ? (
              <p className="text-center text-gray-600">
                No data for selected range.
              </p>
            ) : (
              Object.entries(categoryWiseData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, data], index) => {
                  const chartData = Object.values(data).sort(
                    (a, b) => a.orderIndex - b.orderIndex
                  );
                  return (
                    <div
                      key={category}
                      className={`bg-white rounded-lg shadow-sm p-5 ${styles.card}`}
                    >
                      <h3 className="text-lg font-semibold mb-3 text-gray-700">
                        {category}
                      </h3>
                      <div className={`${styles.chartWrap} h-72`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{
                              top: 10,
                              right: 24,
                              left: 16,
                              bottom: 60,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="orderIndex"
                              tick={<CustomTick />}
                              height={70}
                            />
                            <YAxis
                              label={{
                                value: "Sales (₹)",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#4B5563",
                                fontSize: 12,
                              }}
                              tick={{ fontSize: 11, fill: "#4B5563" }}
                            />
                            <Tooltip
                              content={<CustomTooltip />}
                              cursor={false}
                            />
                            <Legend content={<CustomLegend />} />
                            <Line
                              type="monotone"
                              dataKey="sales"
                              name="Sales"
                              stroke={COLORS[index % COLORS.length]}
                              strokeWidth={3}
                              dot={false}
                              activeDot={{
                                r: 6,
                                fill: COLORS[index % COLORS.length],
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </>
      )}
    </div>
  );
}
