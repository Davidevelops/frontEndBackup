"use client";

import { Delivery } from "@/lib/types";
import {
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  Calendar,
  User,
  MapPin,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import UpdateDelivery from "./UpdateDelivery";
import DeleteDelivery from "./DeleteDelivery";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeliveryListProps {
  deliveries: Delivery[];
  onDeliveryUpdated: () => void;
}

const ITEMS_PER_PAGE = 10;

export default function DeliveryList({
  deliveries,
  onDeliveryUpdated,
}: DeliveryListProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [actionType, setActionType] = useState<"update" | "delete" | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  const totalItems = deliveries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliveries = deliveries.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          badgeColor: "bg-green-100 text-green-800 border-green-200",
          gradient: "from-green-500 to-green-600",
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-4 w-4" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          badgeColor: "bg-red-100 text-red-800 border-red-200",
          gradient: "from-red-500 to-red-600",
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-purple-700",
          badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
          gradient: "from-purple-500 to-purple-600",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleUpdate = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setActionType("update");
  };

  const handleDelete = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setActionType("delete");
  };

  const handleClose = () => {
    setSelectedDelivery(null);
    setActionType(null);
    onDeliveryUpdated();
  };

  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                All Deliveries
              </h2>
              <p className="text-gray-600 mt-1">
                Manage and track your delivery orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200">
            <Truck className="h-4 w-4" />
            <span className="font-semibold text-gray-800">
              {deliveries.length}
            </span>
            <span>deliveries</span>
          </div>
        </div>

        {/* Delivery Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xs border border-gray-100/80 mb-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100/80 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <Truck className="h-4 w-4 text-purple-600" />
                      Delivery
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Supplier
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      Items
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      Requested
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      Arrival
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
                {currentDeliveries.map((delivery) => (
                  <TableRow
                    key={delivery.id}
                    delivery={delivery}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    getStatusConfig={getStatusConfig}
                    formatDate={formatDate}
                  />
                ))}
              </tbody>
            </table>
          </div>

        
          {deliveries.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="border p-6 rounded-2xl bg-purple-50 border-purple-200 inline-block">
                  <div className="bg-white p-4 rounded-2xl w-20 h-20 mx-auto mb-6">
                    <Truck className="h-10 w-10 text-purple-600 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    No deliveries found
                  </h3>
                  <p className="text-gray-500 text-lg max-w-md mx-auto">
                    Get started by creating your first delivery order
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xs border border-gray-100/80">
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
                deliver{totalItems !== 1 ? "ies" : "y"}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronsLeft className="h-4 w-4 text-gray-600" />
                </button>

                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
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
                            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/25"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
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
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>

                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronsRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
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

        {selectedDelivery && actionType === "update" && (
          <UpdateDelivery
            delivery={selectedDelivery}
            onClose={handleClose}
            onDeliveryUpdated={onDeliveryUpdated}
          />
        )}

        {selectedDelivery && actionType === "delete" && (
          <DeleteDelivery
            delivery={selectedDelivery}
            onClose={handleClose}
            onDeliveryDeleted={onDeliveryUpdated}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

interface TableRowProps {
  delivery: Delivery;
  onUpdate: (delivery: Delivery) => void;
  onDelete: (delivery: Delivery) => void;
  getStatusConfig: (status: string) => any;
  formatDate: (dateString: string) => string;
}

function TableRow({ delivery, onUpdate, onDelete, getStatusConfig, formatDate }: TableRowProps) {
  const statusConfig = getStatusConfig(delivery.status);
  const totalItemsCount = delivery.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalProducts = delivery.items.length;

  return (
    <tr className="hover:bg-purple-50/30 transition-colors duration-200 group">
      <td className="py-4 px-6">
        <div className="flex items-center justify-center gap-3">
          <div className={`p-3 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
            {statusConfig.icon}
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
              Delivery #{delivery.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-6">
        <div className="flex justify-center">
          <span className="font-medium text-gray-800">
            {delivery.supplier.name}
          </span>
        </div>
      </td>
      
      <td className="py-4 px-6">
        <div className="flex flex-col items-center gap-1">
          <span className="font-semibold text-gray-800">
            {totalItemsCount} total
          </span>
          <span className="text-sm text-gray-500">
            {totalProducts} product{totalProducts !== 1 ? 's' : ''}
          </span>
        </div>
      </td>
      
      <td className="py-4 px-6">
        <div className="flex justify-center">
          <span className="text-sm text-gray-600">
            {formatDate(delivery.requestedAt)}
          </span>
        </div>
      </td>
      
      <td className="py-4 px-6">
        <div className="flex justify-center">
          {delivery.scheduledArrivalDate ? (
            <span className="text-sm text-gray-600">
              {formatDate(delivery.scheduledArrivalDate)}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Not scheduled</span>
          )}
        </div>
      </td>
      
      <td className="py-4 px-6">
        <div className="flex justify-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.badgeColor} flex items-center gap-2`}
          >
            {statusConfig.icon}
            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
          </span>
        </div>
      </td>
      
      <td className="py-4 px-6">
        <div className="flex items-center justify-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                
                  console.log('View delivery:', delivery.id);
                }}
                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
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
              <button
                onClick={() => onUpdate(delivery)}
                className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <Edit className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Delivery</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDelete(delivery)}
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Delivery</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}