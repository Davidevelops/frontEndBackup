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

  const data = {
    labels: [...historicalDates, ...forecastDates],
    datasets: [
      {
        label: 'Historical Sales',
        data: [...historicalValues, ...Array(forecastDates.length).fill(null)],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Forecast',
        data: [...Array(historicalDates.length).fill(null), ...forecastValues],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Prediction Range',
        data: [...Array(historicalDates.length).fill(null), ...upperBounds],
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        fill: '+1',
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: '',
        data: [...Array(historicalDates.length).fill(null), ...lowerBounds],
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Forecast',
        color: '#6B7280',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm">
      <Line data={data} options={options} />
    </div>
  );
}