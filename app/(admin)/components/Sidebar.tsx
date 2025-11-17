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
	const [openDropdown, setOpenDropdown] = useState<string | null>(null)
	const pathname = usePathname()

	const toggleDropdown = (dropdown: string) => {
		setOpenDropdown(openDropdown === dropdown ? null : dropdown)
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
			href: "/dashboard/sales",
			type: "single"
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
				bg-white/95 backdrop-blur-xl border-r border-gray-200/60
				transition-all duration-300 ease-in-out h-screen relative
				${isCollapsed ? "w-16" : "w-64"}
				shadow-xl
			`}
		>
			<div className="flex items-center justify-between p-4 border-b border-gray-200/40">
				<div
					className={`flex items-center gap-3 transition-all duration-300 ${
						isCollapsed
							? "opacity-0 scale-0 w-0"
							: "opacity-100 scale-100 w-auto"
					}`}
				>
					<div className="relative">
						<div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-2.5 rounded-xl shadow-lg shadow-purple-500/40 relative overflow-hidden">
							<div className="relative z-10">
								<Package size={20} className="text-white" />
							</div>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
						</div>
						<div className="absolute -top-1 -right-1">
							<Zap size={12} className="text-yellow-300 fill-yellow-300 animate-pulse" />
						</div>
					</div>
					
					<div>
						<h1 className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent drop-shadow-sm">
							InventoryPro
						</h1>
					</div>
				</div>

				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="p-2 hover:bg-purple-100/80 rounded-lg transition-all duration-200 shrink-0 group"
				>
					{isCollapsed ? (
						<ChevronRight size={16} className="text-purple-600 group-hover:text-purple-700" />
					) : (
						<ChevronLeft size={16} className="text-purple-600 group-hover:text-purple-700" />
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
									flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
									${
										isActiveItem
											? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/25"
											: "text-gray-600 hover:bg-purple-50/80 hover:text-purple-700 hover:shadow-sm"
									}
									${isCollapsed ? "justify-center" : ""}
								`}
							>
								<div className={`${isActiveItem ? "text-white" : "text-purple-500 group-hover:text-purple-600"}`}>
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
									<div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
										{section.label}
									</div>
								)}
							</Link>
						)
					}

					if (isDropdownSection(section)) {
						const isDropdownOpen = openDropdown === section.id
						const hasActiveChild = section.items.some(item => isActive(item.href))
						
						return (
							<div key={section.id}>
								<button
									onClick={() => toggleDropdown(section.id)}
									className={`
										flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group w-full
										${
											hasActiveChild
												? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200/60 shadow-sm"
												: "text-gray-600 hover:bg-purple-50/80 hover:text-purple-700 hover:shadow-sm"
										}
										${isCollapsed ? "justify-center" : ""}
									`}
								>
									<div className={`${hasActiveChild ? "text-purple-600" : "text-purple-500 group-hover:text-purple-600"}`}>
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
												text-purple-400 transition-transform duration-200
												${isDropdownOpen ? "rotate-180 text-purple-600" : ""}
											`}
										/>
									)}

									{isCollapsed && (
										<div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
											{section.label}
										</div>
									)}
								</button>

								{!isCollapsed && isDropdownOpen && (
									<div className="ml-4 mt-1 space-y-1 border-l-2 border-purple-200/40 pl-3">
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
																? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/25"
																: "text-gray-600 hover:bg-purple-50/80 hover:text-purple-700"
														}
													`}
												>
													<ItemIcon
														size={16}
														className={isActiveItem ? "text-white" : "text-purple-500"}
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