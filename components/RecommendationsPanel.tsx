
import { useState, useEffect } from "react";
import { Recommendation } from "@/lib/data/routes/recommendations/recommendations";
import { getRecommendations } from "@/lib/data/routes/recommendations/recommendations";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw } from "lucide-react";

interface RecommendationsPanelProps {
  className?: string;
}

export default function RecommendationsPanel({ className = "" }: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setRefreshing(true);
      const data = await getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getStatusIcon = (status: Recommendation["status"]) => {
    switch (status) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "critical":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "warning":
        return <Info className="h-4 w-4 text-yellow-500" />;
      case "good":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Recommendation["status"]) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium capitalize";
    
    switch (status) {
      case "urgent":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case "critical":
        return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`;
      case "warning":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case "good":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 py-3 animate-pulse">
                <div className="col-span-3">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-14 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-14 bg-gray-200 rounded"></div>
                </div>
                <div className="col-span-1">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Recommendations</h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">No recommendations available</div>
          <div className="text-sm text-gray-500">All inventory levels are optimal</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Inventory Recommendations</h3>
            <p className="text-sm text-gray-600 mt-1">
              {recommendations.length} item{recommendations.length !== 1 ? 's' : ''} needing attention
            </p>
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={refreshing}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

     
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restock Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coverage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Runs Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restock By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recommendations.map((recommendation) => (
              <tr 
                key={recommendation.id} 
                className="hover:bg-gray-50 transition-colors"
              >
               
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(recommendation.status)}
                    <span className={getStatusBadge(recommendation.status)}>
                      {recommendation.status}
                    </span>
                  </div>
                </td>

             
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {recommendation.restockAmount}
                  </div>
                </td>

               
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {recommendation.leadTime} days
                  </div>
                </td>

             
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {recommendation.coverageDays} days
                  </div>
                </td>

          
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(recommendation.runsOutAt)}
                  </div>
                </td>

             
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(recommendation.restockAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {recommendations.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span>Urgent: {recommendations.filter(r => r.status === 'urgent').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-orange-500" />
                <span>Critical: {recommendations.filter(r => r.status === 'critical').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3 text-yellow-500" />
                <span>Warning: {recommendations.filter(r => r.status === 'warning').length}</span>
              </div>
            </div>
            <div className="text-xs">
              Showing all {recommendations.length} items
            </div>
          </div>
        </div>
      )}
    </div>
  );
}