
export interface VariantSetting {
	classification: string
	serviceLevel: number
	fillRate: number
	safetyStockCalculationMethod: string
}

export interface CreateVariantInput {
	name: string
	setting?: {
		classification: string
		serviceLevel: number
		fillRate: number
		safetyStockCalculationMethod: string
	}
}

export interface ProductVariant {
	id: string
	name: string
	stock: number
	safetyStock: number
	updatedAt: string
	groupId: string
	setting?: VariantSetting
}

export interface SingleProduct {
	id: string
	groupId: string
	accountId: string
	name: string
	safetyStock: number
	stock: number
	createdAt: string
	updatedAt: string
	deletedAt: string | null
	setting: VariantSetting
}

export interface ProductGroup {
	accountId: string
	createdAt: string
	deletedAt: string | null
	id: string
	name: string
	productCategoryId: string | null
	updatedAt: string
	products: SingleProduct[]
}

export interface Product {
	products: ProductGroup[]
}

export interface Supplier {
	id: string
	accountId: string
	name: string
	leadTime: number
	createdAt: string
	deletedAt: string | null
	updatedAt: string
	products: any[]
}

export interface Sale {
	id: string
	accountId: string
	productId: string
	quantity: number
	status: string
	date: string
	createdAt: string
	updatedAt: string
	deletedAt: string | null
}

export interface SalesResponse {
	data: Sale[]
}

export interface AccountPermission {
	id: string
	name: string
}

export interface Account {
	id: string
	username: string
	role: string
	createdAt: string
	updatedAt: string
	deletedAt: string | null
	permissions?: AccountPermission[]
}

export interface CreateAccountRequest {
	username: string
	password: string
	role: string
}

export interface Permission {
	id: string
	name: string
}

export interface AssignPermissionsRequest {
	permissions: string[]
}

export interface DeliveryProduct {
	id: string
	name: string
	stock: number
}

export interface DeliveryItem {
	id: string
	product: DeliveryProduct
	quantity: number
}

export interface DeliverySupplier {
	id: string
	leadTime: number
	name: string
}

export interface Delivery {
	id: string
	accountId: string
	status: "pending" | "completed" | "cancelled"
	requestedAt: string
	scheduledArrivalDate: string
	completedAt: string | null
	cancelledAt: string | null
	createdAt: string
	updatedAt: string
	deletedAt: string | null
	supplier: DeliverySupplier
	items: DeliveryItem[]
}

export interface DeliveriesResponse {
	data: Delivery[]
}

export interface CreateDeliveryItem {
	productId: string
	quantity: number
}

export interface CreateDeliveryData {
	items: CreateDeliveryItem[]
	status: "pending" | "completed" | "cancelled"
	supplierId: string
}

export interface UpdateDeliveryStatusData {
	status: "pending" | "completed" | "cancelled"
	cancelledAt?: string
}

export interface UpdateDeliveryScheduleData {
	requestedAt: string
	scheduledArrivalDate: string
}

export interface Sale {
	id: string
	accountId: string
	productId: string
	quantity: number
	status: string
	date: string
	createdAt: string
	updatedAt: string
	deletedAt: string | null
}

export interface SalesResponse {
	data: Sale[]
}

export type SaleStatus = "completed" | "pending" | "cancelled"

export const isSaleStatus = (status: string): status is SaleStatus => {
	return ["completed", "pending", "cancelled"].includes(status)
}

export type DeliveryStatus = "pending" | "completed" | "cancelled"

export const isDeliveryStatus = (status: string): status is DeliveryStatus => {
	return ["pending", "completed", "cancelled"].includes(status)
}

export interface Category {
	id: string
	accountId: string
	name: string
	createdAt: string
	updatedAt: string
	deletedAt: string | null
	productGroups: any[]
}

export interface CategoriesResponse {
	data: Category[]
}