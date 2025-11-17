import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin section of the app",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex w-full h-full">
        <Sidebar />
        <div className="w-screen h-screen overflow-y-scroll overflow-x-hidden">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}