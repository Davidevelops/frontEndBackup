"use client";

import { useState, useEffect } from "react";
import { Delivery } from "@/lib/types";
import { X, AlertTriangle, Truck, Trash2 } from "lucide-react";
import { deleteDelivery } from "@/lib/data/routes/delivery/delivery";
import { createPortal } from "react-dom";

interface DeleteDeliveryProps {
  delivery: Delivery;
  onClose: () => void;
  onDeliveryDeleted: () => void;
}

export default function DeleteDelivery({
  delivery,
  onClose,
  onDeliveryDeleted,
}: DeleteDeliveryProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDelivery(delivery.id);
      onDeliveryDeleted();
      onClose();
    } catch (error) {
      console.error("Error deleting delivery:", error);
      alert("Failed to delete delivery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = delivery.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full animate-in fade-in-90 zoom-in-90">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-gray-700" />
            Delete Delivery
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 text-gray-700 bg-gray-100 p-4 rounded-lg mb-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Are you sure you want to delete this delivery? This action cannot
              be undone.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gray-200 p-2 rounded-lg">
                <Truck className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Delivery #{delivery.id.slice(0, 8)}
                </h4>
                <p className="text-sm text-gray-600">
                  {delivery.supplier.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    delivery.status === "completed"
                      ? "bg-gray-200 text-gray-800"
                      : delivery.status === "cancelled"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {delivery.status}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Items:</span>
                <span className="ml-2 font-medium text-gray-900">{totalItems}</span>
              </div>
              <div>
                <span className="text-gray-600">Products:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {delivery.items.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Requested:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(delivery.requestedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {loading ? "Deleting..." : "Delete Delivery"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}