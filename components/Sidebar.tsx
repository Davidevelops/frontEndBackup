"use client"
import {
	Package,
	Warehouse,
	TriangleAlert,
	Settings,
	Blocks,
	Truck,
	ChevronLeft,
	ChevronRight,
	Users,
	UserRoundCog,
	ShoppingCart,
	Folder,
	ChevronDown,
	LayoutDashboard,
	Zap,
	TrendingUp,
	LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"
import apiClient from "@/lib/axiosConfig"

interface MenuItem {
	href: string;
	label: string;
	icon: React.ComponentType<any>;
}

interface SingleMenuSection {
	id: string;
	label: string;
	icon: React.ComponentType<any>;
	href: string;
	type: "single";
}

interface DropdownMenuSection {
	id: string;
	label: string;
	icon: React.ComponentType<any>;
	type: "dropdown";
	items: MenuItem[];
}

type MenuSection = SingleMenuSection | DropdownMenuSection;

// Type guard functions (moved outside component)
const isDropdownSection = (section: MenuSection): section is DropdownMenuSection => {
	return section.type === "dropdown";
}

const isSingleSection = (section: MenuSection): section is SingleMenuSection => {
	return section.type === "single";
}

// Menu sections (moved outside component)
const menuSections: MenuSection[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		href: "/dashboard",
		type: "single"
	},
	{
		id: "inventory",
		label: "Inventory",
		icon: Warehouse,
		type: "dropdown",
		items: [
			{ href: "/dashboard/products", label: "Products", icon: Blocks },
			{ href: "/dashboard/categories", label: "Categories", icon: Folder },
		]
	},
	{
		id: "supply-chain",
		label: "Supply Chain", 
		icon: Truck,
		type: "dropdown",
		items: [
			{ href: "/dashboard/suppliers", label: "Suppliers", icon: UserRoundCog },
			{ href: "/dashboard/deliveries", label: "Deliveries", icon: Truck },
		]
	},
	{
		id: "sales",
		label: "Sales",
		icon: ShoppingCart,
		type: "dropdown",
		items: [
			{ href: "/dashboard/sales", label: "Sales Data", icon: ShoppingCart }, 
		]
	},
	{
		id: "management",
		label: "Management",
		icon: Users,
		type: "dropdown", 
		items: [
			{ href: "/dashboard/accounts", label: "Accounts", icon: Users },
			{ href: "/dashboard/settings", label: "Settings", icon: Settings },
		]
	},
]

export default function Sidebar() {
	const [isCollapsed, setIsCollapsed] = useState(false)
	const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [showLogoutDialog, setShowLogoutDialog] = useState(false)
	const pathname = usePathname()
	const router = useRouter()

	// Active path checker
	const isActive = (href: string) => pathname === href

	const toggleDropdown = (dropdown: string) => {
		setOpenDropdowns(prev => {
			const newSet = new Set(prev)
			if (newSet.has(dropdown)) {
				newSet.delete(dropdown)
			} else {
				newSet.add(dropdown)
			}
			return newSet
		})
	}

	const handleLogout = async () => {
		try {
			setIsLoggingOut(true)
			console.log("🚪 Attempting logout...")

			// Call logout API endpoint
			const response = await apiClient.post("/auth/logout", {}, {
				headers: {
					"Content-Type": "application/json",
				},
			})

			if (response.status === 200) {
				console.log("✅ Logout successful:", response.data)
				toast.success("Logged out successfully!")

				// Clear any localStorage items
				if (typeof window !== "undefined") {
					localStorage.clear()
				}

				// Clear session cookies
				document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
				document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=inventorypro.local"

				// Give a small delay for cleanup
				await new Promise(resolve => setTimeout(resolve, 300))

				// Close dialog
				setShowLogoutDialog(false)

				// Redirect to login page
				router.push("/login")
			} else {
				throw new Error(`Unexpected response status: ${response.status}`)
			}

		} catch (error: any) {
			console.error("❌ Logout error:", error)

			// Handle different error scenarios
			let errorMessage = "Logout failed. Please try again."

			if (error.response) {
				const status = error.response.status
				const data = error.response.data

				if (status === 401) {
					errorMessage = "No active session"
					// Even if logout failed with 401, we should still clear local data
				} else if (status === 404) {
					errorMessage = "Logout endpoint not found"
					console.log("⚠️ Logout endpoint not found, manually clearing session")
				} else {
					errorMessage = data?.message || data?.error || `Error ${status}`
				}
			}

			toast.error(errorMessage)

			// Even if API call fails, try to clear local session
			try {
				if (typeof window !== "undefined") {
					localStorage.clear()
				}
				document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
				document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=inventorypro.local"
				
				// Close dialog
				setShowLogoutDialog(false)
				
				// Force redirect to login
				window.location.href = "/login"
			} catch (cleanupError) {
				console.error("❌ Cleanup error:", cleanupError)
			}

		} finally {
			setIsLoggingOut(false)
		}
	}

	const openLogoutDialog = () => {
		setShowLogoutDialog(true)
	}

	const closeLogoutDialog = () => {
		setShowLogoutDialog(false)
	}

	return (
		<>
			<div
				className={`
					bg-white border-r border-[#E2E8F0]
					transition-all duration-300 ease-in-out h-screen relative
					flex flex-col
					${isCollapsed ? "w-16" : "w-64"}
					shadow-sm
				`}
			>
				{/* Header Section */}
				<div className="flex-shrink-0">
					<div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
						<div
							className={`flex items-center gap-3 transition-all duration-300 ${
								isCollapsed
									? "opacity-0 scale-0 w-0"
									: "opacity-100 scale-100 w-auto"
							}`}
						>
							<div className="relative">
								<div className="bg-[#1E293B] p-2.5 rounded-lg relative overflow-hidden">
									<div className="relative z-10">
										<Package size={20} className="text-white" />
									</div>
								</div>
								<div className="absolute -top-1 -right-1">
									<Zap size={12} className="text-[#FBBF24] fill-[#FBBF24] animate-pulse" />
								</div>
							</div>
							
							<div>
								<h1 className="font-bold text-2xl text-[#0F172A]">
									InventoryPro
								</h1>
							</div>
						</div>

						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-all duration-200 shrink-0 group"
						>
							{isCollapsed ? (
								<ChevronRight size={16} className="text-[#334155] group-hover:text-[#0F172A]" />
							) : (
								<ChevronLeft size={16} className="text-[#334155] group-hover:text-[#0F172A]" />
							)}
						</button>
					</div>

					{/* Navigation Menu */}
					<nav className="p-3 space-y-1 flex-grow">
						{menuSections.map((section) => {
							const Icon = section.icon
							
							if (isSingleSection(section)) {
								const isActiveItem = isActive(section.href)
								
								return (
									<Link
										href={section.href}
										key={section.id}
										className={`
											flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group
											${
												isActiveItem
													? "bg-[#1E293B] text-white shadow-sm"
													: "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
											}
											${isCollapsed ? "justify-center" : ""}
										`}
									>
										<div className={`${isActiveItem ? "text-white" : "text-[#334155] group-hover:text-[#1E293B]"}`}>
											<Icon size={20} />
										</div>

										<span
											className={`
												font-medium text-sm transition-all duration-300
												${isCollapsed ? "opacity-0 w-0 absolute" : "opacity-100 w-auto"}
											`}
										>
											{section.label}
										</span>

										{isCollapsed && (
											<div className="absolute left-full ml-2 px-2 py-1 bg-[#1E293B] text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
												{section.label}
											</div>
										)}
									</Link>
								)
							}

							if (isDropdownSection(section)) {
								const isDropdownOpen = openDropdowns.has(section.id)
								const hasActiveChild = section.items.some(item => isActive(item.href))
								
								return (
									<div key={section.id}>
										<button
											onClick={() => toggleDropdown(section.id)}
											className={`
												flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group w-full
												${
													hasActiveChild
														? "bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]"
														: "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
												}
												${isCollapsed ? "justify-center" : ""}
											`}
										>
											<div className={`${hasActiveChild ? "text-[#1E293B]" : "text-[#334155] group-hover:text-[#1E293B]"}`}>
												<Icon size={20} />
											</div>

											<span
												className={`
													font-medium text-sm transition-all duration-300 flex-1 text-left
													${isCollapsed ? "opacity-0 w-0 absolute" : "opacity-100 w-auto"}
												`}
											>
												{section.label}
											</span>

											{!isCollapsed && (
												<ChevronDown
													size={16}
													className={`
														text-[#64748B] transition-transform duration-200
														${isDropdownOpen ? "rotate-180 text-[#1E293B]" : ""}
													`}
												/>
											)}

											{isCollapsed && (
												<div className="absolute left-full ml-2 px-2 py-1 bg-[#1E293B] text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
													{section.label}
												</div>
											)}
										</button>

										{!isCollapsed && isDropdownOpen && (
											<div className="ml-4 mt-1 space-y-1 border-l-2 border-[#E2E8F0] pl-3">
												{section.items.map((item) => {
													const ItemIcon = item.icon
													const isActiveItem = isActive(item.href)
													
													return (
														<Link
															href={item.href}
															key={item.href}
															className={`
																flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group
																${
																	isActiveItem
																		? "bg-[#1E293B] text-white shadow-sm"
																		: "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
																}
															`}
														>
															<ItemIcon
																size={16}
																className={isActiveItem ? "text-white" : "text-[#334155]"}
															/>
															<span className="font-medium text-sm">
																{item.label}
															</span>
														</Link>
													)
												})}
											</div>
										)}
									</div>
								)
							}
							
							return null
						})}
					</nav>
				</div>

				{/* Logout Button (Fixed at bottom) */}
				<div className="p-3 border-t border-[#E2E8F0] mt-auto">
					<button
						onClick={openLogoutDialog}
						disabled={isLoggingOut}
						className={`
							flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group w-full
							text-[#475569] hover:bg-red-50 hover:text-red-600
							disabled:opacity-50 disabled:cursor-not-allowed
							${isCollapsed ? "justify-center" : ""}
						`}
					>
						<div className="text-[#334155] group-hover:text-red-600">
							<LogOut size={20} />
						</div>

						<span
							className={`
								font-medium text-sm transition-all duration-300
								${isCollapsed ? "opacity-0 w-0 absolute" : "opacity-100 w-auto"}
							`}
						>
							Logout
						</span>

						{isCollapsed && (
							<div className="absolute left-full ml-2 px-2 py-1 bg-red-600 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
								Logout
							</div>
						)}
					</button>
				</div>
			</div>

			{/* Logout Confirmation Dialog (shadcn style) */}
			{showLogoutDialog && (
				<>
					{/* Backdrop */}
					<div 
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
						onClick={closeLogoutDialog}
					/>

					{/* Dialog */}
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div 
							className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in slide-in-from-bottom-8 duration-300"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Dialog Header */}
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-red-50 rounded-lg">
										<LogOut className="w-5 h-5 text-red-600" />
									</div>
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											Confirm Logout
										</h3>
										<p className="text-sm text-gray-500 mt-1">
											Are you sure you want to logout?
										</p>
									</div>
								</div>
							</div>

							{/* Dialog Content */}
							<div className="p-6">
								<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
									<div className="flex items-start gap-2">
										<TriangleAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
										<div>
											<p className="text-sm font-medium text-amber-800">
												This will clear your session
											</p>
											<p className="text-xs text-amber-600 mt-1">
												You'll need to login again to access the dashboard.
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Dialog Footer */}
							<div className="p-6 border-t border-gray-200 flex justify-end gap-3">
								<button
									type="button"
									onClick={closeLogoutDialog}
									disabled={isLoggingOut}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleLogout}
									disabled={isLoggingOut}
									className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
								>
									{isLoggingOut ? (
										<>
											<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
											Logging out...
										</>
									) : (
										<>
											<LogOut className="w-4 h-4" />
											Logout
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	)
}