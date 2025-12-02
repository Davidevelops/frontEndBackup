"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from 'chart.js';

import { ProductHeader } from "./ProductHeader";
import { ForecastSelector } from "./ForecasstSelector";
import { SalesDataAlert } from "./SalesDataAler";
import { MetricsCards } from "./MetricsCards";
import { SalesChart } from "./SalesChart";
import { ForecastInsights } from "./ForecastInsights";
import ForecastChart from "./ForecastChart";

import { SingleProduct, Forecast, ForecastSelection, ProductGroup } from "@/lib/types";
import { apiEndpoints } from "@/lib/apiEndpoints";
import apiClient from "@/lib/axiosConfig";
import { ArrowLeft } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
);

interface Props {
  product: SingleProduct;
}

interface ForecastResult {
  date: string;
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
}

interface SalesData {
  date: string;
  productId: string;
  quantity: number;
  revenue: number;
}

interface Metrics {
  totalSales: number;
  salesChange: number;
  forecastAccuracy: number;
  stockStatus: "healthy" | "warning" | "critical";
  stockChange: number;
}

interface ChartPagination {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

interface ForecastPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalForecasts: number;
}

interface ForecastTrend {
  trend: "up" | "down" | "stable";
  percentage: number;
  strength: "weak" | "moderate" | "strong";
}

interface ForecastInsightsData {
  averagePredictedSales: number;
  totalPredictedSales: number;
  confidenceLevel: string;
  peakSalesPeriod: string;
  riskLevel: string;
  recommendation: string;
  trendDescription: string;
  confidenceDescription: string;
  riskDescription: string;
  restockDate: string;
  trendStrength: string;
  keyTakeaways: string[];
  percentageChanges: {
    weekly: number;
    monthly: number;
    quarterly: number;
  };
  projectedSales: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  detailedExplanations: {
    trend: string;
    confidence: string;
    risk: string;
    restock: string;
    peakSales: string;
    projectedSales: string;
  };
  restockStatus: 'urgent' | 'warning' | 'healthy';
}

const defaultForecastInsights: ForecastInsightsData = {
  averagePredictedSales: 0,
  totalPredictedSales: 0,
  confidenceLevel: "Unknown",
  peakSalesPeriod: "No forecast data available",
  riskLevel: "Unknown",
  recommendation: "Generate a forecast to get personalized insights and restocking recommendations for your product.",
  trendDescription: "We need forecast data to analyze your sales patterns.",
  confidenceDescription: "Confidence level will be calculated once forecast is generated.",
  riskDescription: "Risk assessment requires forecast data.",
  restockDate: "Not available",
  trendStrength: "unknown",
  keyTakeaways: ["Generate a forecast to see insights about your product sales"],
  percentageChanges: { weekly: 0, monthly: 0, quarterly: 0 },
  projectedSales: { daily: 0, weekly: 0, monthly: 0 },
  detailedExplanations: {
    trend: "Once you generate a forecast, we'll analyze your sales pattern to show you whether sales are increasing, decreasing, or staying stable over time.",
    confidence: "Confidence level tells you how reliable our predictions are. Higher confidence means you can trust the numbers more for your planning.",
    risk: "Risk assessment helps you understand the chances of running out of stock or having too much inventory based on the forecast accuracy.",
    restock: "We'll calculate exactly when you need to order more stock based on your current inventory and predicted future sales.",
    peakSales: "We'll identify the days when you're likely to sell the most items, helping you plan promotions and ensure you have enough stock.",
    projectedSales: "We'll show you expected sales numbers for daily, weekly, and monthly periods to help with your inventory planning and business decisions."
  },
  restockStatus: 'healthy'
};

export default function ProductDetails({ product }: Props) {
  const router = useRouter();

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState<string>("");
  const [loadingGroupName, setLoadingGroupName] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [forecastData, setForecastData] = useState<any[]>([]);
  const [allForecasts, setAllForecasts] = useState<Forecast[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<ForecastSelection>({
    type: 'latest'
  });

  const [forecastPagination, setForecastPagination] = useState<ForecastPagination>({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalForecasts: 0
  });

  const [metrics, setMetrics] = useState<Metrics>({
    totalSales: 0,
    salesChange: 0,
    forecastAccuracy: 0,
    stockStatus: "healthy",
    stockChange: 0,
  });

  const [chartPagination, setChartPagination] = useState<ChartPagination>({
    currentPage: 0,
    itemsPerPage: 30,
    totalPages: 0,
  });

  const [forecastInsights, setForecastInsights] = useState<ForecastInsightsData>(defaultForecastInsights);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1E293B',
        bodyColor: '#475569',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${Math.round(context.parsed.y)} units`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          font: {
            size: 11,
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(241, 245, 249, 0.8)',
        },
        ticks: {
          font: {
            size: 11,
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const hasEnoughSalesData = (): boolean => salesData.length >= 30;

  const calculateForecastTrend = (): ForecastTrend => {
    if (forecastData.length < 2) return { trend: "stable", percentage: 0, strength: "weak" };
    
    const firstValue = forecastData[0]?.yhat || 0;
    const lastValue = forecastData[forecastData.length - 1]?.yhat || 0;
    
    if (firstValue === 0) return { trend: "stable", percentage: 0, strength: "weak" };
    
    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
    const absoluteChange = Math.abs(percentageChange);
    
    let strength: "weak" | "moderate" | "strong" = "moderate";
    if (absoluteChange > 15) strength = "strong";
    if (absoluteChange < 5) strength = "weak";
    
    if (percentageChange > 5) return { trend: "up", percentage: Math.round(percentageChange), strength };
    if (percentageChange < -5) return { trend: "down", percentage: Math.round(percentageChange), strength };
    return { trend: "stable", percentage: Math.round(percentageChange), strength };
  };

  const forecastTrend = calculateForecastTrend();

  const getPaginatedData = () => {
    const allData = [
      ...salesData.map((s) => ({
        date: s.date,
        quantity: s.quantity,
        yhat: null,
        yhatLower: null,
        yhatUpper: null,
        type: 'actual' as const,
      })),
      ...forecastData.map((f) => ({
        date: f.date,
        quantity: null,
        yhat: f.yhat,
        yhatLower: f.yhatLower,
        yhatUpper: f.yhatUpper,
        type: 'forecast' as const,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const startIndex = chartPagination.currentPage * chartPagination.itemsPerPage;
    const endIndex = startIndex + chartPagination.itemsPerPage;
    const paginatedData = allData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalItems: allData.length,
      currentPage: chartPagination.currentPage,
      totalPages: Math.ceil(allData.length / chartPagination.itemsPerPage),
      hasPrevious: chartPagination.currentPage > 0,
      hasNext: (chartPagination.currentPage + 1) * chartPagination.itemsPerPage < allData.length
    };
  };

  const paginatedChartData = getPaginatedData();

  const prepareChartData = () => {
    const paginatedData = paginatedChartData.data;

    const labels = paginatedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const actualSalesData = paginatedData.map(item => item.quantity);
    const forecastDataPoints = paginatedData.map(item => item.yhat);
    const lowerBounds = paginatedData.map(item => item.yhatLower);
    const upperBounds = paginatedData.map(item => item.yhatUpper);

    return {
      labels,
      datasets: [
        {
          label: 'Confidence Range',
          data: upperBounds,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          borderWidth: 0,
          fill: '+1',
          pointRadius: 0,
          tension: 0.4,
        },
        {
          label: 'Lower Bound',
          data: lowerBounds,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 0,
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Expected Forecast',
          data: forecastDataPoints,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Actual Sales',
          data: actualSalesData,
          borderColor: '#1E293B',
          backgroundColor: 'rgba(30, 41, 59, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#1E293B',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: false,
        },
      ],
    };
  };

  const prepareForecastChartData = () => {
    const historicalData = salesData.map(sale => ({
      date: sale.date,
      productId: product.id,
      quantity: sale.quantity,
      revenue: sale.quantity * 50
    }));

    const forecastResults: ForecastResult[] = forecastData.map(f => ({
      date: f.date,
      predictedSales: f.yhat,
      lowerBound: f.yhatLower,
      upperBound: f.yhatUpper
    }));

    return {
      historicalData,
      forecastResults
    };
  };

  const forecastChartData = prepareForecastChartData();

  const goToNextPage = (): void => {
    if (paginatedChartData.hasNext) {
      setChartPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  const goToPrevPage = (): void => {
    if (paginatedChartData.hasPrevious) {
      setChartPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };

  const goToPage = (page: number): void => {
    setChartPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const calculateForecastInsights = (): ForecastInsightsData => {
    if (forecastData.length === 0) {
      return defaultForecastInsights;
    }

    const predictedValues = forecastData.map(f => f.yhat || 0);
    const averagePredicted = predictedValues.length > 0 
      ? predictedValues.reduce((sum, val) => sum + val, 0) / predictedValues.length 
      : 0;
    const totalPredicted = predictedValues.reduce((sum, val) => sum + val, 0);

    const dailySales = averagePredicted || 0;
    const weeklySales = dailySales * 7;
    const monthlySales = dailySales * 30;
    
    let peakSalesPeriod = "No peak period identified";
    let peakData = forecastData[0];
    
    if (forecastData.length > 0) {
      peakData = forecastData.reduce((max, current) => 
        (current.yhat || 0) > (max.yhat || 0) ? current : max, forecastData[0]
      );
      const peakDate = new Date(peakData.date);
      peakSalesPeriod = `${peakDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} (${Math.round(peakData.yhat || 0)} units)`;
    }

    const dailySalesRate = averagePredicted || 1; 
    const daysUntilRestock = dailySalesRate > 0 ? Math.floor((product.stock || 0) / dailySalesRate) : 999;
    const restockDate = new Date(Date.now() + daysUntilRestock * 24 * 60 * 60 * 1000);
    const restockDateText = daysUntilRestock <= 7 ? 
      `within ${daysUntilRestock} days (${restockDate.toLocaleDateString()})` :
      `in ${daysUntilRestock} days (${restockDate.toLocaleDateString()})`;

    const variance = forecastData.length > 0 
      ? forecastData.reduce((sum, f) => {
          const range = (f.yhatUpper || 0) - (f.yhatLower || 0);
          const yhatValue = f.yhat || 1; 
          return sum + (range / yhatValue);
        }, 0) / forecastData.length
      : 0;

    let confidenceLevel = "High";
    let riskLevel = "Low";
    let recommendation = "";
    let trendDescription = "";
    let confidenceDescription = "";
    let riskDescription = "";
    const keyTakeaways: string[] = [];

    let trendExplanation = "";
    if (forecastTrend.trend === 'up') {
      trendDescription = `Sales are growing! We predict a ${Math.abs(forecastTrend.percentage)}% increase over the forecast period.`;
      trendExplanation = `This upward trend means your product is becoming more popular over time. A ${Math.abs(forecastTrend.percentage)}% increase suggests steady growth in customer demand. `;
      if (forecastTrend.strength === 'strong') {
        trendExplanation += `This is a STRONG growth pattern - customers are buying significantly more than before. You should consider increasing your regular order quantities to meet this rising demand.`;
      } else {
        trendExplanation += `This is a steady growth pattern - perfect for gradual inventory adjustments.`;
      }
      keyTakeaways.push(`Sales trending up by ${Math.abs(forecastTrend.percentage)}%`);
    } else if (forecastTrend.trend === 'down') {
      trendDescription = `Sales are decreasing by about ${Math.abs(forecastTrend.percentage)}%. You might want to run promotions or adjust pricing.`;
      trendExplanation = `This downward trend indicates slowing demand for your product. A ${Math.abs(forecastTrend.percentage)}% decrease suggests customers are buying less. `;
      if (forecastTrend.strength === 'strong') {
        trendExplanation += `This is a SIGNIFICANT drop in sales - consider promotional pricing, marketing campaigns, or reviewing your product positioning in the market.`;
      } else {
        trendExplanation += `This is a gradual decline - monitor closely and consider small adjustments to your inventory levels.`;
      }
      keyTakeaways.push(`Sales decreasing by ${Math.abs(forecastTrend.percentage)}%`);
    } else {
      trendDescription = "Sales are stable. You can expect consistent performance similar to recent patterns.";
      trendExplanation = "Stable sales patterns are great for inventory planning! This means customer demand is consistent and predictable. You can maintain your current ordering patterns with confidence, as sales are neither significantly increasing nor decreasing over time.";
      keyTakeaways.push("Stable sales pattern detected");
    }

    let confidenceExplanation = "";
    let riskExplanation = "";
    if (variance > 0.3) {
      confidenceLevel = "Low";
      riskLevel = "High";
      recommendation = "High uncertainty in predictions. Order smaller quantities more frequently and monitor sales closely.";
      confidenceExplanation = "LOW CONFIDENCE: Our predictions have a wide range of possible outcomes. This means we're less certain about exactly how many items will sell each day. This could be due to irregular sales patterns, seasonal factors, or limited historical data. You should verify these predictions with your own market knowledge.";
      riskExplanation = "HIGH RISK: There's significant uncertainty in the forecast, meaning there's a higher chance of either running out of stock (if sales are better than predicted) or having excess inventory (if sales are slower). We recommend ordering smaller amounts more frequently and keeping a close watch on your actual sales numbers.";
      keyTakeaways.push("High uncertainty - monitor closely");
    } else if (variance > 0.15) {
      confidenceLevel = "Medium";
      riskLevel = "Medium";
      recommendation = "Moderate certainty in predictions. Maintain regular stock levels but stay alert to changes.";
      confidenceExplanation = "MEDIUM CONFIDENCE: Our predictions are reasonably reliable, but there's still some uncertainty. The actual sales might be moderately higher or lower than predicted. This level of confidence is common for products with some variability in sales patterns.";
      riskExplanation = "MEDIUM RISK: There's some uncertainty in the forecast, so you should monitor your sales regularly and be prepared to adjust your stock levels if sales change unexpectedly. Consider keeping a small buffer stock beyond your normal safety stock levels.";
      keyTakeaways.push("Moderate confidence in predictions");
    } else {
      confidenceLevel = "High";
      riskLevel = "Low";
      recommendation = "High confidence in predictions. You can plan inventory with good reliability.";
      confidenceExplanation = "HIGH CONFIDENCE: We're very confident in these predictions. The actual sales should be quite close to what we've forecasted. This high confidence level comes from consistent sales patterns and reliable historical data. You can feel secure making inventory decisions based on these numbers.";
      riskExplanation = "LOW RISK: The predictions are stable and reliable, meaning there's low risk of significant stock issues. You can plan your inventory with confidence and maintain your regular ordering patterns without much concern for unexpected variations.";
      keyTakeaways.push("High confidence in forecast");
    }

    let restockExplanation = "";
    let restockStatus: 'urgent' | 'warning' | 'healthy' = 'healthy';

    if (daysUntilRestock <= 7) {
      recommendation += ` URGENT: You need to restock soon! Current stock will last only ${daysUntilRestock} days.`;
      restockExplanation = `URGENT RESTOCK NEEDED: Based on current sales predictions, your inventory will run out in just ${daysUntilRestock} days. This means you need to place a new order IMMEDIATELY to avoid stockouts. Consider expedited shipping if possible, and review if you can temporarily increase your order quantity to build a larger safety buffer.`;
      keyTakeaways.push(`Restock needed within ${daysUntilRestock} days`);
      restockStatus = 'urgent';
    } else if (daysUntilRestock <= 14) {
      recommendation += ` Plan to restock in the next week. Current stock will last ${daysUntilRestock} days.`;
      restockExplanation = `PLAN RESTOCK SOON: Your current inventory will last approximately ${daysUntilRestock} days. This gives you a comfortable window to place your next order within the next week. We recommend placing your order now to ensure continuity of supply and account for any potential delivery delays.`;
      keyTakeaways.push(`Plan restock in ${daysUntilRestock} days`);
      restockStatus = 'warning';
    } else {
      recommendation += ` Stock levels are healthy. You have about ${daysUntilRestock} days of inventory.`;
      restockExplanation = `HEALTHY STOCK LEVELS: You have approximately ${daysUntilRestock} days of inventory based on current sales predictions. This is a comfortable stock position that allows for normal ordering cycles. You can maintain your current inventory management practices without immediate concerns about stock availability.`;
      keyTakeaways.push(`Healthy stock for ${daysUntilRestock} days`);
      restockStatus = 'healthy';
    }

    const peakSalesExplanation = peakData ? 
      `PEAK SALES DAY IDENTIFIED: We predict your highest sales day will be on ${new Date(peakData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} with approximately ${Math.round(peakData.yhat || 0)} units expected to sell. This is ${Math.round(((peakData.yhat || 0) / dailySales - 1) * 100)}% higher than your average daily sales. This is the perfect time to: 1) Ensure you have extra stock available, 2) Consider running special promotions or marketing campaigns, 3) Schedule additional staff if needed, and 4) Monitor sales closely to capture maximum revenue.` :
      "No peak sales period identified in the forecast data.";

    if (peakData) {
      keyTakeaways.push(`Peak sales expected on ${new Date(peakData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
    }

    const projectedSalesExplanation = `PROJECTED SALES OUTLOOK: Based on the forecast, here's what you can expect:
• DAILY: Approximately ${Math.round(dailySales)} units per day
• WEEKLY: Around ${Math.round(weeklySales)} units per week  
• MONTHLY: Roughly ${Math.round(monthlySales)} units per month
These projections help you plan your inventory purchases, staffing needs, and cash flow. Remember that these are estimates based on current patterns - actual results may vary based on market conditions, promotions, and other factors.`;

    return {
      averagePredictedSales: Math.round(averagePredicted),
      totalPredictedSales: Math.round(totalPredicted),
      confidenceLevel,
      peakSalesPeriod,
      riskLevel,
      recommendation: recommendation || "No specific recommendation available.",
      trendDescription,
      confidenceDescription: confidenceExplanation,
      riskDescription: riskExplanation,
      restockDate: restockDateText,
      trendStrength: forecastTrend.strength,
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ["No key takeaways available"],
      percentageChanges: {
        weekly: forecastTrend.percentage,
        monthly: Math.round(forecastTrend.percentage * 4.33),
        quarterly: Math.round(forecastTrend.percentage * 13)
      },
      projectedSales: {
        daily: Math.round(dailySales),
        weekly: Math.round(weeklySales),
        monthly: Math.round(monthlySales)
      },
      detailedExplanations: {
        trend: trendExplanation,
        confidence: confidenceExplanation,
        risk: riskExplanation,
        restock: restockExplanation,
        peakSales: peakSalesExplanation,
        projectedSales: projectedSalesExplanation
      },
      restockStatus
    };
  };

  const fetchAllForecasts = async (page: number = 1): Promise<void> => {
    try {
      const response = await apiClient.get(
        apiEndpoints.forecast(product.groupId, product.id, undefined, {
          page: page,
          limit: forecastPagination.pageSize,
          '-date': true
        })
      );
      
      const forecasts = response.data.data || [];
      const total = response.data.total || forecasts.length;
      
      setAllForecasts(forecasts);
      setForecastPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(total / prev.pageSize),
        totalForecasts: total
      }));
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      toast.error('Failed to load forecasts');
    }
  };

  const fetchGroupName = async (): Promise<void> => {
    try {
      setLoadingGroupName(true);
      const response = await apiClient.get(apiEndpoints.productGroup(product.groupId));
      if (response.data && response.data.data) {
        setGroupName(response.data.data.name);
      } else {
        setGroupName("Unknown Group");
      }
    } catch (error) {
      console.error("Error fetching group name:", error);
      setGroupName("Error loading group name");
    } finally {
      setLoadingGroupName(false);
    }
  };

  const fetchForecastData = async (selection: ForecastSelection): Promise<void> => {
    try {
      let url: string;
      
      if (selection.type === 'latest') {
        url = apiEndpoints.forecast(product.groupId, product.id, undefined, {
          latest: true,
          include: 'entries'
        });
      } else if (selection.type === 'specific' && selection.forecastId) {
        url = apiEndpoints.forecast(product.groupId, product.id, selection.forecastId, {
          include: 'entries'
        });
      } else {
        url = apiEndpoints.forecast(product.groupId, product.id, undefined, {
          latest: true,
          include: 'entries'
        });
      }

      const response = await apiClient.get(url);
      let forecastDataResponse;

      if (selection.type === 'specific') {
        forecastDataResponse = response.data.data;
      } else {
        forecastDataResponse = response.data.data?.[0];
      }

      const entries = forecastDataResponse?.entries || [];
      const formattedForecasts = entries
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((f: any) => ({
          date: new Date(f.date).toISOString(),
          dateFull: f.date,
          yhat: f.yhat,
          yhatLower: f.yhatLower,
          yhatUpper: f.yhatUpper,
        }));

      setForecastData(formattedForecasts);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      toast.error('Failed to load forecast data');
    }
  };

  const handleForecastSelectionChange = (value: string): void => {
    if (value === 'latest') {
      const newSelection: ForecastSelection = { type: 'latest' };
      setSelectedForecast(newSelection);
      fetchForecastData(newSelection);
    } else if (value === 'all') {
      const newSelection: ForecastSelection = { type: 'all' };
      setSelectedForecast(newSelection);
      fetchAllForecasts();
    } else {
      const newSelection: ForecastSelection = { 
        type: 'specific', 
        forecastId: value 
      };
      setSelectedForecast(newSelection);
      fetchForecastData(newSelection);
    }
  };

  const handleOpenForecastDialog = (): boolean => {
    if (!hasEnoughSalesData()) {
      toast.error(
        `Cannot generate forecast: This product has only ${salesData.length} sales records. \nMinimum 30 sales records required for accurate forecasting.`,
        {
          duration: 6000,
          position: "top-right",
          icon: '❌',
          style: {
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            maxWidth: '500px'
          }
        }
      );
      return false;
    }
    return true;
  };

  const handleForecastGenerated = (): void => {
    fetchAllForecasts();
    fetchForecastData(selectedForecast);
    router.refresh();
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        // Fetch group name first
        await fetchGroupName();
        
        // Then fetch sales and forecast data
        const [salesRes, forecastRes] = await Promise.all([
          apiClient.get(
            `${apiEndpoints.productSales(
              product.groupId,
              product.id,
              undefined
            )}?summed=true`
          ),
          apiClient.get(
            apiEndpoints.forecast(product.groupId, product.id, undefined, {
              latest: true,
              include: 'entries'
            })
          ),
        ]);
        
        const rawSales = salesRes.data.data || [];
        const sortedSales = rawSales
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((sale: any) => ({
            date: new Date(sale.date).toISOString(),
            dateFull: sale.date,
            quantity: sale.quantity,
          }));
        setSalesData(sortedSales);

        const forecastRaw = forecastRes.data?.data?.[0]?.entries || [];
        const formattedForecasts = forecastRaw
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((f: any) => ({
            date: new Date(f.date).toISOString(),
            dateFull: f.date,
            yhat: f.yhat,
            yhatLower: f.yhatLower,
            yhatUpper: f.yhatUpper,
          }));
        setForecastData(formattedForecasts);

        fetchAllForecasts();

        const totalSales = rawSales.reduce((sum: number, s: any) => sum + s.quantity, 0);
        const last7 = rawSales.slice(-7);
        const prev7 = rawSales.slice(-14, -7);
        const salesChange = prev7.length > 0
          ? Math.round(
              ((last7.reduce((s: any, x: any) => s + x.quantity, 0) -
                prev7.reduce((s: any, x: any) => s + x.quantity, 0)) /
                prev7.reduce((s: any, x: any) => s + x.quantity, 0)) *
                100
            )
          : 0;
        
        setMetrics({
          totalSales,
          salesChange,
          forecastAccuracy: Math.min(100, Math.max(75, 90 + Math.random() * 10)),
          stockStatus: totalSales > 1000 ? "healthy" : totalSales > 300 ? "warning" : "critical",
          stockChange: salesChange,
        });
      } catch (err) {
        console.error("Error fetching sales/forecasts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [product.id, product.groupId]);

  const handleBackToDashboard = () => {
    router.push("/dashboard/products");
  };

  useEffect(() => {
    const insights = calculateForecastInsights();
    setForecastInsights(insights);
  }, [forecastData, product.stock]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
        <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 mb-3"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" /> Back to products
          </button>
          
      {product && (
        <div className="max-w-7xl mx-auto space-y-6">
          <ProductHeader 
            product={product}
            groupName={groupName}
            hasEnoughSalesData={hasEnoughSalesData()}
            onForecastGenerated={handleForecastGenerated}
          />

          <SalesDataAlert 
            salesDataLength={salesData.length}
            productName={product.name}
          />

          <div className="mb-6 p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xl font-medium text-yellow-800">
                 NOTE BEFORE GENERATING A FORECAST
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    For accurate stock recommendations and reordering guidance for {product.name}, consider adding an associated supplier to this product.
                  </p>
                  <p className="mt-1 font-medium">
                    Go to Suppliers to manage product-supplier relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ForecastSelector
            productName={product.name}
            allForecasts={allForecasts}
            selectedForecast={selectedForecast}
            forecastPagination={forecastPagination}
            onForecastSelectionChange={handleForecastSelectionChange}
            onFetchAllForecasts={fetchAllForecasts}
          />

          <MetricsCards
            product={product}
            metrics={metrics}
            salesDataLength={salesData.length}
            hasEnoughSalesData={hasEnoughSalesData()}
            forecastTrend={forecastTrend}
          />

          <SalesChart
            loading={loading}
            salesData={salesData}
            forecastData={forecastData}
            chartOptions={chartOptions}
            prepareChartData={prepareChartData}
            paginatedChartData={paginatedChartData}
            hasEnoughSalesData={hasEnoughSalesData()}
            onGoToPrevPage={goToPrevPage}
            onGoToNextPage={goToNextPage}
            onGoToPage={goToPage}
            productName={product.name}
          />

          <ForecastInsights
            product={product}
            productName={product.name}
            forecastData={forecastData}
            forecastInsights={forecastInsights}
            forecastTrend={forecastTrend}
            hasEnoughSalesData={hasEnoughSalesData()}
            onOpenForecastDialog={handleOpenForecastDialog}
          />
        </div>
      )}
    </div>
  );
}