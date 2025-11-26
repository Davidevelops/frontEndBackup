"use client";

import { useState, useEffect } from "react";
import { Recommendation, getRecommendations } from "@/lib/data/routes/recommendations/recommendations";
import { getProductList } from "@/lib/data/routes/product/product";
import { ProductGroup } from "@/lib/types";
import { AlertCircle, Clock, Package, TrendingUp, Info, RefreshCw, Calendar, Box, Clock4 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EnhancedRecommendation extends Recommendation {
  productName?: string;
  groupName?: string;
}

export default function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendationsWithProductData = async () => {
    try {
      setError(null);
      setRefreshing(true);
      
      const [recommendationsData, productGroups] = await Promise.all([
        getRecommendations(),
        getProductList()
      ]);

      if (!recommendationsData || !productGroups) {
        setError("Failed to load recommendations data");
        return;
      }

      const productMap = new Map<string, { productName: string; groupName: string }>();
      
      productGroups.forEach((group: ProductGroup) => {
        group.products?.forEach((product: any) => {
          productMap.set(product.id, {
            productName: product.name || "Unknown Product",
            groupName: group.name || "Unknown Group"
          });
        });
      });

      const enhancedRecommendations = recommendationsData.map(rec => ({
        ...rec,
        productName: productMap.get(rec.productId)?.productName || "Product Not Found",
        groupName: productMap.get(rec.productId)?.groupName || "Group Not Found"
      }));

      setRecommendations(enhancedRecommendations);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendationsWithProductData();
  }, []);

  const getStatusConfig = (status: Recommendation["status"]) => {
    const configs = {
      urgent: { 
        icon: AlertCircle, 
        color: "bg-red-50 border-red-200 text-red-800",
        badgeColor: "bg-red-100 text-red-800 hover:bg-red-100",
        text: "Urgent" 
      },
      critical: { 
        icon: AlertCircle, 
        color: "bg-orange-50 border-orange-200 text-orange-800",
        badgeColor: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        text: "Critical" 
      },
      warning: { 
        icon: Clock, 
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
        badgeColor: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        text: "Warning" 
      },
      good: { 
        icon: TrendingUp, 
        color: "bg-green-50 border-green-200 text-green-800",
        badgeColor: "bg-green-100 text-green-800 hover:bg-green-100",
        text: "Good" 
      }
    };
    
    return configs[status] || { 
      icon: Info, 
      color: "bg-blue-50 border-blue-200 text-blue-800",
      badgeColor: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      text: status 
    };
  };

  const handleRefresh = () => {
    fetchRecommendationsWithProductData();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Restocking Recommendations</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Restocking Recommendations</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="text-center py-6 text-gray-500">
          <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No restocking recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Restocking Recommendations</h2>
          <p className="text-sm text-gray-500">{recommendations.length} items need attention</p>
        </div>
        {/* <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button> */}
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation) => {
          const statusConfig = getStatusConfig(recommendation.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div
              key={recommendation.id}
              className={`border rounded-lg p-3 ${statusConfig.color}`}
            >
              <div className="flex items-start gap-3">
                <StatusIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-red-900 truncate">
                       Product: {recommendation.productName?.toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">Group: {recommendation.groupName}</p>
                    </div>
                    <Badge variant="secondary" className={statusConfig.badgeColor}>
                      {statusConfig.text}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-gray-400" />
                        <span>Restock: {recommendation.restockAmount} units</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock4 className="h-4 w-4 text-gray-400" />
                        <span>Lead time: {recommendation.leadTime} days</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Runs out: {new Date(recommendation.runsOutAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Restock by: {new Date(recommendation.restockAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}