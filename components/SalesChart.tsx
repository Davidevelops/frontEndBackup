import { Line } from 'react-chartjs-2';
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

interface SalesChartProps {
  loading: boolean;
  salesData: any[];
  forecastData: any[];
  chartOptions: any;
  prepareChartData: () => any;
  paginatedChartData: {
    data: any[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  hasEnoughSalesData: boolean;
  onGoToPrevPage: () => void;
  onGoToNextPage: () => void;
  onGoToPage: (page: number) => void;
}

export function SalesChart({
  loading,
  salesData,
  forecastData,
  chartOptions,
  prepareChartData,
  paginatedChartData,
  hasEnoughSalesData,
  onGoToPrevPage,
  onGoToNextPage,
  onGoToPage
}: SalesChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#1E293B] p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0F172A]">
              Sales Forecast & Trend Analysis
            </h3>
            <p className="text-sm text-[#64748B] mt-1">
              Historical sales data with future predictions and confidence intervals
            </p>
          </div>
        </div>

        {/* Chart Pagination Controls */}
        {paginatedChartData.totalPages > 1 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onGoToPrevPage}
                disabled={!paginatedChartData.hasPrevious}
                className={`p-2 rounded-lg border ${
                  paginatedChartData.hasPrevious
                    ? 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border-[#E2E8F0]'
                    : 'text-[#CBD5E1] border-[#F1F5F9] cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                <span className="text-sm text-[#64748B]">
                  Page {paginatedChartData.currentPage + 1} of {paginatedChartData.totalPages}
                </span>
              </div>
              
              <button
                onClick={onGoToNextPage}
                disabled={!paginatedChartData.hasNext}
                className={`p-2 rounded-lg border ${
                  paginatedChartData.hasNext
                    ? 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border-[#E2E8F0]'
                    : 'text-[#CBD5E1] border-[#F1F5F9] cursor-not-allowed'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Page Navigation Dots */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, paginatedChartData.totalPages) }, (_, i) => {
                let pageIndex = i;
                if (paginatedChartData.totalPages > 5) {
                  const start = Math.max(0, paginatedChartData.currentPage - 2);
                  const end = Math.min(paginatedChartData.totalPages, start + 5);
                  pageIndex = start + i;
                }
                return (
                  <button
                    key={pageIndex}
                    onClick={() => onGoToPage(pageIndex)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      paginatedChartData.currentPage === pageIndex
                        ? 'bg-[#1E293B]'
                        : 'bg-[#CBD5E1] hover:bg-[#94A3B8]'
                    }`}
                  />
                );
              })}
              {paginatedChartData.totalPages > 5 && (
                <span className="text-xs text-[#64748B] ml-1">
                  ...{paginatedChartData.totalPages}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <p className="text-[#64748B]">Loading sales data...</p>
        </div>
      ) : salesData.length === 0 && forecastData.length === 0 ? (
        <div className="h-96 flex items-center justify-center">
          <p className="text-[#64748B]">
            No sales data available for this product.
          </p>
        </div>
      ) : (
        <div className="h-96">
          <Line 
            data={prepareChartData()} 
            options={chartOptions}
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-4 text-sm text-[#64748B]">
        <div>
          Showing {paginatedChartData.data.length} of {paginatedChartData.totalItems} data points
          {!hasEnoughSalesData && (
            <span className="ml-2 text-amber-600">
              • Limited data may affect forecast accuracy
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#1E293B] rounded-full"></div>
            <span className="text-[#64748B]">Actual Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#6366F1] rounded-full"></div>
            <span className="text-[#64748B]">Expected Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#6366F1] bg-opacity-10 rounded-sm"></div>
            <span className="text-[#64748B]">Confidence Range</span>
          </div>
        </div>
      </div>
    </div>
  );
}