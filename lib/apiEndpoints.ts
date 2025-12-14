export class ApiEndpoints {
	private backendUrl: string

	constructor() {
		const url = process.env.NEXT_PUBLIC_BACKEND_URL
		if (!url) {
			throw new Error("NEXT_PUBLIC_BACKEND_URL not declared in .env")
		}
		this.backendUrl = url
	}

	// Account endpoints
	account(accountId?: string) {
		if (accountId) {
			return `${this.backendUrl}/accounts/${accountId}`
		} else {
			return `${this.backendUrl}/accounts`
		}
	}

	permissions() {
		return `${this.backendUrl}/accounts/permissions`
	}

	accountPermissions(accountId: string, permissionId?: string) {
		if (permissionId) {
			return `${this.backendUrl}/accounts/${accountId}/permissions/${permissionId}`
		} else {
			return `${this.backendUrl}/accounts/${accountId}/permissions`
		}
	}

	accountPassword(accountId: string) {
		return `${this.backendUrl}/accounts/${accountId}/password`
	}

	// Authentication endpoints
	login() {
		return `${this.backendUrl}/auth/login`
	}

	session() {
		return `${this.backendUrl}/auth/session`
	}
	
	// Product Groups endpoints
	productGroups(groupId?: string, queryParams?: Record<string, string | number | boolean>) {
		let baseUrl = `${this.backendUrl}/groups`;
		
		if (groupId) {
			baseUrl += `/${groupId}`;
		}
		
		if (queryParams) {
			const params = new URLSearchParams();
			Object.entries(queryParams).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, value.toString());
				}
			});
			baseUrl += `?${params.toString()}`;
		}
		
		return baseUrl;
	}

	// Product Groups Count endpoint - ADD THIS METHOD
	productGroupsCount() {
		return `${this.backendUrl}/groups/count`;
	}

	// Product Group update endpoint (PUT/PATCH)
	productGroupUpdate(groupId: string) {
		return `${this.backendUrl}/groups/${groupId}`;
	}

	// Product Group archive endpoint (DELETE)
	productGroupArchive(groupId: string) {
		return `${this.backendUrl}/groups/${groupId}`;
	}

	// Product Group unarchive endpoint (PATCH)
	productGroupUnarchive(groupId: string) {
		return `${this.backendUrl}/groups/${groupId}/unarchive`;
	}

	// Product endpoints
	product(groupId: string, productId?: string) {
		if (productId) {
			return `${this.backendUrl}/groups/${groupId}/products/${productId}`
		} else {
			return `${this.backendUrl}/groups/${groupId}/products`
		}
	}

	// Product sales endpoints
	productSales(groupId: string, productId: string, saleId?: string) {
		if (saleId) {
			return `${this.backendUrl}/groups/${groupId}/products/${productId}/sales/${saleId}`
		} else {
			return `${this.backendUrl}/groups/${groupId}/products/${productId}/sales`
		}
	}

	// Sales endpoints
	sales(saleId?: string) {
		if (saleId) {
			return `${this.backendUrl}/sales/${saleId}`
		} else {
			return `${this.backendUrl}/sales`
		}
	}

	// Categories endpoints
	categories(categoryId?: string, queryParams?: Record<string, string | number | boolean>) {
		let baseUrl = `${this.backendUrl}/categories`;
		
		if (categoryId) {
			baseUrl += `/${categoryId}`;
		}
		
		if (queryParams) {
			const params = new URLSearchParams();
			Object.entries(queryParams).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, value.toString());
				}
			});
			baseUrl += `?${params.toString()}`;
		}
		
		return baseUrl;
	}

	// Forecast endpoints
	forecast(groupId: string, productId: string, forecastId?: string, queryParams?: Record<string, string | number | boolean>) {
		let baseUrl = `${this.backendUrl}/groups/${groupId}/products/${productId}/forecasts`;
		
		if (forecastId) {
			baseUrl += `/${forecastId}`;
		}
		
		if (queryParams) {
			const params = new URLSearchParams();
			Object.entries(queryParams).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, value.toString());
				}
			});
			baseUrl += `?${params.toString()}`;
		}
		
		return baseUrl;
	}

	// Delivery endpoints
	delivery(deliveryId?: string) {
		if (deliveryId) {
			return `${this.backendUrl}/deliveries/${deliveryId}`
		} else {
			return `${this.backendUrl}/deliveries`
		}
	}

	deliveryItems(deliveryId: string, itemId?: string) {
		if (itemId) {
			return `${this.backendUrl}/deliveries/${deliveryId}/items/${itemId}`
		} else {
			return `${this.backendUrl}/deliveries/${deliveryId}/items`
		}
	}

	// Supplier endpoints
	supplier(supplierId?: string) {
		if (supplierId) {
			return `${this.backendUrl}/suppliers/${supplierId}`
		} else {
			return `${this.backendUrl}/suppliers`
		}
	}

	suppliedProduct(supplierId: string, productId?: string) {
		if (productId) {
			return `${this.backendUrl}/suppliers/${supplierId}/products/${productId}`
		} else {
			return `${this.backendUrl}/suppliers/${supplierId}/products`
		}
	}

	// Recommendations endpoint
	recommendations() {
		return `${this.backendUrl}/recommendations`;
	}

	// Excel export endpoints
	excelProducts() {
		return `${this.backendUrl}/excel/products`
	}

	excelSales() {
		return `${this.backendUrl}/excel/sales`
	}

	// Category groups endpoints
	categoryGroups(categoryId: string, groupId?: string) {
		if (groupId) {
			return `${this.backendUrl}/categories/${categoryId}/groups/${groupId}`;
		} else {
			return `${this.backendUrl}/categories/${categoryId}/groups`;
		}
	}
}

export const apiEndpoints = new ApiEndpoints();