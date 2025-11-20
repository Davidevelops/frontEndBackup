
import { SalesData } from "@/lib/data/sampleSalesData";

export interface ForecastResult {
  date: string;
  predictedSales: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface ForecastResponse {
  forecast: ForecastResult[];
  accuracy: number;
  generatedAt: string;
  metadata: {
    periods: number;
    method: string;
    confidenceLevel: number;
  };
}

export class ForecastService {
  static generateForecast(data: SalesData[], periods: number, confidence: number): ForecastResponse {
    if (data.length < 2) {
      throw new Error("Insufficient data for forecasting. Need at least 2 data points.");
    }

    const dailyData = this.aggregateDataByDate(data);
    const dates = Object.keys(dailyData).sort();
    const values = dates.map(date => dailyData[date]);

    const linearForecast = this.linearRegressionForecast(dates, values, periods, confidence);
    const movingAvgForecast = this.movingAverageForecast(values, periods, confidence);
    
    const combinedForecast = this.combineForecasts(linearForecast, movingAvgForecast);
    
    const accuracy = this.calculateAccuracy(values, linearForecast.map(f => f.predictedSales));
    
    return {
      forecast: combinedForecast,
      accuracy,
      generatedAt: new Date().toISOString(),
      metadata: {
        periods,
        method: "Combined (Linear + Moving Average)",
        confidenceLevel: confidence
      }
    };
  }

  private static aggregateDataByDate(data: SalesData[]): { [date: string]: number } {
    const aggregated: { [date: string]: number } = {};
    
    data.forEach(entry => {
      if (!aggregated[entry.date]) {
        aggregated[entry.date] = 0;
      }
      aggregated[entry.date] += entry.quantity;
    });
    
    return aggregated;
  }

  private static linearRegressionForecast(
    dates: string[], 
    values: number[], 
    periods: number, 
    confidence: number
  ): ForecastResult[] {
    const n = values.length;
    const x = dates.map((_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const residuals = y.map((actual, i) => {
      const predicted = slope * i + intercept;
      return actual - predicted;
    });
    
    const residualSumSquares = residuals.reduce((sum, residual) => sum + residual * residual, 0);
    const standardError = Math.sqrt(residualSumSquares / (n - 2));

    const forecast: ForecastResult[] = [];
    const lastDate = new Date(dates[dates.length - 1]);
    
    for (let i = 1; i <= periods; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i * 7);
      
      const predicted = slope * (n + i - 1) + intercept;
      const zScore = this.getZScore(confidence);
      const marginOfError = zScore * standardError * Math.sqrt(1 + 1/n);
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedSales: Math.round(Math.max(10, predicted)),
        lowerBound: Math.round(Math.max(0, predicted - marginOfError)),
        upperBound: Math.round(Math.max(0, predicted + marginOfError)),
        confidence: confidence / 100
      });
    }

    return forecast;
  }

  private static movingAverageForecast(
    values: number[], 
    periods: number, 
    confidence: number
  ): ForecastResult[] {
    const windowSize = Math.min(4, Math.floor(values.length / 3));
    const forecast: ForecastResult[] = [];
    
    let movingAvg = 0;
    for (let i = values.length - windowSize; i < values.length; i++) {
      movingAvg += values[i];
    }
    movingAvg /= windowSize;

    const recentTrend = values.length > 1 ? 
      (values[values.length - 1] - values[values.length - 2]) / values[values.length - 2] : 0;
    
    const trendFactor = 1 + (recentTrend * 0.5);

    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() + 7);

    for (let i = 1; i <= periods; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + (i - 1) * 7);
      
      const predicted = movingAvg * Math.pow(trendFactor, i);
      const variance = Math.sqrt(movingAvg) * 2;
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedSales: Math.round(Math.max(10, predicted)),
        lowerBound: Math.round(Math.max(0, predicted - variance)),
        upperBound: Math.round(Math.max(0, predicted + variance)),
        confidence: confidence / 100
      });
    }

    return forecast;
  }

  private static combineForecasts(
    forecast1: ForecastResult[], 
    forecast2: ForecastResult[]
  ): ForecastResult[] {
    return forecast1.map((f1, i) => {
      const f2 = forecast2[i];
      return {
        date: f1.date,
        predictedSales: Math.round((f1.predictedSales * 0.6 + f2.predictedSales * 0.4)),
        lowerBound: Math.round((f1.lowerBound + f2.lowerBound) / 2),
        upperBound: Math.round((f1.upperBound + f2.upperBound) / 2),
        confidence: f1.confidence
      };
    });
  }

  private static calculateAccuracy(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length) return 75;
    
    let sumSquaredErrors = 0;
    let sumActual = 0;
    
    for (let i = 0; i < actual.length; i++) {
      const error = actual[i] - predicted[i];
      sumSquaredErrors += error * error;
      sumActual += actual[i];
    }
    
    const mse = sumSquaredErrors / actual.length;
    const meanActual = sumActual / actual.length;
    
    if (meanActual === 0) return 75;
    
    const accuracy = Math.max(70, 100 - (Math.sqrt(mse) / meanActual) * 100);
    return Math.min(95, accuracy);
  }

  private static getZScore(confidence: number): number {
    switch (confidence) {
      case 80: return 1.282;
      case 85: return 1.440;
      case 90: return 1.645;
      case 95: return 1.960;
      case 99: return 2.576;
      default: return 1.960;
    }
  }
}