"use client";

import { useState, useEffect } from "react";
import { Delivery, DeliveryStatus } from "@/lib/types";
import DeliveryList from "@/components/DeliveryList";
import CreateDelivery from "@/components/CreateDelivery";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-gray-100/80 animate-pulse"
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

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="p-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                Delivery Management
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-gray-800">
                    {deliveries?.length || 0}
                  </span>{" "}
                  total deliveries
                </p>
                <p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-gray-800">
                    {totalItems}
                  </span>{" "}
                  total items
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-xs hover:shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <CreateDelivery onDeliveryCreated={fetchDeliveries} />
          </div>
        </div>

        {deliveries && deliveries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div 
              className={`bg-gradient-to-br from-blue-50 to-indigo-50 border rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 cursor-pointer ${
                statusFilter === 'all' ? 'border-blue-300 ring-2 ring-blue-200' : 'border-blue-100'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Total Deliveries
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {deliveries.length}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-xs">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-gradient-to-br from-yellow-50 to-amber-50 border rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 cursor-pointer ${
                statusFilter === 'pending' ? 'border-yellow-300 ring-2 ring-yellow-200' : 'border-yellow-100'
              }`}
              onClick={() => setStatusFilter('pending')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {statusStats.pending}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-xs">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-gradient-to-br from-green-50 to-emerald-50 border rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 cursor-pointer ${
                statusFilter === 'completed' ? 'border-green-300 ring-2 ring-green-200' : 'border-green-100'
              }`}
              onClick={() => setStatusFilter('completed')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {statusStats.completed}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-xs">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-gradient-to-br from-red-50 to-rose-50 border rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200 cursor-pointer ${
                statusFilter === 'cancelled' ? 'border-red-300 ring-2 ring-red-200' : 'border-red-100'
              }`}
              onClick={() => setStatusFilter('cancelled')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">
                    Cancelled
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {statusStats.cancelled}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-xs">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {deliveries && deliveries.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Filters:</span>
                <div className="flex gap-2">
                  {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        statusFilter === status
                          ? getStatusButtonStyle(status)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                      {status !== 'all' && (
                        <span className="ml-2 text-xs bg-white/80 px-1.5 py-0.5 rounded-full">
                          {statusStats[status as keyof typeof statusStats]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredDeliveries?.length || 0} of {deliveries.length} deliveries
                {hasActiveFilters && " (filtered)"}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-field" className="text-sm font-medium text-gray-700">
                  Date Field
                </Label>
                <Select value={dateField} onValueChange={(value: "requestedAt" | "scheduledArrivalDate") => setDateField(value)}>
                  <SelectTrigger className="bg-white/80 border-gray-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requestedAt">Requested Date</SelectItem>
                    <SelectItem value="scheduledArrivalDate">Scheduled Arrival</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium text-gray-700">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                  className="bg-white/80 border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium text-gray-700">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                  className="bg-white/80 border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 opacity-0">
                  Actions
                </Label>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="flex items-center gap-2 bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {statusFilter !== "all" && (
                  <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-sm">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="hover:text-purple-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dateRange.startDate && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm">
                    From: {new Date(dateRange.startDate).toLocaleDateString()}
                    <button
                      onClick={() => handleDateRangeChange("startDate", "")}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dateRange.endDate && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm">
                    To: {new Date(dateRange.endDate).toLocaleDateString()}
                    <button
                      onClick={() => handleDateRangeChange("endDate", "")}
                      className="hover:text-green-900"
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
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-6 mb-8 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-xs">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">
                  Delivery Management Dashboard
                </h3>
                <p className="text-gray-600 mt-1">
                  Track and manage{" "}
                  <span className="font-semibold text-blue-600">
                    {deliveries.length}
                  </span>{" "}
                  deliveries with{" "}
                  <span className="font-semibold text-blue-600">
                    {statusStats.pending}
                  </span>{" "}
                  pending,{" "}
                  <span className="font-semibold text-blue-600">
                    {statusStats.completed}
                  </span>{" "}
                  completed, and{" "}
                  <span className="font-semibold text-blue-600">
                    {statusStats.cancelled}
                  </span>{" "}
                  cancelled shipments
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden hover:shadow-sm transition-shadow duration-200">
          {deliveries === null ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-xs">
                <div className="bg-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-xs">
                  <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Failed to Load Deliveries
                </h3>
                <p className="text-gray-600 mb-6">
                  There was an error fetching your delivery data. Please check
                  your connection and try again.
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50"
                >
                  {refreshing ? "Retrying..." : "Try Again"}
                </button>
              </div>
            </div>
          ) : deliveries && deliveries.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-10 max-w-md mx-auto shadow-xs">
                <div className="bg-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6 shadow-xs">
                  <Truck className="h-10 w-10 text-blue-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No Deliveries Found
                </h3>
                <p className="text-gray-600 mb-8">
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
      return 'bg-blue-500 text-white shadow-blue-500/25';
    case 'pending':
      return 'bg-yellow-500 text-white shadow-yellow-500/25';
    case 'completed':
      return 'bg-green-500 text-white shadow-green-500/25';
    case 'cancelled':
      return 'bg-red-500 text-white shadow-red-500/25';
    default:
      return 'bg-gray-500 text-white';
  }
}