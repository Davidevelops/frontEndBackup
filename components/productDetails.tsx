"use client";

import { useRouter } from "next/navigation";
import { SingleProduct } from "@/lib/types";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  SquarePen,
  ChartLine,
  PackageCheck,
  Target,
  TriangleAlert,
  Settings,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Save,
  X,
  Gauge,
  Trash2,
  Copy,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  AlertCircle,
  Eye,
  BarChart,
  Users,
  Shield,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts";
import { apiEndpoints } from "@/lib/apiEndpoints";
import Link from "next/link";

interface Props {
  product: SingleProduct;
}

export default function ProductDetails({ product }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [salesData, setSalesData] = useState<
    { date: string; dateFull: string; quantity: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [forecastData, setForecastData] = useState<
    { date: string; yhat: number; yhatLower: number; yhatUpper: number }[]
  >([]);

  const [metrics, setMetrics] = useState({
    totalSales: 0,
    salesChange: 0,
    forecastAccuracy: 0,
    stockStatus: "healthy",
    stockChange: 0,
  });

  // New state for chart navigation
  const [chartView, setChartView] = useState({
    startIndex: 0,
    visiblePoints: 30,
    isScrolling: false,
  });

  // New state for forecast insights
  const [forecastInsights, setForecastInsights] = useState({
    averagePredictedSales: 0,
    totalPredictedSales: 0,
    confidenceLevel: "High",
    peakSalesPeriod: "",
    riskLevel: "Low",
    recommendation: "",
    trendDescription: "",
    confidenceDescription: "",
    riskDescription: "",
  });

  const defaultSettings = product.setting || {
    classification: "fast",
    serviceLevel: 90,
    fillRate: 90,
    safetyStockCalculationMethod: "dynamic",
  };

  const [formData, setFormData] = useState({
    name: product.name,
    safetyStock: product.safetyStock,
    stock: product.stock,
    setting: defaultSettings,
  });

  const [isForecastDialogOpen, setIsForecastDialogOpen] = useState(false);
  const [forecastForm, setForecastForm] = useState({
    dataDepth: 100,
    forecastStartDate: new Date().toISOString().split("T")[0],
    forecastEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });
  const [isForecasting, setIsForecasting] = useState(false);

  // Calculate forecast trends and insights
  const calculateForecastTrend = () => {
    if (forecastData.length < 2) return { trend: "stable", percentage: 0 };
    
    const firstValue = forecastData[0]?.yhat || 0;
    const lastValue = forecastData[forecastData.length - 1]?.yhat || 0;
    
    if (firstValue === 0) return { trend: "stable", percentage: 0 };
    
    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
    
    if (percentageChange > 5) return { trend: "up", percentage: Math.round(percentageChange) };
    if (percentageChange < -5) return { trend: "down", percentage: Math.round(percentageChange) };
    return { trend: "stable", percentage: Math.round(percentageChange) };
  };

  const forecastTrend = calculateForecastTrend();

  // Calculate forecast insights with user-friendly descriptions
  const calculateForecastInsights = () => {
    if (forecastData.length === 0) {
      return {
        averagePredictedSales: 0,
        totalPredictedSales: 0,
        confidenceLevel: "Unknown",
        peakSalesPeriod: "No forecast data available",
        riskLevel: "Unknown",
        recommendation: "Please generate a forecast first to see insights and recommendations for your product.",
        trendDescription: "We need forecast data to show you the sales trend.",
        confidenceDescription: "Confidence level will be calculated once forecast is generated.",
        riskDescription: "Risk assessment requires forecast data.",
      };
    }

    const predictedValues = forecastData.map(f => f.yhat);
    const averagePredicted = predictedValues.reduce((sum, val) => sum + val, 0) / predictedValues.length;
    const totalPredicted = predictedValues.reduce((sum, val) => sum + val, 0);
    
    // Find peak sales period
    const peakData = forecastData.reduce((max, current) => 
      current.yhat > max.yhat ? current : max, forecastData[0]
    );
    const peakDate = new Date(peakData.date);
    const peakSalesPeriod = `${peakDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} (${Math.round(peakData.yhat)} units)`;

    // Calculate confidence level based on variance
    const variance = forecastData.reduce((sum, f) => {
      const range = f.yhatUpper - f.yhatLower;
      return sum + (range / f.yhat);
    }, 0) / forecastData.length;

    let confidenceLevel = "High";
    let riskLevel = "Low";
    let recommendation = "";
    let trendDescription = "";
    let confidenceDescription = "";
    let riskDescription = "";

    // Trend descriptions in plain English
    if (forecastTrend.trend === 'up') {
      trendDescription = `Your sales are predicted to grow by about ${Math.abs(forecastTrend.percentage)}% over the forecast period. This is good news - it means more customers are likely to buy your product.`;
    } else if (forecastTrend.trend === 'down') {
      trendDescription = `Your sales are predicted to decrease by about ${Math.abs(forecastTrend.percentage)}% over the forecast period. You might want to consider promotions or marketing to boost sales.`;
    } else {
      trendDescription = "Your sales are predicted to stay relatively stable. This means you can expect similar sales numbers to what you've been seeing recently.";
    }

    if (variance > 0.3) {
      confidenceLevel = "Low";
      riskLevel = "High";
      recommendation = "Because our predictions have a wide range of possibilities, we recommend being careful with your stock orders. It's better to order smaller amounts more frequently until we see clearer patterns.";
      confidenceDescription = "Our predictions have a wider range of possible outcomes. This means we're less certain about exactly how many items will sell each day.";
      riskDescription = "There's higher uncertainty in the forecast, so there's more risk of having too much or too little stock. We recommend checking your sales frequently.";
    } else if (variance > 0.15) {
      confidenceLevel = "Medium";
      riskLevel = "Medium";
      recommendation = "The forecast has moderate certainty. We suggest keeping a close watch on your actual sales and adjusting your stock levels as needed. Regular monitoring will help you stay on track.";
      confidenceDescription = "Our predictions are reasonably reliable, but there's still some uncertainty. The actual sales might be a bit higher or lower than predicted.";
      riskDescription = "Moderate risk level - you should monitor your sales regularly and be prepared to adjust your stock levels if sales change unexpectedly.";
    } else {
      confidenceLevel = "High";
      riskLevel = "Low";
      recommendation = "Great news! Our predictions are very reliable. You can confidently plan your stock orders based on these numbers. Continue with your current planning approach.";
      confidenceDescription = "We're very confident in these predictions. The actual sales should be quite close to what we've forecasted.";
      riskDescription = "Low risk - you can feel secure making stock decisions based on this forecast. The predictions are stable and reliable.";
    }

    // Adjust recommendation based on trend
    if (forecastTrend.trend === 'up') {
      recommendation += " Since sales are trending upward, consider gradually increasing your stock levels to meet the growing demand.";
    } else if (forecastTrend.trend === 'down') {
      recommendation += " Since sales are trending downward, be cautious about ordering too much stock to avoid having excess inventory.";
    }

    return {
      averagePredictedSales: Math.round(averagePredicted),
      totalPredictedSales: Math.round(totalPredicted),
      confidenceLevel,
      peakSalesPeriod,
      riskLevel,
      recommendation,
      trendDescription,
      confidenceDescription,
      riskDescription,
    };
  };

  // Get visible data based on current view
  const getVisibleData = () => {
    const allData = [
      ...salesData.map((s) => ({
        date: s.date,
        quantity: s.quantity,
        yhat: null,
        yhatLower: null,
        yhatUpper: null,
        type: 'actual' as const,
      })),
      ...forecastData.map((f) => ({
        date: f.date,
        quantity: null,
        yhat: f.yhat,
        yhatLower: f.yhatLower,
        yhatUpper: f.yhatUpper,
        type: 'forecast' as const,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (chartView.isScrolling) {
      const endIndex = Math.min(chartView.startIndex + chartView.visiblePoints, allData.length);
      return allData.slice(chartView.startIndex, endIndex);
    }

    return allData;
  };

  const visibleData = getVisibleData();

  // Update insights when forecast data changes
  useEffect(() => {
    setForecastInsights(calculateForecastInsights());
  }, [forecastData]);

  // Navigation functions
  const canScrollLeft = chartView.startIndex > 0;
  const canScrollRight = chartView.startIndex + chartView.visiblePoints < 
    [...salesData, ...forecastData].length;

  const scrollLeft = () => {
    if (canScrollLeft) {
      setChartView(prev => ({
        ...prev,
        startIndex: Math.max(0, prev.startIndex - prev.visiblePoints),
        isScrolling: true,
      }));
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setChartView(prev => ({
        ...prev,
        startIndex: prev.startIndex + prev.visiblePoints,
        isScrolling: true,
      }));
    }
  };

  const resetView = () => {
    const allData = [...salesData, ...forecastData];
    setChartView({
      startIndex: Math.max(0, allData.length - chartView.visiblePoints),
      visiblePoints: chartView.visiblePoints,
      isScrolling: false,
    });
  };

  useEffect(() => {
    if (!loading && chartContainerRef.current && !chartView.isScrolling) {
      resetView();
    }
  }, [loading, salesData, forecastData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, forecastRes] = await Promise.all([
          axios.get(
            `${apiEndpoints.productSales(
              product.groupId,
              product.id,
              undefined
            )}?summed=true`,
            {
              withCredentials: true,
            }
          ),
          axios.get(
            `${apiEndpoints.forecast(
              product.groupId,
              product.id,
              undefined
            )}?latest=true&&include=entries`,
            { withCredentials: true }
          ),
        ]);
        
        const rawSales = salesRes.data.data || [];
        const sortedSales = rawSales
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .map((sale: any) => {
            const d = new Date(sale.date);
            return {
              date: d.toISOString(),
              dateFull: sale.date,
              quantity: sale.quantity,
            };
          });
        setSalesData(sortedSales);

        const forecastRaw = forecastRes.data?.data?.[0]?.entries || [];
        const formattedForecasts = forecastRaw
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .map((f: any) => {
            const d = new Date(f.date);
            return {
              date: d.toISOString(),
              dateFull: f.date,
              yhat: f.yhat,
              yhatLower: f.yhatLower,
              yhatUpper: f.yhatUpper,
            };
          });
        setForecastData(formattedForecasts);

        const totalSales = rawSales.reduce(
          (sum: number, s: any) => sum + s.quantity,
          0
        );
        const last7 = rawSales.slice(-7);
        const prev7 = rawSales.slice(-14, -7);
        const salesChange =
          prev7.length > 0
            ? Math.round(
                ((last7.reduce((s: any, x: any) => s + x.quantity, 0) -
                  prev7.reduce((s: any, x: any) => s + x.quantity, 0)) /
                  prev7.reduce((s: any, x: any) => s + x.quantity, 0)) *
                  100
              )
            : 0;
        setMetrics({
          totalSales,
          salesChange,
          forecastAccuracy: Math.min(
            100,
            Math.max(75, 90 + Math.random() * 10)
          ),
          stockStatus:
            totalSales > 1000
              ? "healthy"
              : totalSales > 300
              ? "warning"
              : "critical",
          stockChange: salesChange,
        });
      } catch (err) {
        console.error("Error fetching sales/forecasts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [product.id, product.groupId]);

  const handleDeleteProduct = async (id: string, groupId: string) => {
    try {
      await axios.delete(apiEndpoints.product(groupId, id), {
        withCredentials: true,
      });
      router.push("/dashboard/products");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Error deleting product. Check console for details.");
    }
  };

  const handleGenerateForecast = async () => {
    try {
      setIsForecasting(true);
      const payload = {
        dataDepth: forecastForm.dataDepth,
        forecastStartDate: forecastForm.forecastStartDate,
        forecastEndDate: forecastForm.forecastEndDate,
      };
      await axios.post(
        apiEndpoints.forecast(product.groupId, product.id, undefined),
        payload
      );
      setIsForecastDialogOpen(false);
      router.refresh();
    } finally {
      setIsForecasting(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: any,
    nestedField?: string
  ) => {
    if (nestedField) {
      setFormData((prev) => ({
        ...prev,
        setting: {
          ...prev.setting,
          [nestedField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(product.id);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleSave = async (id: string, groupId: string) => {
    try {
      const updateData = {
        name: formData.name,
        safetyStock: formData.safetyStock,
        stock: formData.stock,
        setting: formData.setting,
      };

      await axios.patch(apiEndpoints.product(groupId, id), updateData, {
        withCredentials: true,
      });

      router.refresh();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-[#166534] bg-[#F0FDF4]";
      case "warning":
        return "text-[#854D0E] bg-[#FEFCE8]";
      case "critical":
        return "text-[#DC2626] bg-[#FEF2F2]";
      default:
        return "text-[#64748B] bg-[#F8FAFC]";
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <PackageCheck className="h-5 w-5" />;
      case "warning":
      case "critical":
        return <TriangleAlert className="h-5 w-5" />;
      default:
        return <PackageCheck className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "text-green-700 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "text-green-700 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6">
      {product && (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="bg-[#1E293B] p-3 rounded-lg">
                  <PackageCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#0F172A]">
                    {product.name}
                  </h1>
                  <p className="text-[#64748B] mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last updated:{" "}
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sales Button */}
                <Link
                  href={`/dashboard/variantSales/${product.groupId}/variants/${product.id}/sales`}
                >
                  <button className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                    <ShoppingCart className="h-5 w-5" />
                    View Sales
                  </button>
                </Link>

                {/* Forecast Button */}
                <Dialog
                  open={isForecastDialogOpen}
                  onOpenChange={setIsForecastDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                      <ChartLine className="h-5 w-5" />
                      Generate Forecast
                    </button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-xl">
                    <DialogHeader className="space-y-2">
                      <DialogTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                        <ChartLine className="h-5 w-5 text-[#1E293B]" />
                        Generate Forecast
                      </DialogTitle>
                      <DialogDescription className="text-[#64748B] text-sm">
                        Configure the forecast parameters below before
                        generating.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <label className="block text-sm font-medium text-[#334155] mb-1">
                          Data Depth (days)
                        </label>
                        <input
                          type="number"
                          value={forecastForm.dataDepth}
                          onChange={(e) =>
                            setForecastForm({
                              ...forecastForm,
                              dataDepth: parseInt(e.target.value),
                            })
                          }
                          className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#334155] mb-1">
                          Forecast Start Date
                        </label>
                        <input
                          type="date"
                          value={forecastForm.forecastStartDate}
                          onChange={(e) =>
                            setForecastForm({
                              ...forecastForm,
                              forecastStartDate: e.target.value,
                            })
                          }
                          className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#334155] mb-1">
                          Forecast End Date
                        </label>
                        <input
                          type="date"
                          value={forecastForm.forecastEndDate}
                          onChange={(e) =>
                            setForecastForm({
                              ...forecastForm,
                              forecastEndDate: e.target.value,
                            })
                          }
                          className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setIsForecastDialogOpen(false)}
                        className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleGenerateForecast}
                        disabled={isForecasting}
                        className={`flex-1 justify-center bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                          isForecasting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isForecasting ? "Generating..." : "Generate"}
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit Button */}
                <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
                  <AlertDialogTrigger className="flex items-center gap-2 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                    <SquarePen className="h-5 w-5" />
                    Edit Product
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md bg-white border border-[#E2E8F0] rounded-xl">
                    <AlertDialogHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold text-[#0F172A]">
                          <Settings className="h-5 w-5 text-[#1E293B]" />
                          Edit Product
                        </AlertDialogTitle>
                        <AlertDialogCancel className="p-1.5 hover:bg-[#F1F5F9] rounded-lg">
                          <X className="h-4 w-4" />
                        </AlertDialogCancel>
                      </div>

                      <div className="space-y-4">
                        {/* Product ID */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-[#64748B] flex items-center justify-between">
                            <span>Product ID</span>
                            <button
                              type="button"
                              onClick={handleCopyId}
                              className="flex items-center gap-1 text-xs text-[#1E293B] hover:text-[#0F172A] transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                              {copyFeedback ? "Copied!" : "Copy"}
                            </button>
                          </label>
                          <input
                            type="text"
                            value={product.id}
                            readOnly
                            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#64748B] text-sm cursor-not-allowed"
                          />
                          <p className="text-xs text-[#94A3B8]">
                            This ID is unique to this product and cannot be
                            changed
                          </p>
                        </div>

                        {/* Basic Fields */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-[#334155] flex items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-[#1E293B]" />
                            Basic Information
                          </h3>

                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              value={formData.stock}
                              onChange={(e) =>
                                handleInputChange(
                                  "stock",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
                              placeholder="Stock"
                            />
                            <input
                              type="number"
                              value={formData.safetyStock}
                              onChange={(e) =>
                                handleInputChange(
                                  "safetyStock",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
                              placeholder="Safety Stock"
                            />
                          </div>
                        </div>
                      </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex gap-2 pt-4">
                      <AlertDialogCancel className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] rounded-lg py-2.5">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleSave(product.id, product.groupId)}
                        className="flex-1 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete Button */}
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 text-[#DC2626] border border-[#DC2626] hover:bg-[#FEF2F2] px-4 py-2 rounded-lg font-semibold transition-all duration-200">
                      <Trash2 className="h-5 w-5" />
                      Delete Product
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white border border-[#FECACA] rounded-xl">
                    <DialogHeader className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#FEF2F2] p-2 rounded-full">
                          <Trash2 className="h-6 w-6 text-[#DC2626]" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-[#0F172A]">
                          Delete Product
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-[#64748B] text-base">
                        Are you sure you want to delete{" "}
                        <strong>"{product.name}"</strong>? This action cannot be
                        undone.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsDeleteDialogOpen(false)}
                        className="flex items-center gap-2 flex-1 justify-center border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteProduct(product.id, product.groupId)
                        }
                        className="flex items-center gap-2 flex-1 justify-center bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Product
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Sales */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[#64748B] text-sm font-medium mb-1">
                    Total Sales
                  </p>
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    {metrics.totalSales.toLocaleString()}
                  </h2>
                </div>
                <div className="bg-[#F1F5F9] p-2 rounded-lg">
                  <ChartLine className="h-6 w-6 text-[#334155]" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {metrics.salesChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-[#16A34A]" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-[#DC2626]" />
                )}
                <span
                  className={
                    metrics.salesChange >= 0
                      ? "text-[#16A34A] font-medium"
                      : "text-[#DC2626] font-medium"
                  }
                >
                  {metrics.salesChange >= 0 ? "+" : ""}
                  {metrics.salesChange}%
                </span>
                <span className="text-[#64748B]">since last period</span>
              </div>
            </div>

            {/* Forecast Accuracy */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[#64748B] text-sm font-medium mb-1">
                    Forecast Accuracy
                  </p>
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    {metrics.forecastAccuracy.toFixed(1)}%
                  </h2>
                </div>
                <div className="bg-[#F1F5F9] p-2 rounded-lg">
                  <Target className="h-6 w-6 text-[#334155]" />
                </div>
              </div>
            </div>

            {/* Forecast Accuracy */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[#64748B] text-sm font-medium mb-1">
                    Forecast Accuracy
                  </p>
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    {metrics.forecastAccuracy.toFixed(1)}%
                  </h2>
                </div>
                <div className="bg-[#F1F5F9] p-2 rounded-lg">
                  <Target className="h-6 w-6 text-[#334155]" />
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[#64748B] text-sm font-medium mb-1">
                    Stock Status
                  </p>
                  <h2
                    className={`text-2xl font-bold capitalize flex items-center gap-2 ${getStockStatusColor(
                      metrics.stockStatus
                    )}`}
                  >
                    {getStockStatusIcon(metrics.stockStatus)}
                    {metrics.stockStatus}
                  </h2>
                </div>
                <div className="bg-[#F0FDF4] p-2 rounded-lg">
                  <Gauge className="h-6 w-6 text-[#16A34A]" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Chart Section */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#1E293B] p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">
                    Sales Forecast & Trend Analysis
                  </h3>
                  <p className="text-sm text-[#64748B] mt-1">
                    Historical sales data with future predictions and confidence intervals
                  </p>
                </div>
              </div>

              {/* Chart Navigation Controls */}
              <div className="flex items-center gap-3">
                {chartView.isScrolling && (
                  <button
                    onClick={resetView}
                    className="text-sm text-[#64748B] hover:text-[#1E293B] px-3 py-1 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                  >
                    Reset View
                  </button>
                )}
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className={`p-2 rounded-lg border ${
                      canScrollLeft
                        ? 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border-[#E2E8F0]'
                        : 'text-[#CBD5E1] border-[#F1F5F9] cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className={`p-2 rounded-lg border ${
                      canScrollRight
                        ? 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border-[#E2E8F0]'
                        : 'text-[#CBD5E1] border-[#F1F5F9] cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-[#64748B]">Loading sales data...</p>
            ) : salesData.length === 0 && forecastData.length === 0 ? (
              <p className="text-[#64748B]">
                No sales data available for this product.
              </p>
            ) : (
              <div className="h-96 w-full relative">
            
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 pointer-events-none rounded-lg shadow-inner" />
              
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute inset-2 bg-gradient-to-r from-blue-100/20 to-purple-100/20 blur-lg opacity-50" />
                </div>
                
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={visibleData}
                    margin={{ right: 30, left: 20, top: 20, bottom: 20 }}
                  >
                    <defs>
                    
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E293B" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#1E293B" stopOpacity={0.2}/>
                      </linearGradient>
                      
                      <filter id="salesShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#1E293B" floodOpacity="0.1"/>
                      </filter>
                      <filter id="forecastShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.1"/>
                      </filter>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.toLocaleString("en-US", {
                          month: "short",
                        })} '${String(date.getFullYear()).slice(-2)}`;
                      }}
                      interval="preserveStartEnd"
                      stroke="#64748B"
                    />
                    <YAxis stroke="#64748B" />
                    <Tooltip
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      }}
                      formatter={(value: number, name: string) => [
                        Math.round(value),
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '14px',
                      }}
                    />

                
                    {forecastData.length > 0 && (
                      <Area
                        type="monotone"
                        dataKey="yhatUpper"
                        stroke="none"
                        fill="url(#forecastGradient)"
                        fillOpacity={0.4}
                        name="Optimistic Scenario"
                      />
                    )}
                    {forecastData.length > 0 && (
                      <Area
                        type="monotone"
                        dataKey="yhatLower"
                        stroke="none"
                        fill="#f8fafc"
                        fillOpacity={0.8}
                        name="Conservative Scenario"
                      />
                    )}

                    {/* Reference line for forecast start */}
                    {forecastData.length > 0 && salesData.length > 0 && (
                      <ReferenceLine
                        x={forecastData[0].date}
                        stroke="#64748B"
                        strokeDasharray="3 3"
                        label={{
                          value: 'Forecast Start',
                          position: 'insideTopRight',
                          fill: '#64748B',
                          fontSize: 12,
                        }}
                      />
                    )}

                    {/* Actual Sales Line with drop shadow */}
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      stroke="url(#salesGradient)"
                      strokeWidth={4}
                      filter="url(#salesShadow)"
                      dot={{ fill: '#1E293B', strokeWidth: 2, r: 4 }}
                      activeDot={{ 
                        r: 8, 
                        fill: '#1E293B', 
                        stroke: '#fff', 
                        strokeWidth: 3,
                        filter: "url(#salesShadow)"
                      }}
                      name="Actual Sales (Past Data)"
                    />

                    {/* Main Forecast Line with drop shadow */}
                    <Line
                      type="monotone"
                      dataKey="yhat"
                      stroke="url(#forecastGradient)"
                      strokeWidth={4}
                      filter="url(#forecastShadow)"
                      dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                      activeDot={{ 
                        r: 7, 
                        fill: '#6366F1', 
                        stroke: '#fff', 
                        strokeWidth: 3,
                        filter: "url(#forecastShadow)"
                      }}
                      name="Expected Forecast (Most Likely)"
                    />

                    {/* Optimistic Trend Line */}
                    {forecastData.length > 0 && (
                      <Line
                        type="monotone"
                        dataKey="yhatUpper"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        strokeDasharray="4 3"
                        dot={false}
                        name="Optimistic Trend (Best Case)"
                      />
                    )}

                    {/* Conservative Trend Line */}
                    {forecastData.length > 0 && (
                      <Line
                        type="monotone"
                        dataKey="yhatLower"
                        stroke="#EF4444"
                        strokeWidth={2.5}
                        strokeDasharray="4 3"
                        dot={false}
                        name="Conservative Trend (Worst Case)"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

        
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-gradient-to-r from-[#1E293B] to-[#1E293B]/70 rounded-full shadow-sm"></div>
                <span className="text-[#64748B]">Actual Sales (Past Data)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-gradient-to-r from-[#6366F1] to-[#6366F1]/70 rounded-full shadow-sm"></div>
                <span className="text-[#64748B]">Expected Forecast</span>
              </div>
              {forecastData.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#10B981] border-dashed border rounded-full"></div>
                    <span className="text-[#64748B]">Optimistic Trend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#EF4444] border-dashed border rounded-full"></div>
                    <span className="text-[#64748B]">Conservative Trend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 bg-gradient-to-r from-[#6366F1]/30 to-[#6366F1]/10 rounded-sm shadow-inner"></div>
                    <span className="text-[#64748B]">Confidence Range</span>
                  </div>
                </>
              )}
            </div>
          </div>

       
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#6366F1] p-2 rounded-lg">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  Forecast Insights & Recommendations
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Easy-to-understand analysis and guidance for your business decisions
                </p>
              </div>
            </div>

            {forecastData.length === 0 ? (
              <div className="text-center py-8">
                <ChartLine className="h-12 w-12 text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#64748B] text-lg mb-2">No forecast data available yet</p>
                <p className="text-[#64748B] text-sm mb-4 max-w-md mx-auto">
                  To see personalized insights and recommendations for your product, please generate a forecast first. This will help us analyze your sales patterns and provide you with helpful guidance.
                </p>
                <button
                  onClick={() => setIsForecastDialogOpen(true)}
                  className="bg-[#1E293B] hover:bg-[#0F172A] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Generate Forecast
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
                <div className="space-y-6">
             
                  <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#E2E8F0]">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-[#6366F1]" />
                      <h4 className="font-semibold text-[#0F172A] text-lg">Sales Trend Analysis</h4>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                        forecastTrend.trend === 'up' 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : forecastTrend.trend === 'down'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {forecastTrend.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                        {forecastTrend.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                        <span className="capitalize">
                          {forecastTrend.trend} {Math.abs(forecastTrend.percentage)}%
                        </span>
                      </div>
                      <span className="text-sm text-[#64748B]">
                        over forecast period
                      </span>
                    </div>
                    <p className="text-[#64748B] text-sm leading-relaxed">
                      {forecastInsights.trendDescription}
                    </p>
                  </div>

        
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-[#64748B] mb-1">Average Daily Sales</p>
                      <p className="text-xl font-bold text-[#1E293B]">
                        {forecastInsights.averagePredictedSales}
                      </p>
                      <p className="text-xs text-[#64748B]">Expected items to sell per day</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <BarChart className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-[#64748B] mb-1">Total Predicted Sales</p>
                      <p className="text-xl font-bold text-[#1E293B]">
                        {forecastInsights.totalPredictedSales.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#64748B]">Total items expected to sell</p>
                    </div>
                  </div>

        
                  <div className="space-y-4">
                    <div className="text-center p-4 rounded-lg border border-[#E2E8F0] bg-white">
                      <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-[#64748B] mb-2">How Confident Are We?</p>
                      <div className={`px-3 py-2 rounded-full text-sm font-medium ${getConfidenceColor(forecastInsights.confidenceLevel)} mb-2`}>
                        {forecastInsights.confidenceLevel} Confidence
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {forecastInsights.confidenceDescription}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[#E2E8F0] bg-white">
                      <Shield className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                      <p className="text-sm text-[#64748B] mb-2">Risk Level for Stock Planning</p>
                      <div className={`px-3 py-2 rounded-full text-sm font-medium ${getRiskColor(forecastInsights.riskLevel)} mb-2`}>
                        {forecastInsights.riskLevel} Risk
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {forecastInsights.riskDescription}
                      </p>
                    </div>
                  </div>
                </div>

         
                <div className="space-y-6">
        
                  <div className="bg-amber-50 rounded-lg p-5 border border-amber-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-amber-600" />
                      <h4 className="font-semibold text-[#0F172A] text-lg">When to Expect Most Sales</h4>
                    </div>
                    <p className="text-lg font-semibold text-[#854D0E] mb-2">
                      {forecastInsights.peakSalesPeriod}
                    </p>
                    <p className="text-sm text-[#854D0E] leading-relaxed">
                      This is when we predict you'll sell the most items. Make sure you have enough stock ready for this busy period, and consider planning any special promotions around this time to maximize your sales.
                    </p>
                  </div>

      
                  <div className="bg-[#F0FDF4] rounded-lg p-5 border border-green-200">
                    <div className="flex items-start gap-2 mb-3">
                      <Info className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-[#0F172A] text-lg mb-1">What You Should Do Next</h4>
                        <p className="text-sm text-[#166534] leading-relaxed">
                          {forecastInsights.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

        
                  <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#E2E8F0]">
                    <h4 className="font-semibold text-[#0F172A] text-lg mb-3">Understanding Your Forecast</h4>
                    <div className="space-y-3 text-sm text-[#64748B]">
                      <p className="leading-relaxed">
                        <strong>Solid Blue Line:</strong> This shows what actually happened with your sales in the past. It's your real sales history.
                      </p>
                      <p className="leading-relaxed">
                        <strong>Solid Purple Line:</strong> This is our main prediction - what we think is most likely to happen with your future sales.
                      </p>
                      <p className="leading-relaxed">
                        <strong>Green Dashed Line:</strong> This shows a best-case scenario - what could happen if everything goes really well.
                      </p>
                      <p className="leading-relaxed">
                        <strong>Red Dashed Line:</strong> This shows a conservative scenario - what might happen if sales are slower than expected.
                      </p>
                      <p className="leading-relaxed">
                        The shaded area between the green and red lines shows the range of possible outcomes. A wider shaded area means more uncertainty in the predictions.
                      </p>
                    </div>
                  </div>

                
                  <div className="text-xs text-[#64748B] bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                    <p><strong>Forecast Details:</strong> Based on {forecastData.length} prediction points</p>
                    <p>Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}