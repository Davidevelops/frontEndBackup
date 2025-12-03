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

// ----- SALES -----
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

// ----- ACCOUNTS -----
export type AccountRole = 'admin' | 'staff' | 'manager';

export const isAccountRole = (role: string): role is AccountRole => {
  return ['admin', 'staff', 'manager'].includes(role)
}

export interface AccountPermission {
	id: string
	name: string
}

export interface Account {
	id: string
	username: string
	role: AccountRole // Changed from string to AccountRole
	createdAt: string
	updatedAt: string
	deletedAt: string | null
	permissions?: AccountPermission[]
	isActive?: boolean // Derived from deletedAt
}

export interface CreateAccountRequest {
	username: string
	password: string
	role: AccountRole // Changed from string to AccountRole
	permissions?: string[] // Optional array of permission IDs
}

export interface UpdateAccountRequest {
	username?: string
	role?: AccountRole
}

export interface ChangePasswordRequest {
	password: string
	confirmPassword?: string // Optional for frontend validation
}

export interface AccountUpdateData {
	username?: string
	role?: AccountRole
}

export interface AccountWithPermissions extends Account {
	permissions: AccountPermission[]
}

// ----- PERMISSIONS -----
export interface Permission {
	id: string
	name: string
	description?: string
	module?: string
}

export interface AssignPermissionsRequest {
	permissions: string[]
}

export interface GrantPermissionRequest {
	permissionId: string
}

export interface BulkPermissionOperation {
	accountId: string
	permissionIds: string[]
	action: 'grant' | 'revoke'
}

// ----- API RESPONSES -----
export interface AccountsResponse {
	data: Account[]
	meta?: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

export interface PermissionsResponse {
	data: Permission[]
}

export interface SingleAccountResponse {
	data: Account
}

// ----- ACCOUNT FILTERS & STATS -----
export interface AccountFilters {
	role?: AccountRole | 'all'
	isActive?: boolean
	search?: string
	page?: number
	limit?: number
}

export type AccountStatus = 'active' | 'inactive' | 'archived'

export const isAccountStatus = (status: string): status is AccountStatus => {
	return ['active', 'inactive', 'archived'].includes(status)
}

export interface AccountStats {
	total: number
	active: number
	inactive: number
	byRole: {
		admin: number
		staff: number
		manager: number
	}
}

// ----- DELIVERIES -----
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

export type DeliveryStatus = "pending" | "completed" | "cancelled"

export const isDeliveryStatus = (status: string): status is DeliveryStatus => {
	return ["pending", "completed", "cancelled"].includes(status)
}

// ----- CATEGORIES -----
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

// ----- FORECASTS -----
export interface SalesData {
	date: string;
	productId: string;
	quantity: number;
	revenue: number;
}

export interface ForecastRequest {
	salesData: SalesData[];
	periods: number;
	confidenceLevel: number;
}

export interface ForecastResult {
	date: string;
	predictedSales: number;
	lowerBound: number;
	upperBound: number;
}

export interface ForecastResponse {
	data: {
		id: string;
		forecast: ForecastResult[];
		accuracy: number;
		generatedAt: string;
		metadata: {
			periods: number;
			method: string;
		};
	};
}

export interface Forecast {
	id: string;
	createdAt: string;
	updatedAt: string;
	dataDepth: number;
	forecastStartDate: string;
	forecastEndDate: string;
	entries?: ForecastEntry[];
}

export interface ForecastEntry {
	id: string;
	date: string;
	yhat: number;
	yhatLower: number;
	yhatUpper: number;
	forecastId: string;
}

export interface ForecastSelection {
	type: 'latest' | 'all' | 'specific';
	forecastId?: string;
}