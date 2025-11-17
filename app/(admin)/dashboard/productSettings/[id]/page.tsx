"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
interface Holiday {
  name: string;
  date: string;
  lowerWindow: number;
  upperWindow: number;
  priorScale: number;
}

interface CustomSeasonality {
  name: string;
  period: string;
  fourierOrder: number;
  priorScale: number;
  mode: string;
  conditionName: string;
}

interface Changepoint {
  date: string;
}

export default function SalesPredictionSystem() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>("modelSettings");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [customSeasonalities, setCustomSeasonalities] = useState<
    CustomSeasonality[]
  >([]);
  const [changepoints, setChangepoints] = useState<Changepoint[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Product #{id}</h1>
          <p className="mt-2 text-sm text-gray-600"></p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("modelSettings")}
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === "modelSettings"
                  ? "border-indigo-500 text-indigo-600 border-b-2"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Model Settings
            </button>
            <button
              onClick={() => setActiveTab("productSettings")}
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === "productSettings"
                  ? "border-indigo-500 text-indigo-600 border-b-2"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Product Settings
            </button>
            <button
              onClick={() => setActiveTab("holidays")}
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === "holidays"
                  ? "border-indigo-500 text-indigo-600 border-b-2"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Holidays
            </button>
            <button
              onClick={() => setActiveTab("customSeasonality")}
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === "customSeasonality"
                  ? "border-indigo-500 text-indigo-600 border-b-2"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Custom Seasonality
            </button>
            <button
              onClick={() => setActiveTab("changepoints")}
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === "changepoints"
                  ? "border-indigo-500 text-indigo-600 border-b-2"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Changepoints
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "modelSettings" && <ModelSettingsForm />}
          {activeTab === "productSettings" && <ProductSettingsForm />}
          {activeTab === "holidays" && (
            <HolidaysForm holidays={holidays} setHolidays={setHolidays} />
          )}
          {activeTab === "customSeasonality" && (
            <CustomSeasonalityForm
              customSeasonalities={customSeasonalities}
              setCustomSeasonalities={setCustomSeasonalities}
            />
          )}
          {activeTab === "changepoints" && (
            <ChangepointsForm
              changepoints={changepoints}
              setChangepoints={setChangepoints}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Model Settings Form Component
function ModelSettingsForm() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Prophet Model Settings
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="product_id"
            className="block text-sm font-medium text-gray-700"
          >
            Product ID
          </label>
          <input
            type="text"
            name="product_id"
            id="product_id"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="variant_id"
            className="block text-sm font-medium text-gray-700"
          >
            Variant ID
          </label>
          <input
            type="text"
            name="variant_id"
            id="variant_id"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="growth"
            className="block text-sm font-medium text-gray-700"
          >
            Growth
          </label>
          <select
            id="growth"
            name="growth"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="linear">Linear</option>
            <option value="logistic">Logistic</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="n_changepoints"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Changepoints
          </label>
          <input
            type="number"
            name="n_changepoints"
            id="n_changepoints"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="changepoint_range"
            className="block text-sm font-medium text-gray-700"
          >
            Changepoint Range
          </label>
          <input
            type="number"
            step="0.01"
            name="changepoint_range"
            id="changepoint_range"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="yearly_seasonality"
            className="block text-sm font-medium text-gray-700"
          >
            Yearly Seasonality
          </label>
          <select
            id="yearly_seasonality"
            name="yearly_seasonality"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="true">True</option>
            <option value="false">False</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="weekly_seasonality"
            className="block text-sm font-medium text-gray-700"
          >
            Weekly Seasonality
          </label>
          <select
            id="weekly_seasonality"
            name="weekly_seasonality"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="true">True</option>
            <option value="false">False</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="daily_seasonality"
            className="block text-sm font-medium text-gray-700"
          >
            Daily Seasonality
          </label>
          <select
            id="daily_seasonality"
            name="daily_seasonality"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="true">True</option>
            <option value="false">False</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="seasonality_mode"
            className="block text-sm font-medium text-gray-700"
          >
            Seasonality Mode
          </label>
          <select
            id="seasonality_mode"
            name="seasonality_mode"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="additive">Additive</option>
            <option value="multiplicative">Multiplicative</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="seasonality_prior_scale"
            className="block text-sm font-medium text-gray-700"
          >
            Seasonality Prior Scale
          </label>
          <input
            type="number"
            step="0.1"
            name="seasonality_prior_scale"
            id="seasonality_prior_scale"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="holidays_prior_scale"
            className="block text-sm font-medium text-gray-700"
          >
            Holidays Prior Scale
          </label>
          <input
            type="number"
            step="0.1"
            name="holidays_prior_scale"
            id="holidays_prior_scale"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="changepoint_prior_scale"
            className="block text-sm font-medium text-gray-700"
          >
            Changepoint Prior Scale
          </label>
          <input
            type="number"
            step="0.1"
            name="changepoint_prior_scale"
            id="changepoint_prior_scale"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="mcmc_samples"
            className="block text-sm font-medium text-gray-700"
          >
            MCMC Samples
          </label>
          <input
            type="number"
            name="mcmc_samples"
            id="mcmc_samples"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="interval_width"
            className="block text-sm font-medium text-gray-700"
          >
            Interval Width
          </label>
          <input
            type="number"
            step="0.01"
            name="interval_width"
            id="interval_width"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="uncertainty_samples"
            className="block text-sm font-medium text-gray-700"
          >
            Uncertainty Samples
          </label>
          <input
            type="number"
            name="uncertainty_samples"
            id="uncertainty_samples"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="stan_backend"
            className="block text-sm font-medium text-gray-700"
          >
            STAN Backend
          </label>
          <input
            type="text"
            name="stan_backend"
            id="stan_backend"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Model Settings
        </button>
      </div>
    </div>
  );
}

// Product Settings Form Component
function ProductSettingsForm() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Product Settings
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="product_id"
            className="block text-sm font-medium text-gray-700"
          >
            Product ID
          </label>
          <input
            type="text"
            name="product_id"
            id="product_id"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="variant_id"
            className="block text-sm font-medium text-gray-700"
          >
            Variant ID
          </label>
          <input
            type="text"
            name="variant_id"
            id="variant_id"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="safety_stock_calculation_method"
            className="block text-sm font-medium text-gray-700"
          >
            Safety Stock Calculation Method
          </label>
          <select
            id="safety_stock_calculation_method"
            name="safety_stock_calculation_method"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="standard_deviation">Standard Deviation</option>
            <option value="service_level">Service Level</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="service_level"
            className="block text-sm font-medium text-gray-700"
          >
            Service Level
          </label>
          <input
            type="number"
            step="0.01"
            name="service_level"
            id="service_level"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="classification"
            className="block text-sm font-medium text-gray-700"
          >
            Classification
          </label>
          <select
            id="classification"
            name="classification"
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="A">A (High Priority)</option>
            <option value="B">B (Medium Priority)</option>
            <option value="C">C (Low Priority)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="fill_rate"
            className="block text-sm font-medium text-gray-700"
          >
            Fill Rate
          </label>
          <input
            type="number"
            step="0.01"
            name="fill_rate"
            id="fill_rate"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="croston_demand_smoothing"
            className="block text-sm font-medium text-gray-700"
          >
            Croston Demand Smoothing
          </label>
          <input
            type="number"
            step="0.01"
            name="croston_demand_smoothing"
            id="croston_demand_smoothing"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="croston_interval_smoothing"
            className="block text-sm font-medium text-gray-700"
          >
            Croston Interval Smoothing
          </label>
          <input
            type="number"
            step="0.01"
            name="croston_interval_smoothing"
            id="croston_interval_smoothing"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Product Settings
        </button>
      </div>
    </div>
  );
}

// Holidays Form Component
interface HolidaysFormProps {
  holidays: Holiday[];
  setHolidays: (holidays: Holiday[]) => void;
}

function HolidaysForm({ holidays, setHolidays }: HolidaysFormProps) {
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [lowerWindow, setLowerWindow] = useState<number>(0);
  const [upperWindow, setUpperWindow] = useState<number>(0);
  const [priorScale, setPriorScale] = useState<number>(10);

  const addHoliday = () => {
    if (name && date) {
      setHolidays([
        ...holidays,
        { name, date, lowerWindow, upperWindow, priorScale },
      ]);
      setName("");
      setDate("");
      setLowerWindow(0);
      setUpperWindow(0);
      setPriorScale(10);
    }
  };

  const removeHoliday = (index: number) => {
    const newHolidays = [...holidays];
    newHolidays.splice(index, 1);
    setHolidays(newHolidays);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Holidays Configuration
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-5">
        <div className="md:col-span-2">
          <label
            htmlFor="holiday_name"
            className="block text-sm font-medium text-gray-700"
          >
            Holiday Name
          </label>
          <input
            type="text"
            name="holiday_name"
            id="holiday_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="holiday_date"
            className="block text-sm font-medium text-gray-700"
          >
            Date
          </label>
          <input
            type="date"
            name="holiday_date"
            id="holiday_date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="lower_window"
            className="block text-sm font-medium text-gray-700"
          >
            Lower Window
          </label>
          <input
            type="number"
            name="lower_window"
            id="lower_window"
            value={lowerWindow}
            onChange={(e) => setLowerWindow(parseInt(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="upper_window"
            className="block text-sm font-medium text-gray-700"
          >
            Upper Window
          </label>
          <input
            type="number"
            name="upper_window"
            id="upper_window"
            value={upperWindow}
            onChange={(e) => setUpperWindow(parseInt(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="prior_scale"
            className="block text-sm font-medium text-gray-700"
          >
            Prior Scale
          </label>
          <input
            type="number"
            step="0.1"
            name="prior_scale"
            id="prior_scale"
            value={priorScale}
            onChange={(e) => setPriorScale(parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="md:col-span-3 flex items-end">
          <button
            type="button"
            onClick={addHoliday}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Holiday
          </button>
        </div>
      </div>

      {holidays.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-700 mb-4">
            Added Holidays
          </h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Lower Window
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Upper Window
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Prior Scale
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {holidays.map((holiday, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {holiday.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {holiday.date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {holiday.lowerWindow}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {holiday.upperWindow}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {holiday.priorScale}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => removeHoliday(index)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Holidays
        </button>
      </div>
    </div>
  );
}

// Custom Seasonality Form Component
interface CustomSeasonalityFormProps {
  customSeasonalities: CustomSeasonality[];
  setCustomSeasonalities: (seasonalities: CustomSeasonality[]) => void;
}

function CustomSeasonalityForm({
  customSeasonalities,
  setCustomSeasonalities,
}: CustomSeasonalityFormProps) {
  const [name, setName] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [fourierOrder, setFourierOrder] = useState<number>(3);
  const [priorScale, setPriorScale] = useState<number>(10);
  const [mode, setMode] = useState<string>("additive");
  const [conditionName, setConditionName] = useState<string>("");

  const addSeasonality = () => {
    if (name && period) {
      setCustomSeasonalities([
        ...customSeasonalities,
        {
          name,
          period,
          fourierOrder,
          priorScale,
          mode,
          conditionName,
        },
      ]);
      setName("");
      setPeriod("");
      setFourierOrder(3);
      setPriorScale(10);
      setMode("additive");
      setConditionName("");
    }
  };

  const removeSeasonality = (index: number) => {
    const newSeasonalities = [...customSeasonalities];
    newSeasonalities.splice(index, 1);
    setCustomSeasonalities(newSeasonalities);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Custom Seasonality Configuration
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <label
            htmlFor="seasonality_name"
            className="block text-sm font-medium text-gray-700"
          >
            Seasonality Name
          </label>
          <input
            type="text"
            name="seasonality_name"
            id="seasonality_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="period"
            className="block text-sm font-medium text-gray-700"
          >
            Period (days)
          </label>
          <input
            type="number"
            step="0.1"
            name="period"
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="fourier_order"
            className="block text-sm font-medium text-gray-700"
          >
            Fourier Order
          </label>
          <input
            type="number"
            name="fourier_order"
            id="fourier_order"
            value={fourierOrder}
            onChange={(e) => setFourierOrder(parseInt(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="prior_scale"
            className="block text-sm font-medium text-gray-700"
          >
            Prior Scale
          </label>
          <input
            type="number"
            step="0.1"
            name="prior_scale"
            id="prior_scale"
            value={priorScale}
            onChange={(e) => setPriorScale(parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="mode"
            className="block text-sm font-medium text-gray-700"
          >
            Mode
          </label>
          <select
            id="mode"
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="additive">Additive</option>
            <option value="multiplicative">Multiplicative</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="condition_name"
            className="block text-sm font-medium text-gray-700"
          >
            Condition Name
          </label>
          <input
            type="text"
            name="condition_name"
            id="condition_name"
            value={conditionName}
            onChange={(e) => setConditionName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="md:col-span-3 flex items-end">
          <button
            type="button"
            onClick={addSeasonality}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Seasonality
          </button>
        </div>
      </div>

      {customSeasonalities.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-700 mb-4">
            Added Seasonalities
          </h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Period
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Fourier Order
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Prior Scale
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Mode
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Condition
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {customSeasonalities.map((seasonality, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {seasonality.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {seasonality.period}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {seasonality.fourierOrder}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {seasonality.priorScale}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {seasonality.mode}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {seasonality.conditionName || "-"}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => removeSeasonality(index)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Seasonalities
        </button>
      </div>
    </div>
  );
}

// Changepoints Form Component
interface ChangepointsFormProps {
  changepoints: Changepoint[];
  setChangepoints: (changepoints: Changepoint[]) => void;
}

function ChangepointsForm({
  changepoints,
  setChangepoints,
}: ChangepointsFormProps) {
  const [date, setDate] = useState<string>("");

  const addChangepoint = () => {
    if (date) {
      setChangepoints([...changepoints, { date }]);
      setDate("");
    }
  };

  const removeChangepoint = (index: number) => {
    const newChangepoints = [...changepoints];
    newChangepoints.splice(index, 1);
    setChangepoints(newChangepoints);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Changepoints Configuration
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label
            htmlFor="changepoint_date"
            className="block text-sm font-medium text-gray-700"
          >
            Changepoint Date
          </label>
          <input
            type="date"
            name="changepoint_date"
            id="changepoint_date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={addChangepoint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Changepoint
          </button>
        </div>
      </div>

      {changepoints.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-700 mb-4">
            Added Changepoints
          </h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Date
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {changepoints.map((changepoint, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {changepoint.date}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => removeChangepoint(index)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changepoints
        </button>
      </div>
    </div>
  );
}
