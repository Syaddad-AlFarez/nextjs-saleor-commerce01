"use client";
import { useEffect } from "react"; // Tambahkan ini
import { ProductCard, type ProductCardData } from "./product-card";

interface ProductGridProps {
	products: ProductCardData[];
}

export function ProductGrid({ products }: ProductGridProps) {
	// Tambahkan useEffect ini
	useEffect(() => {
		if (typeof window !== "undefined" && products.length > 0) {
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({ ecommerce: null });
			window.dataLayer.push({
				event: "view_item_list",
				ecommerce: {
					item_list_name: "Product Grid", // Sesuaikan nama list
					items: products.map((product, index) => ({
						item_id: product.id,
						item_name: product.name,
						price: product.price,
						currency: product.currency,
						index: index + 1, // Posisi dimulai dari 1
						item_brand: product.brand || undefined,
						item_category: product.category?.name || undefined,
					})),
				},
			});
		}
	}, [products]);

	return (
		<div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
			{products.map((product, index) => (
				<ProductCard
					key={product.id}
					product={product}
					priority={index < 3}
					position={index + 1} // Jangan lupa kirimkan position ke ProductCard
				/>
			))}
		</div>
	);
}
