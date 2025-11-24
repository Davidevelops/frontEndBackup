import { AlertCircle } from "lucide-react";

interface SalesDataAlertProps {
  salesDataLength: number;
}

export function SalesDataAlert({ salesDataLength }: SalesDataAlertProps) {
  if (salesDataLength >= 30) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <div>
          <h3 className="font-semibold text-amber-800">
            Limited Sales Data Available
          </h3>
          <p className="text-amber-700 text-sm mt-1">
            This product has only {salesDataLength} sales records. For accurate forecasting, 
            we recommend having at least 30 sales records. You can still generate a forecast, 
            but the predictions may be less reliable.
          </p>
        </div>
      </div>
    </div>
  );
}