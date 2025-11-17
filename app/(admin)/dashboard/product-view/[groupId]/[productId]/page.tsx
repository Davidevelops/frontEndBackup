import ProductDetails from "@/components/productDetails";
import { apiEndpoints } from "@/lib/apiEndpoints";
import { SingleProduct } from "@/lib/types";
import axios from "axios";

interface pageProps {
	params: {
		groupId: string;
		productId: string;
	};
}

export default async function page({ params }: pageProps) {
	const { groupId, productId } = params;

	const getProductDetails = async (): Promise<SingleProduct | null> => {
		try {
			let response = await axios.get(apiEndpoints.product(groupId, productId));
			return response.data;
		} catch (error) {
			return null;
		}
	};

	const data = await getProductDetails();

	return (
		<div>
			{data ? <ProductDetails product={data} /> : <div>Product not found</div>}
		</div>
	);
}
