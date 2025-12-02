import { AlertCircle, BarChart, ChartLine, Lightbulb, PackageCheck, Shield, Target, TrendingDown, TrendingUp, TrendingUpIcon, Zap } from "lucide-react";

interface ForecastInsightsProps {
  product: any;
  forecastData: any[];
  forecastInsights: any;
  forecastTrend: any;
  hasEnoughSalesData: boolean;
  onOpenForecastDialog: () => void;
  productName: string;
}

// Helper function to get styling based on restock status
const getRestockStyle = (status: string) => {
  switch (status) {
    case 'urgent':
      return {
        containerBg: 'bg-red-50',
        containerBorder: 'border-red-300',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        innerBg: 'bg-red-100',
        innerBorder: 'border-red-300',
        accentBg: 'bg-red-200',
        accentText: 'text-red-900',
        badgeBg: 'bg-red-600',
        badgeText: 'text-white',
        stepBg: 'bg-red-100',
        stepText: 'text-red-700'
      };
    case 'warning':
      return {
        containerBg: 'bg-amber-50',
        containerBorder: 'border-amber-300',
        textColor: 'text-amber-800',
        iconColor: 'text-amber-600',
        innerBg: 'bg-amber-100',
        innerBorder: 'border-amber-300',
        accentBg: 'bg-amber-200',
        accentText: 'text-amber-900',
        badgeBg: 'bg-amber-600',
        badgeText: 'text-white',
        stepBg: 'bg-amber-100',
        stepText: 'text-amber-700'
      };
    case 'healthy':
    default:
      return {
        containerBg: 'bg-green-50',
        containerBorder: 'border-green-300',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        innerBg: 'bg-green-100',
        innerBorder: 'border-green-300',
        accentBg: 'bg-green-200',
        accentText: 'text-green-900',
        badgeBg: 'bg-green-600',
        badgeText: 'text-white',
        stepBg: 'bg-green-100',
        stepText: 'text-green-700'
      };
  }
};

export function ForecastInsights({
  product,
  forecastData,
  forecastInsights,
  forecastTrend,
  hasEnoughSalesData,
  onOpenForecastDialog,
  productName
}: ForecastInsightsProps) {
  const restockStyle = getRestockStyle(forecastInsights.restockStatus || 'healthy');
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Forecast insights based on the results for product: {productName.toUpperCase()} </h1>
              <p className="text-gray-600">Step-by-step analysis and actionable recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {forecastData.length === 0 ? (
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 inline-block mb-6">
                <ChartLine className="h-20 w-20 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Generate Insights</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
                {hasEnoughSalesData 
                  ? `Unlock detailed forecast analysis, trend insights, and inventory recommendations for ${productName}.`
                  : `Start forecasting for ${productName} with ${product.salesData?.length || 0} available sales records.`
                }
              </p>
              <button
                onClick={onOpenForecastDialog}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-400 px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {hasEnoughSalesData ? `Generate ${productName} Forecast` : `Generate Forecast`}
              </button>
              {!hasEnoughSalesData && (
                <p className="text-gray-500 mt-6 text-sm">
                  For optimal accuracy, we recommend having at least 30 sales records
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8">
        
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 text-indigo-700 font-bold rounded-full w-8 h-8 flex items-center justify-center">1</div>
              <h2 className="text-xl font-bold text-gray-900">Current Performance Analysis</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Sales Volume Projections</h3>
                  <BarChart className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-2xl font-bold text-gray-900 text-center mb-1">{forecastInsights.projectedSales.daily}</p>
                    <p className="text-sm text-gray-600 text-center">Daily Sold Product</p>
                    <p className="text-xs text-gray-500 text-center mt-1">Average per day</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-2xl font-bold text-gray-900 text-center mb-1">{forecastInsights.projectedSales.weekly}</p>
                    <p className="text-sm text-gray-600 text-center">Weekly Sold Product</p>
                    <p className="text-xs text-gray-500 text-center mt-1">Average per week</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-2xl font-bold text-gray-900 text-center mb-1">{forecastInsights.projectedSales.monthly}</p>
                    <p className="text-sm text-gray-600 text-center">Monthly Sold Product</p>
                    <p className="text-xs text-gray-500 text-center mt-1">Average per month</p>
                  </div>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    {forecastInsights.detailedExplanations.projectedSales}
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    forecastTrend.trend === 'up' 
                      ? 'bg-green-100 text-green-700'
                      : forecastTrend.trend === 'down'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {forecastTrend.trend === 'up' && <TrendingUp className="h-5 w-5" />}
                    {forecastTrend.trend === 'down' && <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Trend Direction</h3>
                    <p className="text-sm text-gray-600">Sales momentum</p>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-gray-900 mb-1">{Math.abs(forecastTrend.percentage)}%</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    forecastTrend.trend === 'up' 
                      ? 'bg-green-100 text-green-800'
                      : forecastTrend.trend === 'down'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {forecastTrend.trend === 'up' ? 'Increasing' : 'Decreasing'} ({forecastTrend.strength})
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {forecastInsights.detailedExplanations.trend}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`${restockStyle.stepBg} ${restockStyle.stepText} font-bold rounded-full w-8 h-8 flex items-center justify-center`}>2</div>
              <h2 className="text-xl font-bold text-gray-900">Strategic Timing Opportunities</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`rounded-xl p-6 border ${restockStyle.containerBg} ${restockStyle.containerBorder}`}>
                <div className="flex items-center gap-3 mb-4">
                  <PackageCheck className={`h-6 w-6 ${restockStyle.iconColor}`} />
                  <div>
                    <h3 className={`font-bold text-lg ${restockStyle.textColor}`}>
                      Inventory Restock Date
                    </h3>
                    <p className={`text-sm ${restockStyle.textColor} opacity-90`}>
                      {forecastInsights.restockStatus === 'urgent' ? 'Immediate action required' : 
                       forecastInsights.restockStatus === 'warning' ? 'Plan ahead for optimal timing' : 
                       'Healthy stock levels - monitor regularly'}
                    </p>
                  </div>
                </div>
                
                <div className={`rounded-xl p-5 border mb-4 ${restockStyle.innerBg} ${restockStyle.innerBorder}`}>
                  <div className="text-center">
                    <div className={`inline-block px-4 py-2 rounded-full mb-3 ${restockStyle.badgeBg}`}>
                      <span className={`text-sm font-semibold ${restockStyle.badgeText}`}>
                        {forecastInsights.restockStatus === 'urgent' ? '🚨 URGENT ACTION NEEDED' : 
                         forecastInsights.restockStatus === 'warning' ? '⚠️ PLAN RESTOCK SOON' : 
                         '✅ HEALTHY STOCK LEVELS'}
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${restockStyle.textColor} mb-2`}>
                      {forecastInsights.restockDate}
                    </p>
                    <p className={`text-sm ${restockStyle.textColor} opacity-90`}>
                      Recommended date for {productName} inventory
                    </p>
                  </div>
                </div>
                
                <div className={`rounded-lg p-4 border ${restockStyle.innerBg} ${restockStyle.innerBorder}`}>
                  <p className={`text-sm ${restockStyle.textColor} leading-relaxed`}>
                    {forecastInsights.detailedExplanations.restock}
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUpIcon className="h-6 w-6 text-amber-600" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Peak Sales Period</h3>
                    <p className="text-gray-600">Best promotional timing</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-amber-300 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 mb-2">{forecastInsights.peakSalesPeriod}</p>
                    <p className="text-sm text-gray-600">Optimal day for {productName} promotions</p>
                  </div>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    {forecastInsights.detailedExplanations.peakSales}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 text-amber-700 font-bold rounded-full w-8 h-8 flex items-center justify-center">3</div>
              <h2 className="text-xl font-bold text-gray-900">Forecast Quality Assessment</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Confidence Level</h3>
                    <p className="text-gray-600">Forecast reliability assessment</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                    forecastInsights.confidenceLevel === 'High' 
                      ? 'bg-green-100 text-green-800'
                      : forecastInsights.confidenceLevel === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {forecastInsights.confidenceLevel}
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    {forecastInsights.confidenceDescription}
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Risk Level</h3>
                    <p className="text-gray-600">Potential business exposure</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                    forecastInsights.riskLevel === 'Low' 
                      ? 'bg-green-100 text-green-800'
                      : forecastInsights.riskLevel === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {forecastInsights.riskLevel}
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    {forecastInsights.riskDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 flex items-center justify-center">4</div>
              <h2 className="text-xl font-bold text-gray-900">Actionable Insights & Recommendations</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-amber-500" />
                  <h3 className="font-bold text-gray-900 text-lg">Key Insights Summary</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forecastInsights.keyTakeaways.map((takeaway: string, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-800">{takeaway}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-indigo-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Priority Action</h3>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-indigo-300 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">Recommended Action</p>
                    <p className="text-sm text-gray-600 mt-1">For product: {productName.toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {forecastInsights.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}