"use client";

import { useEffect } from "react";
import { ProductElement } from "./product-element";
import { type ProductListItemFragment } from "@/gql/graphql";

export const ProductList = ({ products }: { products: readonly ProductListItemFragment[] }) => {
	useEffect(() => {
		if (typeof window !== "undefined" && products.length > 0) {
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({ ecommerce: null });
			window.dataLayer.push({
				event: "view_item_list",
				ecommerce: {
					item_list_name: "Product List",
					items: products.map((product, index) => {
						// Ambil harga dari struktur data GraphQL Saleor
						const priceInfo = product.pricing?.priceRange?.start?.gross;

						// Ekstrak atribut brand
						const brandAttribute = product.attributes?.find((attr) => attr.attribute.slug === "brand");
						const actualBrand = brandAttribute?.values?.[0]?.name;

						return {
							item_id: product.id,
							item_name: product.name,
							price: priceInfo?.amount || 0,
							currency: priceInfo?.currency || "USD",
							index: index + 1, // Posisi dimulai dari 1
							item_category: product.category?.name || undefined,
							item_brand: actualBrand || "Saleor Loom", // Gunakan actualBrand yang ditarik dari backend
						};
					}),
				},
			});
		}
	}, [products]);

	return (
		<ul
			role="list"
			data-testid="ProductList"
			className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
		>
			{products.map((product, index) => (
				<ProductElement
					key={product.id}
					product={product}
					priority={index < 2}
					loading={index < 3 ? "eager" : "lazy"}
					position={index + 1} // Kirim urutan produk ke komponen anak (ProductElement)
				/>
			))}
		</ul>
	);
};
