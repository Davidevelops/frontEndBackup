"use client";

import { Sale } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Calendar,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  BarChart3,
  Users,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  addSale,
  updateSale,
  deleteSale,
} from "@/lib/data/routes/product/product";
import { useRouter } from "next/navigation";

interface SalesTableProps {
  sales: Sale[];
  productName: string;
  groupId: string;
  productId: string;
  onRefetch: () => void;
}

export default function SalesTable({
  sales,
  productName,
  groupId,
  productId,
  onRefetch,
}: SalesTableProps) {
  const router = useRouter();
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isViewSaleOpen, setIsViewSaleOpen] = useState(false);
  const [isUpdateSaleOpen, setIsUpdateSaleOpen] = useState(false);
  const [isDeleteSaleOpen, setIsDeleteSaleOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    quantity: 1,
    status: "pending",
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter sales based on status and date range
  const filteredSales = sales.filter(sale => {
    // Status filter
    const statusMatch = statusFilter === "all" || sale.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Date range filter
    const saleDate = new Date(sale.date);
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
    
    let dateMatch = true;
    if (startDate) {
      dateMatch = dateMatch && saleDate >= startDate;
    }
    if (endDate) {
      // Set end date to end of day for inclusive range
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && saleDate <= endOfDay;
    }
    
    return statusMatch && dateMatch;
  });

  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentSales = filteredSales.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateRange.startDate, dateRange.endDate]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // Handle date range changes
  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("all");
    setDateRange({
      startDate: "",
      endDate: "",
    });
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== "all" || dateRange.startDate || dateRange.endDate;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-[#475569]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-800 border-green-200 hover:bg-green-100";
      case "pending":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200 hover:bg-red-100";
      default:
        return "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0] hover:bg-[#E2E8F0]";
    }
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsViewSaleOpen(true);
  };

  const handleUpdateSale = (sale: Sale) => {
    setSelectedSale(sale);
    setFormData({
      date: sale.date.split("T")[0],
      quantity: sale.quantity,
      status: sale.status.toLowerCase(),
    });
    setIsUpdateSaleOpen(true);
  };

  const handleDeleteSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteSaleOpen(true);
  };

  const handleAddSale = async () => {
    setIsLoading(true);
    try {
      console.log("🚀 ADD SALE - ID Debug:");
      console.log("Group ID:", groupId);
      console.log("Product ID:", productId);
      console.log("Form Data:", formData);

      await addSale(groupId, productId, {
        date: formData.date,
        quantity: Number(formData.quantity),
        status: formData.status,
      });

      onRefetch();
      setIsAddSaleOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        quantity: 1,
        status: "pending",
      });
    } catch (error: any) {
      console.error("Error adding sale:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage = error.response?.data?.message || error.message;
      alert(
        `Failed to add sale: ${errorMessage}\n\nCheck console for details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSale) return;

    setIsLoading(true);
    try {
      console.log("🚀 UPDATE SALE - ID Debug:");
      console.log("Group ID:", groupId);
      console.log("Product ID:", productId);
      console.log("Sale ID:", selectedSale.id);
      console.log("Form Data:", formData);

      await updateSale(groupId, productId, selectedSale.id, {
        date: formData.date,
        quantity: Number(formData.quantity),
        status: formData.status,
      });

      onRefetch(); 
      setIsUpdateSaleOpen(false);
    } catch (error: any) {
      console.error("Error updating sale:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage = error.response?.data?.message || error.message;
      alert(
        `Failed to update sale: ${errorMessage}\n\nCheck console for details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSale) return;

    setIsLoading(true);
    try {
      console.log("DELETE SALE - ID Debug:");
      console.log("Group ID:", groupId);
      console.log("Product ID:", productId);
      console.log("Sale ID:", selectedSale.id);

      await deleteSale(groupId, productId, selectedSale.id);

      onRefetch(); 
      setIsDeleteSaleOpen(false);
    } catch (error: any) {
      console.error("Error deleting sale:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage = error.response?.data?.message || error.message;
      alert(
        `Failed to delete sale: ${errorMessage}\n\nCheck console for details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const completedSales = sales.filter(
    (sale) => sale.status.toLowerCase() === "completed"
  ).length;
  const pendingSales = sales.filter(
    (sale) => sale.status.toLowerCase() === "pending"
  ).length;
  const cancelledSales = sales.filter(
    (sale) => sale.status.toLowerCase() === "cancelled"
  ).length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.quantity * 1, 0);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[95rem] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <div className="bg-[#1E293B] p-3 rounded-2xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#1E293B]">
               Transaction history of product: {productName}
              </h1>
              {/* <div className="text-[#475569] mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Detailed sales performance for {productName}
              </div> */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/dashboard/product-view/${groupId}/${productId}`}>
              <Button
                variant="outline"
                className="bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B] px-4 py-2 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product
              </Button>
            </Link>

            <Dialog open={isAddSaleOpen} onOpenChange={setIsAddSaleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#1E293B]">
                    Add New Sale
                  </DialogTitle>
                  <DialogDescription className="text-[#475569]">
                    Create a new sales record for {productName}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date" className="text-[#475569] font-medium">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange("date", e.target.value)}
                      className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="quantity"
                      className="text-[#475569] font-medium"
                    >
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleFormChange(
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="status"
                      className="text-[#475569] font-medium"
                    >
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleFormChange("status", value)
                      }
                      defaultValue="pending"
                    >
                      <SelectTrigger className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]">
                        <SelectValue
                          placeholder="Select status"
                          defaultValue={"pending"}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#E2E8F0] rounded-xl">
                        <SelectItem value="pending">
                          Pending
                        </SelectItem>
                        <SelectItem value="completed">
                          Completed
                        </SelectItem>
                        <SelectItem value="cancelled">
                          Cancelled
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddSaleOpen(false)}
                    className="bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-xl"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSale}
                    disabled={isLoading}
                    className="bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Sale"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#475569] px-4 py-2 rounded-xl text-sm">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="bg-[#F1F5F9] p-2.5 rounded-xl">
                <TrendingUp className="h-5 w-5 text-[#475569]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1E293B]">
                  {totalSales}
                </div>
                <div className="text-sm font-medium text-[#475569]">
                  Total completed sold items
                </div>
                <div className="text-xs text-[#64748B] mt-1">Items sold</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded-lg border border-[#E2E8F0]">
              <TrendingUp className="h-3 w-3" />
              All-time sales volume
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="bg-[#F1F5F9] p-2.5 rounded-xl">
                <ShoppingCart className="h-5 w-5 text-[#475569]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1E293B]">
                  {sales.length}
                </div>
                <div className="text-sm font-medium text-[#475569]">
                  Transactions
                </div>
                <div className="text-xs text-[#64748B] mt-1">Total orders</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded-lg border border-[#E2E8F0]">
              <ShoppingCart className="h-3 w-3" />
              Purchase orders
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-2.5 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1E293B]">
                  {completedSales}
                </div>
                <div className="text-sm font-medium text-[#475569]">
                  Completed
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Successful orders
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
              <CheckCircle className="h-3 w-3" />
              Delivered to customers
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-50 p-2.5 rounded-xl">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1E293B]">
                  {pendingSales}
                </div>
                <div className="text-sm font-medium text-[#475569]">
                  Pending
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  Awaiting fulfillment
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
              <Clock className="h-3 w-3" />
              In progress
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300 group">
            <div className="flex items-center gap-3">
              <div className="bg-[#F1F5F9] p-2.5 rounded-xl">
                <DollarSign className="h-5 w-5 text-[#475569]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1E293B]">
                  ${totalRevenue}
                </div>
                <div className="text-sm font-medium text-[#475569]">Revenue</div>
                <div className="text-xs text-[#64748B] mt-1">
                  Estimated total
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded-lg border border-[#E2E8F0]">
              <DollarSign className="h-3 w-3" />
              Based on unit price
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-sm transition-shadow duration-300 mb-2">
          <div className="p-5 border-b border-[#E2E8F0]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="bg-[#1E293B] p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E293B]">
                    Transactions
                  </h2>
                  <p className="text-[#475569] text-sm">
                    Detailed transaction records for {productName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#64748B]" />
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger className="w-32 bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#E2E8F0] rounded-xl">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2 bg-blue-100 border border-blue-400 text-blue-700 px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                  <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {filteredSales.length} transactions
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm font-medium text-[#475569]">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                    className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm font-medium text-[#475569]">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                    className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#475569] opacity-0">
                    Actions
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      disabled={!hasActiveFilters}
                      className="flex items-center gap-2 bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {statusFilter !== "all" && (
                  <div className="flex items-center gap-1 bg-[#F1F5F9] text-[#475569] px-2 py-1 rounded-lg text-sm">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="hover:text-[#1E293B]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dateRange.startDate && (
                  <div className="flex items-center gap-1 bg-[#F1F5F9] text-[#475569] px-2 py-1 rounded-lg text-sm">
                    From: {formatDate(dateRange.startDate)}
                    <button
                      onClick={() => handleDateRangeChange("startDate", "")}
                      className="hover:text-[#1E293B]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dateRange.endDate && (
                  <div className="flex items-center gap-1 bg-[#F1F5F9] text-[#475569] px-2 py-1 rounded-lg text-sm">
                    To: {formatDate(dateRange.endDate)}
                    <button
                      onClick={() => handleDateRangeChange("endDate", "")}
                      className="hover:text-[#1E293B]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="rounded-lg overflow-hidden border border-[#E2E8F0]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F1F5F9] hover:bg-[#E2E8F0]">
                    <TableHead className="text-[#475569] font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#475569]" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="text-[#475569] font-semibold">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#475569]" />
                        Quantity
                      </div>
                    </TableHead>
                    <TableHead className="text-[#475569] font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#475569]" />
                        Status
                      </div>
                    </TableHead>
                    <TableHead className="text-[#475569] font-semibold">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#475569]" />
                        Transaction ID
                      </div>
                    </TableHead>
                    <TableHead className="text-[#475569] font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#475569]" />
                        Created
                      </div>
                    </TableHead>
                    <TableHead className="text-[#475569] font-semibold text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Sparkles className="h-4 w-4 text-[#475569]" />
                        Actions
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-[#64748B]">
                          <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
                          <p className="text-lg font-semibold text-[#475569]">
                            {hasActiveFilters 
                              ? "No sales match your filters" 
                              : "No sales records found"}
                          </p>
                          <p className="text-sm text-[#64748B]">
                            {hasActiveFilters 
                              ? "Try adjusting your filters to see more results" 
                              : "Sales data will appear here once transactions occur"}
                          </p>
                          {hasActiveFilters && (
                            <Button
                              variant="outline"
                              onClick={clearAllFilters}
                              className="mt-3 bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-xl"
                            >
                              Clear All Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSales.map((sale) => (
                      <TableRow
                        key={sale.id}
                        className="border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors duration-200"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-[#F1F5F9]">
                              <Calendar className="h-3.5 w-3.5 text-[#475569]" />
                            </div>
                            <span className="text-[#1E293B]">
                              {formatDate(sale.date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-[#F1F5F9]">
                              <Package className="h-3.5 w-3.5 text-[#475569]" />
                            </div>
                            <div>
                              <span className="font-semibold text-[#1E293B]">
                                {sale.quantity}
                              </span>
                              <span className="text-sm text-[#64748B] ml-1">
                                units
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${getStatusColor(
                              sale.status
                            )}`}
                          >
                            {getStatusIcon(sale.status)}
                            {sale.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-[#F1F5F9]">
                              <Users className="h-3.5 w-3.5 text-[#475569]" />
                            </div>
                            <code className="text-sm text-[#1E293B] bg-[#F1F5F9] px-2 py-1 rounded border border-[#E2E8F0]">
                              {sale.id.slice(0, 8)}...
                            </code>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#475569]">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                            {formatDateTime(sale.createdAt)}
                          </div>
                        </TableCell>
<TableCell>
  <div className="flex items-center gap-2 justify-end">
    <Button
      onClick={() => handleViewSale(sale)}
      className="px-3 py-1.5 h-8 min-w-[80px] bg-gradient-to-br from-blue-50 to-blue-100/70 backdrop-blur-sm border border-blue-200/70 text-blue-700 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-blue-100/50 text-sm font-medium"
    >
      View
    </Button>

    <Button
      onClick={() => handleUpdateSale(sale)}
      className="px-3 py-1.5 h-8 min-w-[80px] bg-gradient-to-br from-emerald-50 to-emerald-100/70 backdrop-blur-sm border border-emerald-200/70 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-emerald-100/50 text-sm font-medium"
    >
      Edit
    </Button>
    
    <Button
      onClick={() => handleDeleteSale(sale)}
      className="px-3 py-1.5 h-8 min-w-[80px] bg-gradient-to-br from-rose-50 to-rose-100/70 backdrop-blur-sm border border-rose-200/70 text-rose-700 hover:from-rose-100 hover:to-rose-200 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-rose-100/50 text-sm font-medium"
    >
      Delete
    </Button>
  </div>
</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredSales.length > 0 && (
            <div className="px-5 pb-5 border-t border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="flex items-center gap-4 text-sm text-[#475569]">
                  <span>
                    Showing {startIndex + 1}-{endIndex} of {totalItems}{" "}
                    transactions
                    {hasActiveFilters && " (filtered)"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(e.target.value)}
                      className="border border-[#E2E8F0] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#CBD5E1] focus:border-transparent"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === page
                            ? "bg-[#1E293B] text-white hover:bg-[#0F172A]"
                            : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
                        } rounded-xl`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-xl"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rest of the dialogs */}
        <Dialog open={isViewSaleOpen} onOpenChange={setIsViewSaleOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white border border-[#E2E8F0] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#1E293B]">
                Sale Details
              </DialogTitle>
              <DialogDescription className="text-[#475569]">
                Detailed information for this sales transaction
              </DialogDescription>
            </DialogHeader>
            {selectedSale && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#475569]">
                      Transaction ID
                    </Label>
                    <div className="text-sm text-[#1E293B] bg-[#F1F5F9] p-2 rounded-xl border border-[#E2E8F0]">
                      {selectedSale.id}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#475569]">
                      Date
                    </Label>
                    <div className="flex items-center gap-2 text-sm text-[#1E293B] bg-[#F1F5F9] p-2 rounded-xl border border-[#E2E8F0]">
                      <Calendar className="h-4 w-4 text-[#475569]" />
                      {formatDate(selectedSale.date)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#475569]">
                      Quantity
                    </Label>
                    <div className="flex items-center gap-2 text-sm text-[#1E293B] bg-[#F1F5F9] p-2 rounded-xl border border-[#E2E8F0]">
                      <Package className="h-4 w-4 text-[#475569]" />
                      {selectedSale.quantity} units
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#475569]">
                      Status
                    </Label>
                    <div
                      className={`flex items-center gap-1.5 w-fit px-3 py-2 rounded-full border text-sm font-medium ${getStatusColor(
                        selectedSale.status
                      )}`}
                    >
                      {getStatusIcon(selectedSale.status)}
                      {selectedSale.status}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#475569]">
                    Created At
                  </Label>
                  <div className="flex items-center gap-2 text-sm text-[#1E293B] bg-[#F1F5F9] p-2 rounded-xl border border-[#E2E8F0]">
                    <Clock className="h-4 w-4 text-[#475569]" />
                    {formatDateTime(selectedSale.createdAt)}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setIsViewSaleOpen(false)}
                className="bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isUpdateSaleOpen} onOpenChange={setIsUpdateSaleOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#1E293B]">
                Update Sale
              </DialogTitle>
              <DialogDescription className="text-[#475569]">
                Modify the sales record details
              </DialogDescription>
            </DialogHeader>
            {selectedSale && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="update-date"
                    className="text-[#475569] font-medium"
                  >
                    Date
                  </Label>
                  <Input
                    id="update-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="update-quantity"
                    className="text-[#475569] font-medium"
                  >
                    Quantity
                  </Label>
                  <Input
                    id="update-quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleFormChange(
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    min="1"
                    className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="update-status"
                    className="text-[#475569] font-medium"
                  >
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleFormChange("status", value)}
                  >
                    <SelectTrigger className="bg-white border-[#E2E8F0] rounded-xl focus:border-[#CBD5E1]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#E2E8F0] rounded-xl">
                      <SelectItem value="pending">
                        Pending
                      </SelectItem>
                      <SelectItem value="completed">
                        Completed
                      </SelectItem>
                      <SelectItem value="cancelled">
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUpdateSaleOpen(false)}
                className="bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-xl"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isLoading}
                className="bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Sale"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteSaleOpen} onOpenChange={setIsDeleteSaleOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#1E293B] text-xl font-bold">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-[#475569]">
                Are you sure you want to delete this sales record? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedSale && (
              <div className="py-4">
                <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4">
                  <div className="text-sm text-[#475569] space-y-2">
                    <p className="font-medium text-base">Sale Details:</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date: {formatDate(selectedSale.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Quantity: {selectedSale.quantity} units
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Status: {selectedSale.status}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteSaleOpen(false)}
                className="bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-xl"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isLoading ? "Deleting..." : "Delete Sale"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}