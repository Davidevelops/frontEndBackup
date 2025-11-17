export default function SettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <section className="bg-white shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Model Configuration</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Forecast Horizon (days)
            </label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              placeholder="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Seasonality</label>
            <select className="w-full border rounded-md p-2">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Seasonality Mode
            </label>
            <select className="w-full border rounded-md p-2">
              <option>Additive</option>
              <option>Multiplicative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Growth Type</label>
            <select className="w-full border rounded-md p-2">
              <option>Linear</option>
              <option>Logistic</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Inventory & Restocking</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Safety Stock Threshold
            </label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              placeholder="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Lead Time (days)
            </label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              placeholder="7"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Restock Quantity Rule
            </label>
            <select className="w-full border rounded-md p-2">
              <option>Fixed Amount</option>
              <option>Forecast-Based</option>
              <option>% of Average Demand</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Notification Preference
            </label>
            <select className="w-full border rounded-md p-2">
              <option>In-app</option>
              <option>Email</option>
              <option>SMS</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Alerts & Notifications</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Low Stock Alert (units)
            </label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              placeholder="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Overstock Alert (%)
            </label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              placeholder="150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Forecast Deviation Alert (%)
            </label>
            <input
              type="number"
              className="w-full border rounded-md p-2"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Reminder Frequency
            </label>
            <select className="w-full border rounded-md p-2">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">User Preferences</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Currency</label>
            <select className="w-full border rounded-md p-2">
              <option>USD</option>
              <option>PHP</option>
              <option>EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Time Zone</label>
            <select className="w-full border rounded-md p-2">
              <option>GMT+8 (Philippines)</option>
              <option>GMT</option>
              <option>EST</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">System Settings</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Update Frequency
            </label>
            <select className="w-full border rounded-md p-2">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Manual</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600">
              Reset to Defaults
            </button>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700">
          Save Settings
        </button>
      </div>
    </div>
  );
}
