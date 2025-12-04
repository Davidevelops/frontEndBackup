"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import apiClient from "@/lib/axiosConfig";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();

  // Check if user already has a valid session
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Checking existing session...");
        // Check session endpoint - adjust if your endpoint is different
        const response = await apiClient.get("/auth/session");
        
        if (response.data?.data) {
          console.log("✅ Valid session found, redirecting to dashboard");
          toast.success("Already logged in!");
          router.push("/dashboard");
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log("🔐 No valid session found");
        } else {
          console.error("❌ Error checking session:", error);
        }
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!username.trim() || !password.trim()) {
        toast.error("Please enter both username and password");
        setIsLoading(false);
        return;
      }

      console.log("🔐 Attempting login to /auth/login...");

      // Make API call to login endpoint
      const response = await apiClient.post("/auth/login", {
        username: username.trim(),
        password: password.trim(),
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Login response:", response.data);

      if (response.status === 200) {
        console.log("✅ Login successful");
        toast.success("Login successful!");

        // Wait a moment for the session cookie to be set
        await new Promise(resolve => setTimeout(resolve, 300));

        // Redirect to dashboard
        router.push("/dashboard");
        
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error: any) {
      console.error("❌ Login error:", error);

      // Handle different error scenarios
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = data?.error || "Invalid username or password";
        } else if (status === 400) {
          errorMessage = data?.message || "Invalid request format";
        } else if (status === 404) {
          errorMessage = "Login endpoint not found";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later";
        } else {
          errorMessage = data?.message || data?.error || `Error ${status}`;
        }
      } else if (error.request) {
        // Request was made but no response
        errorMessage = "No response from server. Check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || "An unexpected error occurred";
      }

      toast.error(errorMessage);
      
      // Clear password on error
      setPassword("");
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStorage = () => {
    if (typeof window !== "undefined") {
      // Clear localStorage
      localStorage.clear();
      
      // Clear session cookie (name from your backend: "session")
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=inventorypro.local";
      
      toast.success("Storage and cookies cleared successfully");
      
      // Force reload to clear any in-memory state
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-[#F5F7FA] to-[#E8ECF1]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A4A5A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3A4A5A]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-[#F5F7FA] to-[#E8ECF1]">
      <div className="form-container flex p-0 min-w-[900px] max-w-[1500px] rounded-3xl shadow-2xl overflow-hidden bg-white border border-[#D5DDE5]">
        {/* Left side - Login Form */}
        <div className="w-[50%] p-12 flex flex-col justify-center">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3A4A5A] to-[#2A3036] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-[#2A3036] tracking-tight">Inventory Pro</span>
            </div>
            <h1 className="text-4xl font-bold mb-3 text-[#2A3036] leading-tight">Welcome Back!</h1>
            <p className="text-lg text-[#7C8A96]">Log in to continue managing your inventory.</p>
          </div>

          <form onSubmit={handleLogin} className="flex-1">
            <div className="inputs-container my-6">
              {/* Username Field */}
              <div className="input-group flex flex-col mb-6">
                <label htmlFor="username" className="text-xl text-[#2A3036] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="border border-[#D5DDE5] p-4 w-full rounded-lg bg-white text-[#2A3036] focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:border-transparent transition-colors text-lg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  placeholder="Enter your username"
                />
              </div>

              {/* Password Field */}
              <div className="input-group flex flex-col mb-6">
                <label htmlFor="password" className="text-xl text-[#2A3036] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="border border-[#D5DDE5] p-4 w-full rounded-lg bg-white text-[#2A3036] focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:border-transparent transition-colors text-lg pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7C8A96] hover:text-[#3A4A5A] transition-colors p-2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.411 3.411M9.88 9.88l-3.41-3.41m9.02 9.02l3.411 3.411M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#3A4A5A] hover:bg-[#2A3036] text-white text-lg font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>

            {/* Debug Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Debug Info:</p>
              <p className="text-xs text-gray-500 mb-1">
                API Endpoint: {process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Auth Type: Session-based (cookie)
              </p>
              <p className="text-xs text-gray-500">
                Cookies: {document.cookie ? "Present" : "None"}
              </p>
              <button
                type="button"
                onClick={handleClearStorage}
                className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
              >
                Clear Storage & Cookies
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("Current cookies:", document.cookie);
                  toast.success("Cookies logged to console");
                }}
                className="mt-2 ml-4 text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Log Cookies
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Image */}
        <div className="w-[50%] min-h-[600px] max-h-[1200px] relative">
          <Image
            src="/assets/authImage.jpg"
            alt="Inventory Management"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
        </div>
      </div>
    </div>
  );
}