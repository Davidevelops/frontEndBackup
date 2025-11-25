import { ChartLine, Lightbulb, BarChart, TrendingUp, Zap, PackageCheck, TrendingUpIcon, Shield, AlertCircle, Target, TrendingDown } from "lucide-react";
import { ForecastDialog } from "./ForecastDialog";

interface ForecastInsightsProps {
  product: any;
  forecastData: any[];
  forecastInsights: any;
  forecastTrend: any;
  hasEnoughSalesData: boolean;
  onOpenForecastDialog: () => void;
}

export function ForecastInsights({
  product,
  forecastData,
  forecastInsights,
  forecastTrend,
  hasEnoughSalesData,
  onOpenForecastDialog
}: ForecastInsightsProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#6366F1] p-2 rounded-lg">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#0F172A]">
            Forecast Insights & Recommendations
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            Easy-to-understand analysis and guidance for your business decisions
          </p>
        </div>
      </div>

      {forecastData.length === 0 ? (
        <div className="text-center py-8">
          <ChartLine className="h-12 w-12 text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B] text-lg mb-2">No forecast data available yet</p>
          <p className="text-[#64748B] text-sm mb-4 max-w-md mx-auto">
            {hasEnoughSalesData 
              ? "Generate a forecast to get personalized insights and recommendations for your product."
              : `This product has only ${product.salesData?.length || 0} sales records. For more accurate forecasting, we recommend having at least 30 sales records. You can still generate a forecast, but the predictions may be less reliable.`
            }
          </p>
          <button
            onClick={onOpenForecastDialog}
            className="bg-[#1E293B] hover:bg-[#0F172A] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            {hasEnoughSalesData ? "Generate Forecast" : "Generate Forecast Anyway"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Key Insights */}
          <div className="space-y-6">
            {/* Projected Sales */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="h-5 w-5 text-[#6366F1]" />
                <h4 className="font-semibold text-[#0F172A] text-lg">Projected Sales</h4>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <p className="text-sm text-[#64748B] mb-1">Daily</p>
                  <p className="text-xl font-bold text-[#0F172A]">
                    {forecastInsights.projectedSales.daily}
                  </p>
                  <p className="text-xs text-[#64748B]">units/day</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <p className="text-sm text-[#64748B] mb-1">Weekly</p>
                  <p className="text-xl font-bold text-[#0F172A]">
                    {forecastInsights.projectedSales.weekly}
                  </p>
                  <p className="text-xs text-[#64748B]">units/week</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                  <p className="text-sm text-[#64748B] mb-1">Monthly</p>
                  <p className="text-xl font-bold text-[#0F172A]">
                    {forecastInsights.projectedSales.monthly}
                  </p>
                  <p className="text-xs text-[#64748B]">units/month</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-[#1E40AF] leading-relaxed">
                  {forecastInsights.detailedExplanations.projectedSales.split('\n').map((line: string, index: number) => (
                    <span key={index}>
                      {line}
                      {index < forecastInsights.detailedExplanations.projectedSales.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Trend Summary */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-[#6366F1]" />
                <h4 className="font-semibold text-[#0F172A] text-lg">Sales Trend Analysis</h4>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                  forecastTrend.trend === 'up' 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : forecastTrend.trend === 'down'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {forecastTrend.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                  {forecastTrend.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                  <span className="capitalize">
                    {forecastTrend.trend} {Math.abs(forecastTrend.percentage)}%
                  </span>
                </div>
                <span className="text-sm text-[#64748B]">
                  {forecastTrend.strength} trend
                </span>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-[#1E40AF] leading-relaxed">
                  {forecastInsights.detailedExplanations.trend}
                </p>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]">
              <h4 className="font-semibold text-[#0F172A] text-lg mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Quick Summary
              </h4>
              <div className="space-y-3">
                {forecastInsights.keyTakeaways.map((takeaway: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-[#475569] leading-relaxed">{takeaway}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Details */}
          <div className="space-y-6">
            {/* Restock Recommendation */}
            <div className="bg-[#F0FDF4] rounded-lg p-5 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <PackageCheck className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-[#0F172A] text-lg">Restock Planning</h4>
                  <p className="text-sm text-[#64748B]">When to order more inventory</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200 mb-3">
                <p className="text-lg font-semibold text-[#166534] text-center">
                  {forecastInsights.restockDate.includes('URGENT') ? '🚨 ' : ''}
                  {forecastInsights.restockDate}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-[#166534] leading-relaxed">
                  {forecastInsights.detailedExplanations.restock}
                </p>
              </div>
            </div>

            {/* Peak Sales Period */}
            <div className="bg-[#F8FAFC] rounded-lg p-5 border border-[#E2E8F0]">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUpIcon className="h-6 w-6 text-[#6366F1]" />
                <div>
                  <h4 className="font-semibold text-[#0F172A] text-lg">Peak Sales Day</h4>
                  <p className="text-sm text-[#64748B]">Best day for promotions</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#E2E8F0] mb-3">
                <p className="text-lg font-semibold text-[#0F172A] text-center">
                  {forecastInsights.peakSalesPeriod}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-[#1E40AF] leading-relaxed">
                  {forecastInsights.detailedExplanations.peakSales}
                </p>
              </div>
            </div>

            {/* Confidence & Risk */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-[#E2E8F0] text-center">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-[#64748B] mb-1">Confidence Level</p>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  forecastInsights.confidenceLevel === 'High' ? 'bg-green-50 text-green-700 border border-green-200' :
                  forecastInsights.confidenceLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {forecastInsights.confidenceLevel}
                </div>
                <p className="text-xs text-[#64748B] mt-2 text-left">
                  {forecastInsights.confidenceDescription.split(': ')[1]}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#E2E8F0] text-center">
                <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-[#64748B] mb-1">Risk Level</p>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  forecastInsights.riskLevel === 'Low' ? 'bg-green-50 text-green-700 border border-green-200' :
                  forecastInsights.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {forecastInsights.riskLevel}
                </div>
                <p className="text-xs text-[#64748B] mt-2 text-left">
                  {forecastInsights.riskDescription.split(': ')[1]}
                </p>
              </div>
            </div>

            {/* Action Recommendation */}
            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]">
              <h4 className="font-semibold text-[#0F172A] text-lg mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Recommended Action
              </h4>
              <p className="text-sm text-[#475569] leading-relaxed bg-blue-50 rounded-lg p-4 border border-blue-100">
                {forecastInsights.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}