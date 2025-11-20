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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

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

const isDropdownSection = (section: MenuSection): section is DropdownMenuSection => {
	return section.type === "dropdown";
}

const isSingleSection = (section: MenuSection): section is SingleMenuSection => {
	return section.type === "single";
}

export default function Sidebar() {
	const [isCollapsed, setIsCollapsed] = useState(false)
	const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())
	const pathname = usePathname()

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
				{ href: "/dashboard/inventory", label: "Stock Levels", icon: Warehouse },
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
				{ href: "/dashboard/forecast", label: "Sales Forecast", icon: TrendingUp }, 
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
		{
			id: "alerts",
			label: "Alerts",
			icon: TriangleAlert,
			href: "/dashboard/alerts",
			type: "single"
		},
	]

	const isActive = (href: string) => pathname === href

	return (
		<div
			className={`
				bg-white border-r border-[#E2E8F0]
				transition-all duration-300 ease-in-out h-screen relative
				${isCollapsed ? "w-16" : "w-64"}
				shadow-sm
			`}
		>
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

			<nav className="p-3 space-y-1">
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
				})}
			</nav>
		</div>
	)
}