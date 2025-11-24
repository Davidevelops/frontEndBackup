import { SingleProduct } from "@/lib/types";
import { ChartLine, PackageCheck, BarChart, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricsCardsProps {
  product: SingleProduct;
  metrics: {
    totalSales: number;
    salesChange: number;
    forecastAccuracy: number;
    stockStatus: string;
    stockChange: number;
  };
  salesDataLength: number;
  hasEnoughSalesData: boolean;
  forecastTrend: {
    trend: string;
    percentage: number;
    strength: string;
  };
}

export function MetricsCards({ 
  product, 
  metrics, 
  salesDataLength, 
  hasEnoughSalesData, 
  forecastTrend 
}: MetricsCardsProps) {

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4" />;
      case 'down':
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Sales */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[#64748B] text-sm font-medium mb-1">
              Total Sales
            </p>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              {metrics.totalSales.toLocaleString()}
            </h2>
          </div>
          <div className="bg-[#F1F5F9] p-2 rounded-lg">
            <ChartLine className="h-6 w-6 text-[#334155]" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {metrics.salesChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-[#16A34A]" />
          ) : (
            <TrendingDown className="h-4 w-4 text-[#DC2626]" />
          )}
          <span
            className={
              metrics.salesChange >= 0
                ? "text-[#16A34A] font-medium"
                : "text-[#DC2626] font-medium"
            }
          >
            {metrics.salesChange >= 0 ? "+" : ""}
            {metrics.salesChange}%
          </span>
          <span className="text-[#64748B]">since last period</span>
        </div>
      </div>

      {/* Current Stock */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[#64748B] text-sm font-medium mb-1">
              Current Stock
            </p>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              {product.stock.toLocaleString()}
            </h2>
          </div>
          <div className="bg-[#F1F5F9] p-2 rounded-lg">
            <PackageCheck className="h-6 w-6 text-[#334155]" />
          </div>
        </div>
        <div className="text-sm text-[#64748B]">
          Safety stock: {product.safetyStock}
        </div>
      </div>

      {/* Sales Records Count */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[#64748B] text-sm font-medium mb-1">
              Sales Records
            </p>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              {salesDataLength}
            </h2>
          </div>
          <div className={`p-2 rounded-lg ${
            hasEnoughSalesData ? 'bg-[#F0FDF4]' : 'bg-amber-50'
          }`}>
            <BarChart className="h-6 w-6 text-[#334155]" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {hasEnoughSalesData ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[#16A34A] font-medium">Sufficient data</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-amber-600 font-medium">
                {30 - salesDataLength} more needed
              </span>
            </>
          )}
        </div>
      </div>

      {/* Forecast Trend */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] hover:shadow-sm transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[#64748B] text-sm font-medium mb-1">
              Forecast Trend
            </p>
            <h2 className="text-2xl font-bold text-[#0F172A] capitalize">
              {forecastTrend.trend}
            </h2>
          </div>
          <div className={`p-2 rounded-lg ${
            forecastTrend.trend === 'up' ? 'bg-[#F0FDF4]' : 
            forecastTrend.trend === 'down' ? 'bg-[#FEF2F2]' : 'bg-[#F8FAFC]'
          }`}>
            {getTrendIcon(forecastTrend.trend)}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={forecastTrend.trend === 'up' ? "text-[#16A34A] font-medium" : forecastTrend.trend === 'down' ? "text-[#DC2626] font-medium" : "text-[#64748B] font-medium"}>
            {forecastTrend.percentage > 0 ? "+" : ""}{forecastTrend.percentage}%
          </span>
          <span className="text-[#64748B]">change predicted</span>
        </div>
      </div>
    </div>
  );
}