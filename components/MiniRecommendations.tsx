"use client";

import { useState, useEffect } from "react";
import { Recommendation, getRecommendations } from "@/lib/data/routes/recommendations/recommendations";
import { getProductList } from "@/lib/data/routes/product/product";
import { ProductGroup } from "@/lib/types";
import { AlertCircle, Clock, TrendingUp, Info, ChevronDown, ChevronUp } from "lucide-react";

interface EnhancedRecommendation extends Recommendation {
  productName?: string;
  groupName?: string;
}

interface MiniRecommendationsPanelProps {
  supplierId: string | null;
}

export default function MiniRecommendationsPanel({ supplierId }: MiniRecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchSupplierRecommendations = async () => {
    if (!supplierId) {
      setRecommendations([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [recommendationsData, productGroups] = await Promise.all([
        getRecommendations(),
        getProductList()
      ]);

      if (!recommendationsData || !productGroups) {
        setError("Failed to load recommendations");
        return;
      }

      // Create product map for lookup
      const productMap = new Map<string, { productName: string; groupName: string }>();
      
      productGroups.forEach((group: ProductGroup) => {
        group.products?.forEach((product: any) => {
          productMap.set(product.id, {
            productName: product.name || "Unknown Product",
            groupName: group.name || "Unknown Group"
          });
        });
      });

      // Filter recommendations for the selected supplier and enhance with product data
      const supplierRecommendations = recommendationsData
        .filter(rec => rec.supplierId === supplierId)
        .map(rec => ({
          ...rec,
          productName: productMap.get(rec.productId)?.productName || "Product Not Found",
          groupName: productMap.get(rec.productId)?.groupName || "Group Not Found"
        }));

      setRecommendations(supplierRecommendations);
    } catch (err) {
      console.error("Error fetching supplier recommendations:", err);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierRecommendations();
  }, [supplierId]);

  const getStatusConfig = (status: Recommendation["status"]) => {
    const configs = {
      urgent: { 
        icon: AlertCircle, 
        color: "text-red-600",
        bgColor: "bg-red-50",
        text: "Urgent" 
      },
      critical: { 
        icon: AlertCircle, 
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        text: "Critical" 
      },
      warning: { 
        icon: Clock, 
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        text: "Warning" 
      },
      good: { 
        icon: TrendingUp, 
        color: "text-green-600",
        bgColor: "bg-green-50",
        text: "Good" 
      }
    };
    
    return configs[status] || { 
      icon: Info, 
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      text: status 
    };
  };

  if (!supplierId) {
    return null;
  }

  if (loading) {
    return (
      <div className="border rounded-lg p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Restocking Recommendations</h4>
          <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border animate-pulse">
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <div className="h-3 w-24 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Restocking Recommendations</h4>
        </div>
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="border rounded-lg p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Restocking Recommendations</h4>
        </div>
        <p className="text-xs text-gray-500">No recommendations for this supplier</p>
      </div>
    );
  }

  const displayedRecommendations = isExpanded ? recommendations : recommendations.slice(0, 2);

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">
          Restocking Recommendations ({recommendations.length})
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Show all <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>

      <div className="space-y-2">
        {displayedRecommendations.map((recommendation) => {
          const statusConfig = getStatusConfig(recommendation.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div
              key={recommendation.id}
              className={`p-2 rounded border text-xs ${statusConfig.bgColor}`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1">
                  <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                  <span className="font-medium text-gray-900">
                    {recommendation.productName}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusConfig.color} bg-white`}>
                  {statusConfig.text}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                <div>
                  <span className="font-medium">Qty:</span> {recommendation.restockAmount}
                </div>
                <div>
                  <span className="font-medium">Runs out:</span> {new Date(recommendation.runsOutAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Restock by:</span> {new Date(recommendation.restockAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Lead:</span> {recommendation.leadTime}d
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recommendations.length > 2 && (
        <div className="mt-2 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? `Show less` : `+${recommendations.length - 2} more`}
          </button>
        </div>
      )}
    </div>
  );
}