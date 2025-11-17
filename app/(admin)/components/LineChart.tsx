import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LineChart() {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Sales Data",
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Upper Bound",
        data: [100, 200, 300, 400, 500, 600, 700, 700, 750, 800, 670, 790],
        borderColor: "purple",
        tension: 0.3,
      },
      {
        label: "Forecast",
        data: [150, 250, 360, 470, 560, 680, 760, 780, 760, 640, 670, 790],
        borderColor: "blue",
        tension: 0.3,
      },
      {
        label: "Lower Bound",
        data: [110, 220, 330, 440, 550, 660, 770, 780, 790, 760, 210, 80],
        borderColor: "cyan",
        tension: 0.3,
      },
      {
        label: "Actual Sales",
        data: [130, 230, 340, 460, 560, 640, 770, 740, 780, 800, 860, 900],
        borderColor: "violet",
        tension: 0.3,
      },
    ],
  };

  return (
    <div
      style={{
        position: "relative",
        height: "400px",
        width: "100%",
      }}
    >
      <Line options={options} data={data} />
    </div>
  );
}
