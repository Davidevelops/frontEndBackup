"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // Added import

export default function LogIn() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { checkSession } = useAuth();
	const router = useRouter(); // Added router hook

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const response = await login({ username, password });
			console.log("Login success:", response);
			toast.success('Login successful!');
			
			// Removed the artificial delay
			// await new Promise(resolve => setTimeout(resolve, 100));
			
			await checkSession();
			
			// FIXED: Use Next.js router instead of window.location
			router.push("/dashboard");
			// Optional: Force a refresh to update all components
			router.refresh();
			
		} catch (err: any) {
			console.error("Login error:", err);
			const errorMessage = err.response?.data?.error || err.message || "Invalid username or password. Please try again.";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-[#F5F7FA] to-[#E8ECF1]">
			<div className="form-container flex p-0 min-w-[900px] max-w-[1500px] rounded-3xl shadow-2xl overflow-hidden bg-white border border-[#D5DDE5]">
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

					<form onSubmit={handleSubmit} className="flex-1">
						<div className="inputs-container my-6">
							<div className="input-group flex flex-col mb-3">
								<label htmlFor="username" className="text-xl text-[#2A3036]">
									Username
								</label>
								<input
									type="text"
									id="username"
									className="border border-[#D5DDE5] p-3 w-full rounded-lg bg-white text-[#2A3036] focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:border-transparent transition-colors"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
									disabled={loading}
								/>
							</div>

							<div className="input-group flex flex-col mb-3">
								<label htmlFor="password" className="text-xl text-[#2A3036]">
									Password
								</label>
								<div className="relative">
									<input
										type={showPassword ? "text" : "password"}
										id="password"
										className="border border-[#D5DDE5] p-3 w-full rounded-lg bg-white text-[#2A3036] focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:border-transparent transition-colors pr-12"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										disabled={loading}
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7C8A96] hover:text-[#3A4A5A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:ring-offset-2 rounded p-1"
										onClick={togglePasswordVisibility}
										disabled={loading}
									>
										{showPassword ? (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.411 3.411M9.88 9.88l-3.41-3.41m9.02 9.02l3.411 3.411M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
										) : (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
										)}
									</button>
								</div>
							</div>

							{/* Debug link - remove in production */}
							<div className="mt-4 text-sm">
								<Link 
									href="/test" 
									className="text-[#62778C] hover:text-[#3A4A5A] transition-colors"
								>
									Test if routing works →
								</Link>
							</div>
						</div>

						{error && (
							<div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-600 font-medium">Login Error:</p>
								<p className="text-red-500 text-sm mt-1">{error}</p>
								<p className="text-xs text-gray-500 mt-2">
									If this persists, check browser console (F12) for details.
								</p>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="rounded-lg bg-[#3A4A5A] hover:bg-[#31414F] disabled:bg-[#A7B3C0] w-full text-white py-3 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:ring-offset-2 flex items-center justify-center"
						>
							{loading ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Logging in...
								</>
							) : "Log in"}
						</button>

						{/* Debug info - remove in production */}
						<div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
							<p className="text-xs text-gray-600 mb-1">Debug Info:</p>
							<p className="text-xs text-gray-500">
								Router ready: {router ? "Yes" : "No"} | 
								Path: {typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}
							</p>
						</div>
					</form>
				</div>

				<div className="image-container w-[50%] min-h-[600px] max-h-[1200px] relative">
					<Image
						src={"/assets/authImage.jpg"}
						alt="auth image"
						fill
						className="object-cover"
						priority // Add priority for faster loading
					/>
				</div>
			</div>
		</div>
	);
}