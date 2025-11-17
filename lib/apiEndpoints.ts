export class ApiEndpoints {
	private backendUrl: string

	constructor() {
		const url = process.env.NEXT_PUBLIC_BACKEND_URL
		if (!url) {
			throw new Error("NEXT_PUBLIC_BACKEND_URL not declared in .env")
		}
		this.backendUrl = url
	}

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

	login() {
		return `${this.backendUrl}/auth/login`
	}

	session() {
	return `${this.backendUrl}/auth/session`;
}
	productGroup(groupId?: string) {
		if (groupId) {
			return `${this.backendUrl}/groups/${groupId}`
		} else {
			return `${this.backendUrl}/groups`
		}
	}

	product(groupId: string, productId?: string) {
		if (productId) {
			return `${this.backendUrl}/groups/${groupId}/products/${productId}`
		} else {
			return `${this.backendUrl}/groups/${groupId}/products`
		}
	}

	productSales(groupId: string, productId: string, saleId?: string) {
		if (saleId) {
			return `${this.backendUrl}/groups/${groupId}/products/${productId}/sales/${saleId}`
		} else {
			return `${this.backendUrl}/groups/${groupId}/products/${productId}/sales`
		}
	}

	sales(saleId?: string) {
		if (saleId) {
			return `${this.backendUrl}/sales/${saleId}`
		} else {
			return `${this.backendUrl}/sales`
		}
	}

	categories(categoryId?: string) {
		if (categoryId) {
			return `${this.backendUrl}/categories/${categoryId}`
		} else {
			return `${this.backendUrl}/categories`
		}
	}

	forecast(groupId: string, productId: string, forecastId?: string) {
		if (forecastId) {
			return `${this.backendUrl}/groups/${groupId}/products/${productId}/forecasts/${forecastId}`
		} else {
			return `${this.backendUrl}/groups/${groupId}/products/${productId}/forecasts`
		}
	}

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
}

export const apiEndpoints = new ApiEndpoints()
