"use client";

import { LinkWithChannel } from "../atoms/link-with-channel";
import { ProductImageWrapper } from "@/ui/atoms/product-image-wrapper";

import type { ProductListItemFragment } from "@/gql/graphql";
import { formatMoneyRange } from "@/lib/utils";

export function ProductElement({
	product,
	loading,
	priority,
	position, // 1. Tambahkan position di sini
}: {
	product: ProductListItemFragment;
	loading: "eager" | "lazy";
	priority?: boolean;
	position: number; // 2. Definisikan tipe position
}) {
	// 3. Buat fungsi untuk event select_item
	const handleSelectItem = () => {
		if (typeof window !== "undefined") {
			const priceInfo = product.pricing?.priceRange?.start?.gross;

			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({ ecommerce: null });
			window.dataLayer.push({
				event: "select_item",
				ecommerce: {
					item_list_name: "Product List",
					items: [
						{
							item_id: product.id,
							item_name: product.name,
							price: priceInfo?.amount || 0,
							currency: priceInfo?.currency || "USD",
							index: position,
							item_category: product.category?.name || undefined,
						},
					],
				},
			});
		}
	};

	return (
		<li data-testid="ProductElement">
			<LinkWithChannel
				href={`/products/${product.slug}`}
				key={product.id}
				prefetch={false}
				onClick={handleSelectItem} // 4. Panggil fungsi di sini
			>
				<div>
					{product?.thumbnail?.url && (
						<ProductImageWrapper
							loading={loading}
							src={product.thumbnail.url}
							alt={product.thumbnail.alt ?? ""}
							width={512}
							height={512}
							sizes={"512px"}
							priority={priority}
						/>
					)}
					<div className="mt-2 flex justify-between">
						<div>
							<h3 className="mt-1 text-sm font-semibold text-neutral-900">{product.name}</h3>
							<p className="mt-1 text-sm text-neutral-500" data-testid="ProductElement_Category">
								{product.category?.name}
							</p>
						</div>
						<p className="mt-1 text-sm font-medium text-neutral-900" data-testid="ProductElement_PriceRange">
							{formatMoneyRange({
								start: product?.pricing?.priceRange?.start?.gross,
								stop: product?.pricing?.priceRange?.stop?.gross,
							})}
						</p>
					</div>
				</div>
			</LinkWithChannel>
		</li>
	);
}
