"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Supplier } from "@/lib/types";
import Link from "next/link";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/lib/data/routes/supplier/supplier";
import toast from "react-hot-toast";
import {
  Package,
  Clock,
  Calendar,
  Plus,
  Search,
  Filter,
  Truck,
  Edit,
  Trash2,
  Eye,
  Users,
  Save,
  X,
  BarChart3,
  Shield,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface supplierProp {
  supplier: Supplier[] | null;
  refresh: () => Promise<void>;
}

// Pagination configuration
const ITEMS_PER_PAGE = 10;

export default function SupplierList({ supplier, refresh }: supplierProp) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    leadTime: 7,
  });

  useEffect(() => {
    console.log("📦 Supplier List Data:", supplier);
    if (supplier) {
      supplier.forEach((sup, index) => {
        console.log(
          `Supplier ${index}:`,
          sup.name,
          "Products:",
          sup.products?.length || 0
        );
      });
    }
  }, [supplier]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success("Supplier ID copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy ID: ", err);
      toast.error("Failed to copy ID");
    }
  };

  const filteredSuppliers =
    supplier?.filter((sup) =>
      sup.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Pagination calculations
  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleAddSupplier = async () => {
    try {
      const addPromise = createSupplier({
        name: newSupplier.name,
        leadTime: newSupplier.leadTime,
      });

      toast.promise(addPromise, {
        loading: `Creating supplier "${newSupplier.name}"...`,
        success: (createdSupplier) => {
          setIsAddDialogOpen(false);
          setNewSupplier({ name: "", leadTime: 7 });
          // Auto refresh after successful creation
          refresh();
          return `Supplier "${newSupplier.name}" created successfully!`;
        },
        error: (error) => {
          console.error("Failed to add supplier:", error);
          return `Failed to create supplier: ${
            error.response?.data?.message || error.message
          }`;
        },
      });
    } catch (error) {
      console.error("Failed to add supplier:", error);
      toast.error(
        "Failed to create supplier. Please check the console for details."
      );
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xs border border-gray-100/80 text-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl w-20 h-20 mx-auto mb-6">
              <Truck className="h-10 w-10 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">
              No Suppliers Found
            </h2>
            <p className="text-gray-500 text-lg">
              There are no suppliers to display.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xs border border-gray-100/80 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-purple-500/20">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                    Supplier Management
                  </h1>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
                      <Truck className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold text-gray-800">
                        {supplier.length}
                      </span>{" "}
                      supplier{supplier.length !== 1 ? "s" : ""} registered
                    </p>
                    <p className="text-gray-600 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-gray-800">
                        {supplier.reduce(
                          (acc, sup) => acc + (sup.products?.length || 0),
                          0
                        )}
                      </span>{" "}
                      total products
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30">
                      <Plus className="h-5 w-5" />
                      Add Supplier
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-xl">
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                        <Users className="h-6 w-6 text-purple-600" />
                        Add New Supplier
                      </DialogTitle>

                      <DialogDescription className="text-gray-600">
                        Enter the details for the new supplier.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Supplier Name *
                          </label>
                          <input
                            type="text"
                            value={newSupplier.name}
                            onChange={(e) =>
                              setNewSupplier((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter supplier name"
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Lead Time (days) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={newSupplier.leadTime}
                            onChange={(e) =>
                              setNewSupplier((prev) => ({
                                ...prev,
                                leadTime: parseInt(e.target.value) || 1,
                              }))
                            }
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Average delivery time in days
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsAddDialogOpen(false)}
                        className="flex items-center gap-2 flex-1 justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSupplier}
                        disabled={!newSupplier.name.trim()}
                        className="flex items-center gap-2 flex-1 justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
                      >
                        <Save className="h-4 w-4" />
                        Create Supplier
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {supplier && supplier.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">
                      Total Suppliers
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {supplier.length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-xs">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">
                      Active Suppliers
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {supplier.filter((sup) => !sup.deletedAt).length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-xs">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Avg Lead Time
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {Math.round(
                        supplier.reduce((acc, sup) => acc + sup.leadTime, 0) /
                          supplier.length
                      )}{" "}
                      days
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-xs">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-gray-100/80 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search suppliers by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:border-gray-300">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Supplier Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 mb-8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100/80 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <Truck className="h-4 w-4 text-purple-600" />
                        Supplier
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Lead Time
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <Package className="h-4 w-4 text-green-600" />
                        Products
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        Last Updated
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80">
                  {currentSuppliers.map((sup) => (
                    <TableRow
                      key={sup.id}
                      supplier={sup}
                      router={router}
                      onCopyId={handleCopyId}
                      isCopied={copiedId === sup.id}
                      refresh={refresh}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-2xl mx-auto">
                  <div className="border p-6 rounded-2xl bg-purple-50 border-purple-200 inline-block">
                    <div className="bg-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6">
                      <Truck className="h-10 w-10 text-purple-600 mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      No suppliers found
                    </h2>
                    <p className="text-gray-500 mb-8 text-lg">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by adding your first supplier"}
                    </p>
                    {!searchTerm && (
                      <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30">
                            <Plus className="h-5 w-5" />
                            Add Your First Supplier
                          </button>
                        </DialogTrigger>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-gray-100/80 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-800">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-800">
                    {totalItems}
                  </span>{" "}
                  supplier{totalItems !== 1 ? "s" : ""}
                </div>

                <div className="flex items-center gap-2">
                  {/* First Page Button */}
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronsLeft className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Previous Page Button */}
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[40px] h-10 rounded-lg border transition-all duration-200 font-medium ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/25"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page Button */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Last Page Button */}
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronsRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Items Per Page Selector */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-gray-600">per page</span>
                </div>
              </div>
            </div>
          )}

          {/* Supplier Details Modal */}
          {selectedSupplier && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-200/80 mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedSupplier.name}
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Supplier ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border">
                        {selectedSupplier.id}
                      </span>
                      <button
                        onClick={() => handleCopyId(selectedSupplier.id)}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-200 transition-colors"
                      >
                        {copiedId === selectedSupplier.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Lead Time:</span>
                    <span className="font-medium text-gray-800">
                      {selectedSupplier.leadTime} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-medium text-gray-800">
                      {selectedSupplier.products?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(selectedSupplier.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(selectedSupplier.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="mt-8 w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
                >
                  Close Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function TableRow({
  supplier,
  router,
  onCopyId,
  isCopied,
  refresh,
  onViewDetails,
}: {
  supplier: Supplier;
  router: any;
  onCopyId: (id: string) => void;
  isCopied: boolean;
  refresh: () => Promise<void>;
  onViewDetails: (supplier: Supplier) => void;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: supplier.name,
    leadTime: supplier.leadTime,
  });

  const productCount = supplier.products?.length || 0;

  const handleSaveEdit = async () => {
    try {
      const updatePromise = updateSupplier(supplier.id, {
        name: editForm.name,
        leadTime: editForm.leadTime,
      });

      toast.promise(updatePromise, {
        loading: `Updating supplier "${supplier.name}"...`,
        success: (updatedSupplier) => {
          setIsEditDialogOpen(false);
          refresh();
          return `Supplier "${editForm.name}" updated successfully!`;
        },
        error: (error) => {
          console.error("Failed to update supplier:", error);
          return `Failed to update supplier: ${
            error.response?.data?.message || error.message
          }`;
        },
      });
    } catch (error) {
      console.error("Failed to update supplier:", error);
      toast.error(
        "Failed to update supplier. Please check the console for details."
      );
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      const deletePromise = deleteSupplier(supplier.id);

      toast.promise(deletePromise, {
        loading: `Deleting supplier "${supplier.name}"...`,
        success: (success) => {
          setIsDeleteDialogOpen(false);
          refresh();
          return `Supplier "${supplier.name}" deleted successfully!`;
        },
        error: (error)=>{
          console.error("Failed to delete supplier:", error);
          return `Failed to delete supplier: ${
            error.response?.data?.message || error.message
          }`;
        },
      });
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      toast.error(
        "Failed to delete supplier. Please check the console for details."
      );
    }
  };

  const getStatusBadge = (leadTime: number) => {
    if (leadTime <= 3) {
      return (
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium border border-green-200">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
          Fast Delivery
        </span>
      );
    } else if (leadTime <= 7) {
      return (
        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-medium border border-yellow-200">
          <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></div>
          Standard Delivery
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium border border-red-200">
          <div className="h-1.5 w-1.5 bg-red-500 rounded-full"></div>
          Slow Delivery
        </span>
      );
    }
  };

  return (
    <>
      <tr className="hover:bg-purple-50/30 transition-colors duration-200 group">
        <td className="py-4 px-6">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-xl shadow-xs">
              <Truck className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-200">
                  {supplier.name}
                </h3>
                {supplier.deletedAt && (
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-200">
                    Inactive
                  </span>
                )}
              </div>
              <button
                onClick={() => onCopyId(supplier.id)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors duration-200 group/copy mt-1 justify-center"
              >
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border">
                  ID: {supplier.id.slice(0, 8)}...
                </span>
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-gray-800">
              {supplier.leadTime}
            </span>
            <span className="text-sm text-gray-500">days</span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-gray-800">{productCount}</span>
            <span className="text-sm text-gray-500">
              product{productCount !== 1 ? "s" : ""}
            </span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex justify-center">
            <span className="text-sm text-gray-600">
              {new Date(supplier.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex justify-center">
            {getStatusBadge(supplier.leadTime)}
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewDetails(supplier)}
                  className="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/dashboard/supplier/${supplier.id}`}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  <BarChart3 className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Full Details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <button 
                      className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-xl">
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                        <Edit className="h-6 w-6 text-purple-600" />
                        Edit Supplier
                      </DialogTitle>

                      <DialogDescription className="text-gray-600">
                        Update the supplier information for {supplier.name}.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Supplier Name *
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Lead Time (days) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={editForm.leadTime}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                leadTime: parseInt(e.target.value) || 1,
                              }))
                            }
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Average delivery time in days
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsEditDialogOpen(false)}
                        className="flex items-center gap-2 flex-1 justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editForm.name.trim()}
                        className="flex items-center gap-2 flex-1 justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Supplier</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <button 
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-red-200/80 rounded-2xl shadow-xl">
                    <AlertDialogHeader className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-3 rounded-full">
                          <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-gray-800">
                          Delete Supplier
                        </AlertDialogTitle>
                      </div>

                      <AlertDialogDescription className="text-gray-600 text-base">
                        Are you sure you want to delete{" "}
                        <strong className="text-red-600">"{supplier.name}"</strong>?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <Trash2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <strong>Warning:</strong> This will permanently delete the
                          supplier and may affect associated products.
                        </div>
                      </div>
                    </div>

                    <AlertDialogFooter className="flex gap-3 pt-4">
                      <AlertDialogCancel className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3 font-medium transition-all duration-200">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSupplier}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl py-3 font-medium transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                      >
                        Delete Supplier
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Supplier</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </td>
      </tr>
    </>
  );
}