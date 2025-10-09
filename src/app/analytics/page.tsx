"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ClientLayout from "../../components/ClientLayout";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalCollections: number;
  totalItems: number;
  storageUsed: string;
  recentActivity: number;
  collectionDistribution: { name: string; value: number; color: string }[];
  monthlyUploads: { month: string; uploads: number }[];
  activityTrend: { date: string; activity: number }[];
  imageTypes: { type: string; value: number }[];
  topCollections: { id: number; name: string; icon: string; itemCount: number }[];
}

interface FilteredItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<FilteredItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();

    // Refresh data when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAnalyticsData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleDrillDown = async (collectionName: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    const userId = session.user.id;

    // Find collection id by name
    const collection = data?.topCollections.find((c) => c.name === collectionName);
    if (!collection) return;

    const { data: items } = await supabase
      .from("items")
      .select("id, title, description, image_url")
      .eq("user_id", userId)
      .eq("collection_id", collection.id)
      .order("created_at", { ascending: false })
      .limit(10); // Limit to 10 for preview

    setFilteredItems(items || []);
    setSelectedFilter(collectionName);
  };

  const fetchAnalyticsData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    // Fetch total collections
    const { count: totalCollections } = await supabase
      .from("collections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Fetch total items
    const { count: totalItems } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Fetch recent activity (items created in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: recentActivity } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString());

    // Fetch collections with item counts
    const { data: collections } = await supabase
      .from("collections")
      .select("id, name, icon")
      .eq("user_id", userId);

    const collectionDistribution = [];
    if (collections) {
      for (const collection of collections) {
        const { count } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("collection_id", collection.id);
        collectionDistribution.push({
          name: collection.name,
          value: count || 0,
          color: COLORS[collectionDistribution.length % COLORS.length],
        });
      }
    }

    // Fetch monthly uploads
    const { data: items } = await supabase
      .from("items")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const monthlyUploads = [];
    if (items) {
      const monthMap = new Map<string, number>();
      items.forEach((item) => {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
      });
      for (const [month, uploads] of monthMap) {
        monthlyUploads.push({ month, uploads });
      }
      monthlyUploads.sort((a, b) => a.month.localeCompare(b.month));
    }

    // Activity trend (simplified, using created_at as activity)
    const activityTrend = monthlyUploads.map((m) => ({
      date: m.month,
      activity: m.uploads,
    }));

    // Image types - improved detection for all image formats
    const { data: itemsWithImages } = await supabase
      .from("items")
      .select("image_url")
      .eq("user_id", userId)
      .not("image_url", "is", null);

    const imageTypesMap = new Map<string, number>();
    if (itemsWithImages) {
      itemsWithImages.forEach((item) => {
        if (item.image_url) {
          // Remove query parameters and fragments from URL
          const cleanUrl = item.image_url.split('?')[0].split('#')[0];

          // Extract file extension more robustly
          const urlParts = cleanUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          const extension = filename.split('.').pop()?.toUpperCase() || "UNKNOWN";

          // Handle common cases where extension might be missing or incorrect
          let finalExtension = extension;

          // If extension is very long or contains invalid chars, it might not be a real extension
          if (extension.length > 5 || !/^[A-Z0-9]+$/.test(extension)) {
            finalExtension = "UNKNOWN";
          }

          // Map common MIME types to extensions if needed
          // For now, we'll trust the file extension

          imageTypesMap.set(finalExtension, (imageTypesMap.get(finalExtension) || 0) + 1);
        }
      });
    }
    const imageTypes = Array.from(imageTypesMap, ([type, value]) => ({ type, value }));

    // Top collections (by item count) - show all collections
    const topCollections = collectionDistribution
      .sort((a, b) => b.value - a.value)
      .map((dist) => {
        const collection = collections?.find((c) => c.name === dist.name);
        return {
          id: collection?.id || 0,
          name: dist.name,
          icon: collection?.icon || "📁",
          itemCount: dist.value,
        };
      });

    // Storage used (estimate: assume 500KB per image)
    const storageUsed = itemsWithImages
      ? `${Math.round((itemsWithImages.length * 500) / 1024)} MB`
      : "0 MB";

    setData({
      totalCollections: totalCollections || 0,
      totalItems: totalItems || 0,
      storageUsed,
      recentActivity: recentActivity || 0,
      collectionDistribution,
      monthlyUploads,
      activityTrend,
      imageTypes,
      topCollections,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </ClientLayout>
    );
  }

  if (!data) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Failed to load analytics data.</div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="analytics-page">
        <div className="dashboard-headersss-wrapper">
          <div>
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-description">
              Insights and trends for your collections.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="overview-card p-6">
            <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="text-3xl text-gray-500 mb-2">📁</div>
              <p className="text-lg font-semibold text-gray-600 mb-3">Total Collections</p>
              <h3 className="text-4xl font-bold text-gray-900">{data.totalCollections}</h3>
            </div>
          </div>
          <div className="overview-card p-6">
            <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="text-3xl text-gray-500 mb-2">🖼️</div>
              <p className="text-lg font-semibold text-gray-600 mb-3">Total Items</p>
              <h3 className="text-4xl font-bold text-gray-900">{data.totalItems}</h3>
            </div>
          </div>
          <div className="overview-card p-6">
            <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="text-3xl text-gray-500 mb-2">💾</div>
              <p className="text-lg font-semibold text-gray-600 mb-3">Storage Used</p>
              <h3 className="text-4xl font-bold text-gray-900">{data.storageUsed}</h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="chart-card p-6">
            <h3 className="text-xl items-center justify-center font-semibold mb-4 text-gray-900">Items per Collection</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.collectionDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8b5cf6"
                  dataKey="value"
                  onClick={(data) => handleDrillDown(data.name)}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                >
                  {data.collectionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="chart-card p-6">
            <h3 className="text-xl items-center justify-center font-semibold mb-4 text-gray-900">Monthly Uploads</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.monthlyUploads}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="uploads" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Collections */}
        <div className="top-collections bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">All Collections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.topCollections.map((collection) => (
              <div
                key={collection.id}
                className="collection-card p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDrillDown(collection.name)}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{collection.icon}</span>
                  <h4 className="font-medium">{collection.name}</h4>
                </div>
                <div className="text-sm text-gray-600">
                  {collection.itemCount} items
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${data.totalItems > 0 ? Math.min((collection.itemCount / data.totalItems) * 100, 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtered Items Drill-down */}
        {selectedFilter && (
          <div className="filtered-items bg-white p-6 rounded-lg shadow-lg mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Items in {selectedFilter}</h3>
              <button
                onClick={() => {
                  setSelectedFilter(null);
                  setFilteredItems([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="item-card p-4 border rounded-lg">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
            {filteredItems.length === 0 && <p>No items found.</p>}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}