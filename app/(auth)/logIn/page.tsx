"use client";

import { useState } from "react";
import axios from "axios";
import { apiEndpoints } from "@/lib/apiEndpoints";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import toast from "react-hot-toast";

export default function LogIn() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { checkSession } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const response = await axios.post(
				apiEndpoints.login(),
				{
					username,
					password,
				},
				{
					withCredentials: true,
				},
			);

			console.log("Login success:", response.data);
			toast.success('Login successful!');

		
			await new Promise(resolve => setTimeout(resolve, 100));
			
		
			await checkSession();
			
		
			window.location.href = "/dashboard";
		} catch (err: any) {
			console.error("Login error:", err);
			const errorMessage = err.response?.data?.error || "Invalid username or password. Please try again.";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-screen h-screen flex justify-center items-center">
			<div className="form-container flex p-3 min-w-[900px] max-w-[1500px] rounded-2xl shadow-2xl items-center justify-center">
				<form onSubmit={handleSubmit} className="p-8">
					<div>
						<h1 className="text-3xl my-1">Welcome Back!</h1>
						<p className="ms-1 text-gray-500">Log in to your account.</p>
					</div>

					<div className="inputs-container my-6">
						<div className="input-group flex flex-col mb-3">
							<label htmlFor="username" className="text-xl">
								Username
							</label>
							<input
								type="text"
								id="username"
								className="border p-1 w-[300px] rounded"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>

						<div className="input-group flex flex-col mb-3">
							<label htmlFor="password" className="text-xl">
								Password
							</label>
							<input
								type="password"
								id="password"
								className="border p-1 w-[300px] rounded"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<Link href="/" className="text-[12px] text-blue-500">
							Forgot password?
						</Link>
					</div>

					{error && (
						<p className="text-red-500 text-sm my-2">⚠️ {error}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="rounded bg-purple-500 w-full text-white py-1 disabled:opacity-50"
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