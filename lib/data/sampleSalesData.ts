
export interface SalesData {
  date: string;
  productId: string;
  quantity: number;
  revenue: number;
}

export const sampleSalesData: SalesData[] = [
  // 2022 Data - Historical baseline
  { date: "2022-01-15", productId: "PROD001", quantity: 45, revenue: 2250.00 },
  { date: "2022-01-15", productId: "PROD002", quantity: 28, revenue: 1960.00 },
  { date: "2022-01-15", productId: "PROD003", quantity: 15, revenue: 1200.00 },
  { date: "2022-02-12", productId: "PROD001", quantity: 52, revenue: 2600.00 },
  { date: "2022-02-12", productId: "PROD002", quantity: 31, revenue: 2170.00 },
  { date: "2022-02-12", productId: "PROD003", quantity: 18, revenue: 1440.00 },
  { date: "2022-03-19", productId: "PROD001", quantity: 48, revenue: 2400.00 },
  { date: "2022-03-19", productId: "PROD002", quantity: 25, revenue: 1750.00 },
  { date: "2022-03-19", productId: "PROD003", quantity: 22, revenue: 1760.00 },
  
  // 2023 Data - Growth year
  { date: "2023-01-14", productId: "PROD001", quantity: 65, revenue: 3250.00 },
  { date: "2023-01-14", productId: "PROD002", quantity: 35, revenue: 2450.00 },
  { date: "2023-01-14", productId: "PROD003", quantity: 25, revenue: 2000.00 },
  { date: "2023-02-11", productId: "PROD001", quantity: 72, revenue: 3600.00 },
  { date: "2023-02-11", productId: "PROD002", quantity: 42, revenue: 2940.00 },
  { date: "2023-02-11", productId: "PROD003", quantity: 28, revenue: 2240.00 },
  { date: "2023-03-18", productId: "PROD001", quantity: 68, revenue: 3400.00 },
  { date: "2023-03-18", productId: "PROD002", quantity: 38, revenue: 2660.00 },
  { date: "2023-03-18", productId: "PROD003", quantity: 32, revenue: 2560.00 },
  { date: "2023-04-15", productId: "PROD001", quantity: 75, revenue: 3750.00 },
  { date: "2023-04-15", productId: "PROD002", quantity: 45, revenue: 3150.00 },
  { date: "2023-04-15", productId: "PROD003", quantity: 35, revenue: 2800.00 },
  { date: "2023-05-13", productId: "PROD001", quantity: 82, revenue: 4100.00 },
  { date: "2023-05-13", productId: "PROD002", quantity: 48, revenue: 3360.00 },
  { date: "2023-05-13", productId: "PROD003", quantity: 38, revenue: 3040.00 },
  { date: "2023-06-17", productId: "PROD001", quantity: 78, revenue: 3900.00 },
  { date: "2023-06-17", productId: "PROD002", quantity: 52, revenue: 3640.00 },
  { date: "2023-06-17", productId: "PROD003", quantity: 42, revenue: 3360.00 },
  
  // 2024 Data - Current year with seasonal patterns
  { date: "2024-01-13", productId: "PROD001", quantity: 85, revenue: 4250.00 },
  { date: "2024-01-13", productId: "PROD002", quantity: 55, revenue: 3850.00 },
  { date: "2024-01-13", productId: "PROD003", quantity: 45, revenue: 3600.00 },
  { date: "2024-02-10", productId: "PROD001", quantity: 92, revenue: 4600.00 },
  { date: "2024-02-10", productId: "PROD002", quantity: 58, revenue: 4060.00 },
  { date: "2024-02-10", productId: "PROD003", quantity: 48, revenue: 3840.00 },
  { date: "2024-03-16", productId: "PROD001", quantity: 88, revenue: 4400.00 },
  { date: "2024-03-16", productId: "PROD002", quantity: 62, revenue: 4340.00 },
  { date: "2024-03-16", productId: "PROD003", quantity: 52, revenue: 4160.00 },
  { date: "2024-04-13", productId: "PROD001", quantity: 95, revenue: 4750.00 },
  { date: "2024-04-13", productId: "PROD002", quantity: 65, revenue: 4550.00 },
  { date: "2024-04-13", productId: "PROD003", quantity: 55, revenue: 4400.00 },
  { date: "2024-05-11", productId: "PROD001", quantity: 102, revenue: 5100.00 },
  { date: "2024-05-11", productId: "PROD002", quantity: 68, revenue: 4760.00 },
  { date: "2024-05-11", productId: "PROD003", quantity: 58, revenue: 4640.00 },
  { date: "2024-06-15", productId: "PROD001", quantity: 98, revenue: 4900.00 },
  { date: "2024-06-15", productId: "PROD002", quantity: 72, revenue: 5040.00 },
  { date: "2024-06-15", productId: "PROD003", quantity: 62, revenue: 4960.00 },
];

export const downloadTemplate = () => {
  const csvContent = [
    ["date", "productId", "quantity", "revenue"],
    ...sampleSalesData.map(item => [
      item.date,
      item.productId,
      item.quantity.toString(),
      item.revenue.toFixed(2)
    ])
  ].map(row => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sales-data-template.csv";
  link.click();
  URL.revokeObjectURL(url);
};