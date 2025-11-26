// components/ForecastChart.tsx
"use client";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

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

interface ForecastChartProps {
  historicalData: SalesData[];
  forecastData: ForecastResult[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ForecastChart({ historicalData, forecastData }: ForecastChartProps) {
  // Aggregate historical data by date
  const historicalAggregated: { [date: string]: number } = {};
  historicalData.forEach(entry => {
    if (!historicalAggregated[entry.date]) {
      historicalAggregated[entry.date] = 0;
    }
    historicalAggregated[entry.date] += entry.quantity;
  });

  const historicalDates = Object.keys(historicalAggregated).sort();
  const historicalValues = historicalDates.map(date => historicalAggregated[date]);

  const forecastDates = forecastData.map(f => f.date);
  const forecastValues = forecastData.map(f => f.predictedSales);
  const lowerBounds = forecastData.map(f => f.lowerBound);
  const upperBounds = forecastData.map(f => f.upperBound);

  // Format dates for better display
  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const allLabels = [...historicalDates.map(formatDateLabel), ...forecastDates.map(formatDateLabel)];

  const data = {
    labels: allLabels,
    datasets: [
      {
        label: 'Confidence Range',
        data: [...Array(historicalDates.length).fill(null), ...upperBounds],
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 0,
        fill: '+1',
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: 'Lower Bound',
        data: [...Array(historicalDates.length).fill(null), ...lowerBounds],
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 0,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Predicted Sales',
        data: [...Array(historicalDates.length).fill(null), ...forecastValues],
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
        label: 'Historical Sales',
        data: [...historicalValues, ...Array(forecastDates.length).fill(null)],
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

  const options = {
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
          },
          filter: (legendItem: any) => {
            // Hide the lower bound from legend since it's part of confidence range
            return legendItem.text !== 'Lower Bound';
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${Math.round(context.parsed.y)} units`;
            }
            return label;
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
          maxRotation: 45,
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
          },
          callback: function(value: any) {
            return value === 0 ? '0' : `${value}`;
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverRadius: 6,
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Forecast</h3>
          <p className="text-sm text-gray-600">
            Historical sales data and future predictions with confidence intervals
          </p>
        </div>
      </div>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Historical Period</div>
          <div className="font-semibold text-gray-900">{historicalDates.length} days</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Forecast Period</div>
          <div className="font-semibold text-gray-900">{forecastDates.length} days</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total Range</div>
          <div className="font-semibold text-gray-900">{allLabels.length} days</div>
        </div>
      </div>
    </div>
  );
}