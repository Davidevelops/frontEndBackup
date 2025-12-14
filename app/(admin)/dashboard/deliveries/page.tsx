"use client";

import { useState, useEffect } from "react";
import { Delivery, DeliveryStatus } from "@/lib/types";
import DeliveryList from "@/components/DeliveryList";
import CreateDelivery from "@/components/CreateDelivery";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import {
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  X,
  Info,
} from "lucide-react";
import { getAllDeliveries } from "@/lib/data/routes/delivery/delivery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[] | null>(null);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "all">("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [dateField, setDateField] = useState<"requestedAt" | "scheduledArrivalDate">("requestedAt");

  const fetchDeliveries = async (status?: DeliveryStatus) => {
    try {
      setRefreshing(true);
      const data = await getAllDeliveries(status);
      setDeliveries(data);
      setFilteredDeliveries(data);
    } catch (error) {
      console.error("Error while getting deliveries: ", error);
      setDeliveries(null);
      setFilteredDeliveries(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    if (!deliveries) {
      setFilteredDeliveries(null);
      return;
    }

    let filtered = deliveries;

    if (statusFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter(delivery => {
        const deliveryDate = new Date(delivery[dateField]);
        const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
        
        let dateMatch = true;
        if (startDate) {
          dateMatch = dateMatch && deliveryDate >= startDate;
        }
        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          dateMatch = dateMatch && deliveryDate <= endOfDay;
        }
        
        return dateMatch;
      });
    }

    setFilteredDeliveries(filtered);
  }, [statusFilter, dateRange, dateField, deliveries]);

  const getStatusStats = () => {
    if (!deliveries) return { pending: 0, completed: 0, cancelled: 0 };

    return {
      pending: deliveries.filter((d) => d.status === "pending").length,
      completed: deliveries.filter((d) => d.status === "completed").length,
      cancelled: deliveries.filter((d) => d.status === "cancelled").length,
    };
  };

  const getTotalItems = () => {
    if (!deliveries) return 0;
    return deliveries.reduce(
      (total, delivery) =>
        total + delivery.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );
  };

  const statusStats = getStatusStats();
  const totalItems = getTotalItems();

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setDateRange({
      startDate: "",
      endDate: "",
    });
  };

  const hasActiveFilters = statusFilter !== "all" || dateRange.startDate || dateRange.endDate;

  const handleRefresh = () => {
    fetchDeliveries();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse shadow-sm"></div>
              <div className="space-y-3">
                <div className="h-9 w-56 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-12 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Recommendations Panel Loading */}
          <div className="mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-300 rounded-lg"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="p-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-4 border-b border-slate-200 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8">
      <div className="mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="bg-slate-800 p-3 rounded-2xl shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Delivery Management
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <p className="text-slate-600 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                  <Package className="h-4 w-4 text-slate-600" />
                  <span className="font-semibold text-slate-800">
                    {deliveries?.length || 0}
                  </span>{" "}
                  total deliveries
                </p>
                <p className="text-slate-600 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  <span className="font-semibold text-slate-800">
                    {totalItems}
                  </span>{" "}
                  total items
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreateDelivery onDeliveryCreated={fetchDeliveries} />
          </div>
        </div>

        <Alert className="mb-6 bg-yellow-100 border-yellow-400">
          <AlertDescription className="text-yellow-800">
            <strong className="text-xl">NOTE BEFORE MAKING A DELIVERY</strong> Make sure this supplier has a associated product. You won't be able to create one if the supplier you chose doesn't have an associated product. If there is no associated product, <strong>Go to: supply chain &gt; suppliers &gt; choose the "details" button of the selected supplier and you will see a "add product button" to associated products.</strong>
          </AlertDescription>
        </Alert>

     
        <div className="mb-8">
          <RecommendationsPanel />
        </div>


        {deliveries && deliveries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div 
              className={`bg-white border rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 cursor-pointer ${
                statusFilter === 'all' ? 'border-slate-300 ring-2 ring-slate-200' : 'border-slate-200'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Total Deliveries
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {deliveries.length}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-xl shadow-xs">
                  <Truck className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-white border rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 cursor-pointer ${
                statusFilter === 'pending' ? 'border-slate-300 ring-2 ring-slate-200' : 'border-slate-200'
              }`}
              onClick={() => setStatusFilter('pending')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {statusStats.pending}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-xl shadow-xs">
                  <Clock className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-white border rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 cursor-pointer ${
                statusFilter === 'completed' ? 'border-slate-300 ring-2 ring-slate-200' : 'border-slate-200'
              }`}
              onClick={() => setStatusFilter('completed')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {statusStats.completed}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-xl shadow-xs">
                  <CheckCircle className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-white border rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 cursor-pointer ${
                statusFilter === 'cancelled' ? 'border-slate-300 ring-2 ring-slate-200' : 'border-slate-200'
              }`}
              onClick={() => setStatusFilter('cancelled')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    Cancelled
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {statusStats.cancelled}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-xl shadow-xs">
                  <XCircle className="h-6 w-6 text-slate-700" />
                </div>
              </div>
            </div>
          </div>
        )}


        {deliveries && deliveries.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-slate-500" />
                <span className="font-medium text-slate-700">Filters:</span>
                <div className="flex gap-2">
                  {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        statusFilter === status
                          ? getStatusButtonStyle(status)
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                      {status !== 'all' && (
                        <span className="ml-2 text-xs bg-white px-1.5 py-0.5 rounded-full">
                          {statusStats[status as keyof typeof statusStats]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Showing {filteredDeliveries?.length || 0} of {deliveries.length} deliveries
                {hasActiveFilters && " (filtered)"}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-field" className="text-sm font-medium text-slate-700">
                  Date Field
                </Label>
                <Select value={dateField} onValueChange={(value: "requestedAt" | "scheduledArrivalDate") => setDateField(value)}>
                  <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requestedAt">Requested Date</SelectItem>
                    <SelectItem value="scheduledArrivalDate">Scheduled Arrival</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium text-slate-700">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                  className="bg-white border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium text-slate-700">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                  className="bg-white border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 opacity-0">
                  Actions
                </Label>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="flex items-center gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {statusFilter !== "all" && (
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-sm">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="hover:text-slate-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dateRange.startDate && (
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-sm">
                    From: {new Date(dateRange.startDate).toLocaleDateString()}
                    <button
                      onClick={() => handleDateRangeChange("startDate", "")}
                      className="hover:text-slate-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dateRange.endDate && (
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-sm">
                    To: {new Date(dateRange.endDate).toLocaleDateString()}
                    <button
                      onClick={() => handleDateRangeChange("endDate", "")}
                      className="hover:text-slate-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {deliveries && deliveries.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-xs">
                <Truck className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg">
                  Delivery Management Dashboard
                </h3>
                <p className="text-slate-600 mt-1">
                  Track and manage{" "}
                  <span className="font-semibold text-slate-800">
                    {deliveries.length}
                  </span>{" "}
                  deliveries with{" "}
                  <span className="font-semibold text-slate-800">
                    {statusStats.pending}
                  </span>{" "}
                  pending,{" "}
                  <span className="font-semibold text-slate-800">
                    {statusStats.completed}
                  </span>{" "}
                  completed, and{" "}
                  <span className="font-semibold text-slate-800">
                    {statusStats.cancelled}
                  </span>{" "}
                  cancelled shipments
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow duration-200">
          {deliveries === null ? (
            <div className="text-center py-20">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-md mx-auto shadow-xs">
                <div className="bg-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-xs">
                  <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  Failed to Load Deliveries
                </h3>
                <p className="text-slate-600 mb-6">
                  There was an error fetching your delivery data. Please check
                  your connection and try again.
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30 disabled:opacity-50"
                >
                  {refreshing ? "Retrying..." : "Try Again"}
                </button>
              </div>
            </div>
          ) : deliveries && deliveries.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 max-w-md mx-auto shadow-xs">
                <div className="bg-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6 shadow-xs">
                  <Truck className="h-10 w-10 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  No Deliveries Found
                </h3>
                <p className="text-slate-600 mb-8">
                  Start managing your shipments by creating your first delivery.
                </p>
                <CreateDelivery onDeliveryCreated={fetchDeliveries} />
              </div>
            </div>
          ) : (
            <div className="p-1">
              <DeliveryList
                deliveries={filteredDeliveries || []}
                onDeliveryUpdated={fetchDeliveries}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusButtonStyle(status: DeliveryStatus | "all") {
  switch (status) {
    case 'all':
      return 'bg-slate-800 text-white shadow-slate-500/25';
    case 'pending':
      return 'bg-slate-800 text-white shadow-slate-500/25';
    case 'completed':
      return 'bg-slate-800 text-white shadow-slate-500/25';
    case 'cancelled':
      return 'bg-slate-800 text-white shadow-slate-500/25';
    default:
      return 'bg-slate-800 text-white';
  }
}