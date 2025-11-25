"use client";

import { useState, useEffect } from "react";
import {
  Delivery,
  UpdateDeliveryStatusData,
  UpdateDeliveryScheduleData,
} from "@/lib/types";
import { X, Calendar, Clock, Save, RotateCcw } from "lucide-react";
import {
  updateDeliveryStatus,
  updateDeliverySchedule,
} from "@/lib/data/routes/delivery/delivery";
import { createPortal } from "react-dom";

interface UpdateDeliveryProps {
  delivery: Delivery;
  onClose: () => void;
  onDeliveryUpdated: () => void;
}

export default function UpdateDelivery({
  delivery,
  onClose,
  onDeliveryUpdated,
}: UpdateDeliveryProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "schedule">("status");
  const [formData, setFormData] = useState({
    status: delivery.status,
    cancelledAt: delivery.cancelledAt || new Date().toISOString().split("T")[0],
    requestedAt: delivery.requestedAt.split("T")[0],
    scheduledArrivalDate: delivery.scheduledArrivalDate?.split("T")[0] || "",
  });

  useEffect(() => {
    setMounted(true);
   
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === "status") {
        const updateData: UpdateDeliveryStatusData = {
          status: formData.status,
        };

     
        if (formData.status === "cancelled") {
          updateData.cancelledAt = formData.cancelledAt;
        }

        console.log("Updating delivery status:", {
          deliveryId: delivery.id,
          currentStatus: delivery.status,
          newStatus: formData.status,
          updateData
        });

     
        await updateDeliveryStatus(delivery.id, updateData);
        
      } else {
        const scheduleData: UpdateDeliveryScheduleData = {
          requestedAt: formData.requestedAt,
          scheduledArrivalDate: formData.scheduledArrivalDate,
        };
        
        console.log("Updating delivery schedule:", {
          deliveryId: delivery.id,
          scheduleData
        });
        
        await updateDeliverySchedule(delivery.id, scheduleData);
      }

      console.log("Update successful, refreshing deliveries...");
      onDeliveryUpdated();
      onClose();
      
    } catch (error: any) {
      console.error("Error updating delivery:", error);
  
      if (error.response) {
       
        const errorMessage = error.response.data?.message || error.response.statusText;
        alert(`Failed to update delivery: ${errorMessage}`);
      } else if (error.request) {
      
        alert("Failed to update delivery: Network error. Please check your connection.");
      } else {
      
        alert("Failed to update delivery. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-90">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-gray-700" />
            Update Delivery
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
         
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === "status"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-300"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              <Clock className="h-4 w-4" />
              Status
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeTab === "schedule"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-300"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "status" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">
                    Current status: <span className="font-medium text-gray-900">{delivery.status}</span>
                  </p>
                </div>

                {formData.status === "cancelled" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      Cancellation Date
                    </label>
                    <input
                      type="date"
                      value={formData.cancelledAt}
                      onChange={(e) =>
                        handleChange("cancelledAt", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === "schedule" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    Requested Date
                  </label>
                    <input
                      type="date"
                      value={formData.requestedAt}
                      onChange={(e) =>
                        handleChange("requestedAt", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                      required
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    Scheduled Arrival
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledArrivalDate}
                    onChange={(e) =>
                      handleChange("scheduledArrivalDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Updating..." : "Update Delivery"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}