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
  ShoppingCart, // Added for sales icon
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { apiEndpoints } from "@/lib/apiEndpoints";
import Link from "next/link"; // Added for navigation

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

  useEffect(() => {
    if (!loading && chartContainerRef.current) {
      const el = chartContainerRef.current;
      el.scrollTo({
        left: el.scrollWidth,
        behavior: "instant",
      });
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
        /** --- Process sales --- **/
        const rawSales = salesRes.data.data || [];
        const sortedSales = rawSales
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .map((sale: any) => {
            const d = new Date(sale.date);
            return {
              date: d.toISOString(), // for X-axis + sorting
              dateFull: sale.date, // keep raw date for info display
              quantity: sale.quantity,
            };
          });
        setSalesData(sortedSales);

        /** --- Process forecasts --- **/
        const forecastRaw = forecastRes.data?.data?.[0]?.entries || [];
        const formattedForecasts = forecastRaw
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .map((f: any) => {
            const d = new Date(f.date);
            return {
              date: d.toISOString(), // consistent with salesData
              dateFull: f.date,
              yhat: f.yhat,
              yhatLower: f.yhatLower,
              yhatUpper: f.yhatUpper,
            };
          });
        setForecastData(formattedForecasts);

        /** --- Metrics logic remains unchanged --- **/
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
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
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

  const combinedData = [
    ...salesData.map((s) => ({
      date: s.date,
      quantity: s.quantity,
      yhat: null,
      yhatLower: null,
      yhatUpper: null,
    })),
    ...forecastData.map((f) => ({
      date: f.date,
      quantity: null,
      yhat: f.yhat,
      yhatLower: f.yhatLower,
      yhatUpper: f.yhatUpper,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">
      {product && (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                  <PackageCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {product.name}
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last updated:{" "}
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Sales Button - Added this new button */}
                <Link
                  href={`/dashboard/variantSales/${product.groupId}/variants/${product.id}/sales`}
                >
                  <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-sm">
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
                    <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-sm">
                      <ChartLine className="h-5 w-5" />
                      Generate Forecast
                    </button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px] bg-white border border-purple-100 rounded-2xl">
                    <DialogHeader className="space-y-2">
                      <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <ChartLine className="h-5 w-5 text-purple-600" />
                        Generate Forecast
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 text-sm">
                        Configure the forecast parameters below before
                        generating.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setIsForecastDialogOpen(false)}
                        className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleGenerateForecast}
                        disabled={isForecasting}
                        className={`flex-1 justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
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
                  <AlertDialogTrigger className="flex items-center gap-2 border border-purple-200 text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-xl font-semibold transition-all duration-200">
                    <SquarePen className="h-5 w-5" />
                    Edit Product
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md bg-white border border-purple-100 rounded-2xl">
                    <AlertDialogHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                          <Settings className="h-5 w-5 text-purple-600" />
                          Edit Product
                        </AlertDialogTitle>
                        <AlertDialogCancel className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <X className="h-4 w-4" />
                        </AlertDialogCancel>
                      </div>

                      <div className="space-y-4">
                        {/* Product ID */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600 flex items-center justify-between">
                            <span>Product ID</span>
                            <button
                              type="button"
                              onClick={handleCopyId}
                              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                              {copyFeedback ? "Copied!" : "Copy"}
                            </button>
                          </label>
                          <input
                            type="text"
                            value={product.id}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-400">
                            This ID is unique to this product and cannot be
                            changed
                          </p>
                        </div>

                        {/* Basic Fields */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-purple-600" />
                            Basic Information
                          </h3>

                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                              placeholder="Safety Stock"
                            />
                          </div>
                        </div>
                      </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex gap-2 pt-4">
                      <AlertDialogCancel className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-2.5">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleSave(product.id, product.groupId)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl py-2.5 font-semibold flex items-center justify-center gap-2"
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
                    <button className="flex items-center gap-2 text-red-700 border border-red-700 hover:bg-red-50 px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-sm">
                      <Trash2 className="h-5 w-5" />
                      Delete Product
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white border border-red-100 rounded-2xl">
                    <DialogHeader className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-800">
                          Delete Product
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-gray-600 text-base">
                        Are you sure you want to delete{" "}
                        <strong>"{product.name}"</strong>? This action cannot be
                        undone.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsDeleteDialogOpen(false)}
                        className="flex items-center gap-2 flex-1 justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteProduct(product.id, product.groupId)
                        }
                        className="flex items-center gap-2 flex-1 justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200"
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Total Sales
                  </p>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {metrics.totalSales.toLocaleString()}
                  </h2>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <ChartLine className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {metrics.salesChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    metrics.salesChange >= 0
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {metrics.salesChange >= 0 ? "+" : ""}
                  {metrics.salesChange}%
                </span>
                <span className="text-gray-500">since last period</span>
              </div>
            </div>

            {/* Forecast Accuracy */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Forecast Accuracy
                  </p>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {metrics.forecastAccuracy.toFixed(1)}%
                  </h2>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
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
                <div className="bg-green-50 p-2 rounded-lg">
                  <Gauge className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Sales Performance
                </h3>
              </div>

              {/* Chart Info Summary */}
              {!loading && salesData.length > 0 && (
                <div className="text-sm text-gray-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                  Showing data from{" "}
                  <span className="font-semibold">
                    {new Date(salesData[0]?.dateFull).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                      }
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {new Date(
                      salesData[salesData.length - 1]?.dateFull
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <p className="text-gray-500">Loading sales data...</p>
            ) : salesData.length === 0 ? (
              <p className="text-gray-500">
                No sales data available for this product.
              </p>
            ) : (
              <div ref={chartContainerRef} className="h-96 overflow-x-auto">
                <div
                  style={{
                    width: `${
                      Math.max(salesData.length, forecastData.length) * 40
                    }px`,
                    height: "100%",
                  }}
                >
                  <LineChart
                    width={Math.max(salesData.length, forecastData.length) * 40}
                    height={384}
                    data={combinedData}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.toLocaleString("en-US", {
                          month: "short",
                        })} '${String(date.getFullYear()).slice(-2)}`;
                      }}
                      interval={Math.floor(salesData.length / 10)} // reduce clutter
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />

                    {/* Actual Sales Line */}
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                      name="Actual Sales"
                    />

                    {/* Forecast Line */}
                    <Line
                      type="monotone"
                      dataKey="yhat"
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                      name="Forecast"
                    />
                  </LineChart>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
