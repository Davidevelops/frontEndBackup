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

const ITEMS_PER_PAGE = 10;

export default function SupplierList({ supplier, refresh }: supplierProp) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);


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

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);


  if (!supplier || supplier.length === 0) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="bg-[#1E293B] p-4 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#16A34A] border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-[#0F172A]">
                    Supplier Managements
                  </h1>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-[#475569] flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                      <Truck className="h-4 w-4 text-[#1E293B]" />
                      <span className="font-semibold text-[#0F172A]">0</span>{" "}
                      suppliers registered
                    </p>
                    <p className="text-[#475569] flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                      <BarChart3 className="h-4 w-4 text-[#334155]" />
                      <span className="font-semibold text-[#0F172A]">0</span>{" "}
                      total products
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-400 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                      <Plus className="h-5 w-5" />
                      Add Supplier
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-xl">
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#0F172A]">
                        <Users className="h-6 w-6 text-[#1E293B]" />
                        Add New Supplier
                      </DialogTitle>

                      <DialogDescription className="text-[#475569]">
                        Enter the details for the new supplier.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#334155]">
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
                          className="w-full px-3 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none transition-all duration-200"
                        />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#334155]">
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
                            className="w-full px-3 py-3 border border-[#CBD5E1] focus:outline-none rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                          />
                          <p className="text-xs text-[#64748B]">
                            Average delivery time in days
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsAddDialogOpen(false)}
                        className="flex items-center gap-2 flex-1 justify-center border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSupplier}
                        disabled={!newSupplier.name.trim()}
                        className="flex items-center gap-2 flex-1 justify-center bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
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

          {/* Empty State with Add Supplier Option */}
          <div className="bg-white rounded-xl p-12 border border-[#E2E8F0] text-center">
            <div className="bg-[#F1F5F9] p-4 rounded-xl w-20 h-20 mx-auto mb-6">
              <Truck className="h-10 w-10 text-[#64748B] mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-[#334155] mb-3">
              No Suppliers Found
            </h2>
            <p className="text-[#64748B] text-lg mb-8">
              There are no suppliers to display. Get started by adding your first supplier.
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200">
                  <Plus className="h-5 w-5" />
                  Add Your First Supplier
                </button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#F1F5F9] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="bg-[#1E293B] p-4 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#16A34A] border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-[#0F172A]">
                    Supplier Management
                  </h1>
                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-[#475569] flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                      <Truck className="h-4 w-4 text-[#1E293B]" />
                      <span className="font-semibold text-[#0F172A]">
                        {supplier.length}
                      </span>{" "}
                      supplier{supplier.length !== 1 ? "s" : ""} registered
                    </p>
                    <p className="text-[#475569] flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                      <BarChart3 className="h-4 w-4 text-[#334155]" />
                      <span className="font-semibold text-[#0F172A]">
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
                    <button className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-400 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                      <Plus className="h-5 w-5" />
                      Add Supplier
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-xl">
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#0F172A]">
                        <Users className="h-6 w-6 text-[#1E293B]" />
                        Add New Supplier
                      </DialogTitle>

                      <DialogDescription className="text-[#475569]">
                        Enter the details for the new supplier.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#334155]">
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
                          className="w-full px-3 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none transition-all duration-200"
                        />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#334155]">
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
                            className="w-full px-3 py-3 border border-[#CBD5E1] focus:outline-none rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                          />
                          <p className="text-xs text-[#64748B]">
                            Average delivery time in days
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsAddDialogOpen(false)}
                        className="flex items-center gap-2 flex-1 justify-center border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSupplier}
                        disabled={!newSupplier.name.trim()}
                        className="flex items-center gap-2 flex-1 justify-center bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
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

    
          {supplier && supplier.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#334155] mb-1">
                      Total Suppliers
                    </p>
                    <p className="text-3xl font-bold text-[#0F172A]">
                      {supplier.length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <Users className="h-6 w-6 text-[#1E293B]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#166534] mb-1">
                      Active Suppliers
                    </p>
                    <p className="text-3xl font-bold text-[#0F172A]">
                      {supplier.filter((sup) => !sup.deletedAt).length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-[#16A34A]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-6 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#334155] mb-1">
                      Avg Lead Time
                    </p>
                    <p className="text-3xl font-bold text-[#0F172A]">
                      {Math.round(
                        supplier.reduce((acc, sup) => acc + sup.leadTime, 0) /
                          supplier.length
                      )}{" "}
                      days
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-[#334155]" />
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-8">
            <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search suppliers by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none transition-all duration-200"
                />
              </div>
              <button className="flex items-center gap-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:border-[#94A3B8]">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] mb-8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                      <div className="flex items-center justify-center gap-2">
                    
                        Supplier
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                      <div className="flex items-center justify-center gap-2">
                     
                        Lead Time
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                      <div className="flex items-center justify-center gap-2">
              
                        Products
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                      <div className="flex items-center justify-center gap-2">
               
                        Last Updated
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                      Status
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-[#334155]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {currentSuppliers.map((sup, index) => (
                    <TableRow
                      key={sup.id}
                      supplier={sup}
                      router={router}
                      onCopyId={handleCopyId}
                      isCopied={copiedId === sup.id}
                      refresh={refresh}
                      onViewDetails={handleViewDetails}
                      rowIndex={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>

  
            {filteredSuppliers.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <div className="max-w-2xl mx-auto">
                  <div className="border p-6 rounded-xl bg-[#F8FAFC] border-[#E2E8F0] inline-block">
                    <div className="bg-white p-4 rounded-xl w-20 h-20 mx-auto mb-6">
                      <Truck className="h-10 w-10 text-[#64748B] mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F172A] mb-3">
                      No suppliers found
                    </h2>
                    <p className="text-[#64748B] mb-8 text-lg">
                      Try adjusting your search terms
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>


          {totalPages > 1 && (
            <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-[#64748B]">
                  Showing{" "}
                  <span className="font-semibold text-[#0F172A]">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#0F172A]">
                    {totalItems}
                  </span>{" "}
                  supplier{totalItems !== 1 ? "s" : ""}
                </div>

                <div className="flex items-center gap-2">
        
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronsLeft className="h-4 w-4 text-[#64748B]" />
                  </button>

    
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 text-[#64748B]" />
                  </button>

           
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
                              ? "bg-[#1E293B] text-white border-[#1E293B]"
                              : "border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4 text-[#64748B]" />
                  </button>

         
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronsRight className="h-4 w-4 text-[#64748B]" />
                  </button>
                </div>

           
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#64748B]">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-[#64748B]">per page</span>
                </div>
              </div>
            </div>
          )}

         
          {selectedSupplier && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full border border-[#E2E8F0] mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#1E293B] p-3 rounded-lg">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A]">
                    {selectedSupplier.name}
                  </h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Supplier ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-[#F1F5F9] px-2 py-1 rounded border">
                        {selectedSupplier.id}
                      </span>
                      <button
                        onClick={() => handleCopyId(selectedSupplier.id)}
                        className="flex items-center gap-1 text-xs text-[#1E293B] hover:text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2 py-1 rounded border border-[#CBD5E1] transition-colors"
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
                  <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Lead Time:</span>
                    <span className="font-medium text-[#0F172A]">
                      {selectedSupplier.leadTime} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Products:</span>
                    <span className="font-medium text-[#0F172A]">
                      {selectedSupplier.products?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Created:</span>
                    <span className="font-medium text-[#0F172A]">
                      {new Date(selectedSupplier.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#64748B]">Last Updated:</span>
                    <span className="font-medium text-[#0F172A]">
                      {new Date(selectedSupplier.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="mt-8 w-full bg-[#1E293B] hover:bg-[#0F172A] text-white py-3.5 rounded-lg font-semibold transition-all duration-200"
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
  rowIndex,
}: {
  supplier: Supplier;
  router: any;
  onCopyId: (id: string) => void;
  isCopied: boolean;
  refresh: () => Promise<void>;
  onViewDetails: (supplier: Supplier) => void;
  rowIndex: number;
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
        <span className="inline-flex items-center gap-1 bg-[#F0FDF4] text-[#166534] px-2.5 py-1 rounded-full text-xs font-medium border border-[#BBF7D0]">
          <div className="h-1.5 w-1.5 bg-[#16A34A] rounded-full"></div>
          Fast Delivery
        </span>
      );
    } else if (leadTime <= 7) {
      return (
        <span className="inline-flex items-center gap-1 bg-[#FEFCE8] text-[#854D0E] px-2.5 py-1 rounded-full text-xs font-medium border border-[#FEF08A]">
          <div className="h-1.5 w-1.5 bg-[#EAB308] rounded-full"></div>
          Standard Delivery
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-[#FEF2F2] text-[#991B1B] px-2.5 py-1 rounded-full text-xs font-medium border border-[#FECACA]">
          <div className="h-1.5 w-1.5 bg-[#DC2626] rounded-full"></div>
          Slow Delivery
        </span>
      );
    }
  };

  return (
    <>
      <tr className={`transition-colors duration-200 group ${
        rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
      } hover:bg-[#F1F5F9]`}>
        <td className="py-4 px-6">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-[#F1F5F9] p-2 rounded-lg">
              <Truck className="h-4 w-4 text-[#334155]" />
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <h3 className="font-semibold text-[#0F172A] group-hover:text-[#1E293B] transition-colors duration-200">
                  {supplier.name.toUpperCase()}
                </h3>
                {supplier.deletedAt && (
                  <span className="text-xs bg-[#FEF2F2] text-[#DC2626] px-2 py-1 rounded-full border border-[#FECACA]">
                    Inactive
                  </span>
                )}
              </div>
              <button
                onClick={() => onCopyId(supplier.id)}
                className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#1E293B] transition-colors duration-200 group/copy mt-1 justify-center"
              >
                <span className="font-mono bg-[#F1F5F9] px-1.5 py-0.5 rounded border">
                  ID: {supplier.id.slice(0, 8)}...
                </span>
                {isCopied ? (
                  <Check className="h-3 w-3 text-[#16A34A]" />
                ) : (
                  <Copy className="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                )}
              </button>
            </div>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-[#0F172A]">
              {supplier.leadTime}
            </span>
            <span className="text-sm text-[#64748B]">days</span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-[#0F172A]">{productCount}</span>
            <span className="text-sm text-[#64748B]">
              product{productCount !== 1 ? "s" : ""}
            </span>
          </div>
        </td>
        <td className="py-4 px-6">
          <div className="flex justify-center">
            <span className="text-sm text-[#64748B]">
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
          <div className="flex items-center justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/dashboard/supplier/${supplier.id}`}
                  className="flex items-center gap-2 bg-purple-100 hover:purple-200 text-purple-700 border border-purple-400 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <BarChart3 className="h-4 w-4" />
                Add Associate Product
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1E293B] text-white border-0">
                <div className="text-center">
                  <p className="font-semibold">Full Details</p>
                  <p className="text-xs text-[#CBD5E1] mt-1">View complete supplier page with products</p>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Edit Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <button 
                      className="flex items-center gap-2 border border-green-400 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] hover:text-[#15803D] px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-xl">
                    <DialogHeader className="space-y-4">
                      <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#0F172A]">
                        <Edit className="h-6 w-6 text-[#1E293B]" />
                        Edit Supplier
                      </DialogTitle>

                      <DialogDescription className="text-[#475569]">
                        Update the supplier information for {supplier.name}.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#334155]">
                            Supplier Name *
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="w-full px-3 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#334155]">
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
                            className="w-full px-3 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#1E293B] focus:border-transparent transition-all duration-200"
                          />
                          <p className="text-xs text-[#64748B]">
                            Average delivery time in days
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsEditDialogOpen(false)}
                        className="flex items-center gap-2 flex-1 justify-center border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editForm.name.trim()}
                        className="flex items-center gap-2 flex-1 justify-center bg-[#1E293B] hover:bg-[#0F172A] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1E293B] text-white border-0">
                <div className="text-center">
                  <p className="font-semibold">Edit Supplier</p>
                  <p className="text-xs text-[#CBD5E1] mt-1">Update supplier name and lead time</p>
                </div>
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
                      className="flex items-center gap-2 border border-red-400 bg-[#FEF2F2] hover:bg-[#FECACA] text-[#DC2626] hover:text-[#B91C1C] px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border border-[#FECACA] rounded-xl">
                    <AlertDialogHeader className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#FEF2F2] p-3 rounded-full">
                          <Trash2 className="h-6 w-6 text-[#DC2626]" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-[#0F172A]">
                          Delete Supplier
                        </AlertDialogTitle>
                      </div>

                      <AlertDialogDescription className="text-[#475569] text-base">
                        Are you sure you want to delete{" "}
                        <strong className="text-[#DC2626]">"{supplier.name}"</strong>?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <Trash2 className="h-5 w-5 text-[#DC2626] mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-[#DC2626]">
                          <strong>Warning:</strong> This will permanently delete the
                          supplier and may affect associated products.
                        </div>
                      </div>
                    </div>

                    <AlertDialogFooter className="flex gap-3 pt-4">
                      <AlertDialogCancel className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] rounded-lg py-3 font-medium transition-all duration-200">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSupplier}
                        className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg py-3 font-medium transition-all duration-200"
                      >
                        Delete Supplier
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1E293B] text-white border-0">
                <div className="text-center">
                  <p className="font-semibold">Delete Supplier</p>
                  <p className="text-xs text-[#CBD5E1] mt-1">Permanently remove this supplier</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </td>
      </tr>
    </>
  );
}