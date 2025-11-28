"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import toast from "react-hot-toast";

export default function LogIn() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { checkSession } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			
			const response = await login({ username, password });

			console.log("Login success:", response);
			toast.success('Login successful!');

			
			await new Promise(resolve => setTimeout(resolve, 100));
			
			
			await checkSession();
			
		
			window.location.href = "/dashboard";
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
		<div className="w-screen h-screen flex justify-center items-center bg-[#F5F7FA]">
			<div className="form-container flex p-3 min-w-[900px] max-w-[1500px] rounded-2xl shadow-lg items-center justify-center bg-white border border-[#D5DDE5]">
				<form onSubmit={handleSubmit} className="p-8">
					<div>
						<h1 className="text-3xl my-1 text-[#2A3036]">Welcome Back!</h1>
						<p className="ms-1 text-[#7C8A96]">Log in to your account.</p>
					</div>

					<div className="inputs-container my-6">
						<div className="input-group flex flex-col mb-3">
							<label htmlFor="username" className="text-xl text-[#2A3036]">
								Username
							</label>
							<input
								type="text"
								id="username"
								className="border border-[#D5DDE5] p-3 w-[300px] rounded-lg bg-white text-[#2A3036] focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:border-transparent transition-colors"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
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
								/>
								<button
									type="button"
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7C8A96] hover:text-[#3A4A5A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:ring-offset-2 rounded p-1"
									onClick={togglePasswordVisibility}
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

						<Link href="/" className="text-[12px] text-[#62778C] hover:text-[#3A4A5A] transition-colors">
							Forgot password?
						</Link>
					</div>

					{error && (
						<p className="text-red-500 text-sm my-2 bg-red-50 p-2 rounded-lg border border-red-200">⚠️ {error}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="rounded-lg bg-[#3A4A5A] hover:bg-[#31414F] disabled:bg-[#A7B3C0] w-full text-white py-3 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3A4A5A] focus:ring-offset-2"
					>
						{loading ? "Logging in..." : "Log in"}
					</button>
				</form>

				<div className="image-container w-[50%] min-h-[600px] max-h-[1200px] relative">
					<Image
						src={"/assets/authImage.jpg"}
						alt="auth image"
						fill
						className="object-contain"
					/>
				</div>
			</div>
		</div>
	);
}