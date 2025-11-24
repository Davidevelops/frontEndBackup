import { Forecast,ForecastSelection } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Zap, List, Calendar, Eye, Info, ChevronLeft, ChevronRight } from "lucide-react";

interface ForecastSelectorProps {
  allForecasts: Forecast[];
  selectedForecast: ForecastSelection;
  forecastPagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalForecasts: number;
  };
  onForecastSelectionChange: (value: string) => void;
  onFetchAllForecasts: (page: number) => void;
}

export function ForecastSelector({
  allForecasts,
  selectedForecast,
  forecastPagination,
  onForecastSelectionChange,
  onFetchAllForecasts
}: ForecastSelectorProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#6366F1] p-2 rounded-lg">
            <History className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              Forecast Selection
            </h3>
            <p className="text-sm text-[#64748B]">
              Choose which forecast to display and analyze
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#64748B]">
            {allForecasts.length} forecast{allForecasts.length !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select
            value={
              selectedForecast.type === 'specific' 
                ? selectedForecast.forecastId 
                : selectedForecast.type
            }
            onValueChange={onForecastSelectionChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select forecast..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span>Latest Forecast</span>
                </div>
              </SelectItem>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-blue-600" />
                  <span>View All Forecasts</span>
                </div>
              </SelectItem>
              
              {/* Specific forecasts */}
              {allForecasts.map((forecast) => (
                <SelectItem key={forecast.id} value={forecast.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {formatDate(forecast.createdAt)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {forecast.entries?.length || 0} entries
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Forecast info */}
        {selectedForecast.type === 'specific' && (
          <div className="flex items-center gap-2 text-sm text-[#64748B] bg-blue-50 px-3 py-2 rounded-lg">
            <Info className="h-4 w-4" />
            <span>Viewing specific forecast</span>
          </div>
        )}
      </div>

      {/* All Forecasts View */}
      {selectedForecast.type === 'all' && (
        <div className="mt-6 border-t border-[#E2E8F0] pt-6">
          <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <List className="h-5 w-5 text-[#6366F1]" />
            All Generated Forecasts
          </h4>
          
          <div className="space-y-3">
            {allForecasts.map((forecast) => (
              <div
                key={forecast.id}
                className="flex items-center justify-between p-4 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#F1F5F9] p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-[#64748B]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A]">
                      Forecast from {formatDate(forecast.createdAt)}
                    </p>
                    <p className="text-sm text-[#64748B]">
                      Period: {formatDate(forecast.forecastStartDate)} - {formatDate(forecast.forecastEndDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded">
                    {forecast.entries?.length || 0} entries
                  </span>
                  <button
                    onClick={() => onForecastSelectionChange(forecast.id)}
                    className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for all forecasts */}
          {forecastPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E2E8F0]">
              <p className="text-sm text-[#64748B]">
                Showing {allForecasts.length} of {forecastPagination.totalForecasts} forecasts
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onFetchAllForecasts(forecastPagination.currentPage - 1)}
                  disabled={forecastPagination.currentPage === 1}
                  className={`p-2 rounded-lg border ${
                    forecastPagination.currentPage > 1
                      ? 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border-[#E2E8F0]'
                      : 'text-[#CBD5E1] border-[#F1F5F9] cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <span className="text-sm text-[#64748B] px-3">
                  Page {forecastPagination.currentPage} of {forecastPagination.totalPages}
                </span>
                
                <button
                  onClick={() => onFetchAllForecasts(forecastPagination.currentPage + 1)}
                  disabled={forecastPagination.currentPage === forecastPagination.totalPages}
                  className={`p-2 rounded-lg border ${
                    forecastPagination.currentPage < forecastPagination.totalPages
                      ? 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] border-[#E2E8F0]'
                      : 'text-[#CBD5E1] border-[#F1F5F9] cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}