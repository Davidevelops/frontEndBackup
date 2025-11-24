import { useState } from "react";
import { SingleProduct } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChartLine, AlertCircle } from "lucide-react";
import { apiEndpoints } from "@/lib/apiEndpoints";
import axios from "axios";
import toast from "react-hot-toast";

interface ForecastDialogProps {
  product: SingleProduct;
  hasEnoughSalesData: boolean;
  onForecastGenerated: () => void;
}

export function ForecastDialog({ product, hasEnoughSalesData, onForecastGenerated }: ForecastDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastForm, setForecastForm] = useState({
    dataDepth: 100,
    forecastStartDate: new Date().toISOString().split("T")[0],
    forecastEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const handleOpenDialog = () => {
    if (!hasEnoughSalesData) {
      toast.error(
        `Cannot generate forecast: This product has insufficient sales records. \nMinimum 30 sales records required for accurate forecasting.`,
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
    setIsOpen(true);
    return true;
  };

  const handleGenerateForecast = async () => {
    try {
      setIsForecasting(true);
      const payload = {
        dataDepth: forecastForm.dataDepth,
        forecastStartDate: forecastForm.forecastStartDate,
        forecastEndDate: forecastForm.forecastEndDate,
      };
      
      await axios.post(
        apiEndpoints.forecast(product.groupId, product.id, undefined),
        payload,
        { withCredentials: true }
      );
      
      toast.success('Forecast generated successfully!', {
        duration: 4000,
        position: "top-right",
        icon: '✅',
        style: {
          background: '#F0FDF4',
          color: '#166534',
          border: '1px solid #BBF7D0',
        }
      });
      
      setIsOpen(false);
      onForecastGenerated();
    } catch (error) {
      console.error("Failed to generate forecast:", error);
      toast.error('Failed to generate forecast. Please try again.', {
        duration: 5000,
        position: "top-right",
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        }
      });
    } finally {
      setIsForecasting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
          onClick={(e) => {
            e.preventDefault();
            handleOpenDialog();
          }}
        >
          <ChartLine className="h-5 w-5" />
          Generate Forecast
          {!hasEnoughSalesData && (
            <div className="relative">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-white border border-[#E2E8F0] rounded-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
            <ChartLine className="h-5 w-5 text-[#1E293B]" />
            Generate Forecast
          </DialogTitle>
          <DialogDescription className="text-[#64748B] text-sm">
            Configure the forecast parameters below before generating.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">
              Data Depth (days)
            </label>
            <input
              type="number"
              value={forecastForm.dataDepth}
              onChange={(e) =>
                setForecastForm({
                  ...forecastForm,
                  dataDepth: parseInt(e.target.value),
                })
              }
              className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">
              Forecast Start Date
            </label>
            <input
              type="date"
              value={forecastForm.forecastStartDate}
              onChange={(e) =>
                setForecastForm({
                  ...forecastForm,
                  forecastStartDate: e.target.value,
                })
              }
              className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">
              Forecast End Date
            </label>
            <input
              type="date"
              value={forecastForm.forecastEndDate}
              onChange={(e) =>
                setForecastForm({
                  ...forecastForm,
                  forecastEndDate: e.target.value,
                })
              }
              className="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1E293B] focus:border-transparent focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg font-medium transition-all duration-200"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerateForecast}
            disabled={isForecasting}
            className={`flex-1 justify-center bg-[#1E293B] hover:bg-[#0F172A] text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isForecasting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isForecasting ? "Generating..." : "Generate"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}