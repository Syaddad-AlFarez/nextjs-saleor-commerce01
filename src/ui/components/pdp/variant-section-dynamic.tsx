import { revalidatePath } from "next/cache";

import { formatMoney, formatMoneyRange } from "@/lib/utils";
import { getDiscountInfo } from "@/lib/pricing";
import { CheckoutAddLineDocument, type ProductDetailsQuery } from "@/gql/graphql";
import { executeAuthenticatedGraphQL } from "@/lib/graphql";
import * as Checkout from "@/lib/checkout";

import { AddToCart } from "./add-to-cart";
import { VariantSelectionSection } from "./variant-selection";
import { StickyBar } from "./sticky-bar";
import { Badge } from "@/ui/components/ui/badge";

type Product = NonNullable<ProductDetailsQuery["product"]>;

interface VariantSectionDynamicProps {
	product: Product;
	channel: string;
	searchParams: Promise<{ variant?: string }>;
}

export async function VariantSectionDynamic({ product, channel, searchParams }: VariantSectionDynamicProps) {
	const { variant: variantParam } = await searchParams;
	const variants = product.variants || [];

	const selectedVariantID = variantParam || (variants.length === 1 ? variants[0].id : undefined);
	const selectedVariant = variants.find(({ id }) => id === selectedVariantID);

	const isAvailable = variants.some((variant) => variant.quantityAvailable);

	const isAddToCartDisabled = !selectedVariantID || !selectedVariant?.quantityAvailable;
	const disabledReason = !selectedVariantID
		? ("no-selection" as const)
		: !selectedVariant?.quantityAvailable
			? ("out-of-stock" as const)
			: undefined;

	const price = selectedVariant?.pricing?.price?.gross
		? selectedVariant.pricing.price.gross.amount === 0
			? "FREE"
			: formatMoney(selectedVariant.pricing.price.gross.amount, selectedVariant.pricing.price.gross.currency)
		: formatMoneyRange({
				start: product.pricing?.priceRange?.start?.gross,
				stop: product.pricing?.priceRange?.stop?.gross,
			}) || "";

	const currentPrice = selectedVariant?.pricing?.price?.gross?.amount;
	const undiscountedPrice = selectedVariant?.pricing?.priceUndiscounted?.gross?.amount;
	const { isOnSale, discountPercent } = getDiscountInfo(currentPrice, undiscountedPrice);

	const compareAtPrice =
		isOnSale && selectedVariant?.pricing?.priceUndiscounted?.gross
			? formatMoney(
					selectedVariant.pricing.priceUndiscounted.gross.amount,
					selectedVariant.pricing.priceUndiscounted.gross.currency,
				)
			: null;

	async function addToCart() {
		"use server";

		if (!selectedVariantID) {
			return;
		}

		try {
			const checkout = await Checkout.findOrCreate({
				checkoutId: await Checkout.getIdFromCookies(channel),
				channel: channel,
			});

			if (!checkout) {
				console.error("Add to cart: Failed to create checkout");
				return;
			}

			await Checkout.saveIdToCookie(channel, checkout.id);

			const addResult = await executeAuthenticatedGraphQL(CheckoutAddLineDocument, {
				variables: {
					id: checkout.id,
					productVariantId: decodeURIComponent(selectedVariantID),
				},
				cache: "no-cache",
			});

			if (!addResult.ok) {
				console.error("Add to cart failed:", addResult.error.message);
				return;
			}

			revalidatePath("/cart");
		} catch (error) {
			console.error("Add to cart failed:", error);
		}
	}

	return (
		<>
			<div className="order-1 flex items-center gap-2">
				{product.category && <span className="text-sm text-muted-foreground">{product.category.name}</span>}
				{isOnSale && (
					<Badge variant="destructive" className="text-xs">
						Sale
					</Badge>
				)}
				{!isAvailable && (
					<Badge variant="secondary" className="text-xs">
						Out of stock
					</Badge>
				)}
			</div>

			<form action={addToCart} className="order-3 mt-4 space-y-6">
				<VariantSelectionSection
					variants={variants}
					selectedVariantId={selectedVariantID}
					productSlug={product.slug}
					channel={channel}
				/>

				<AddToCart
					price={price}
					compareAtPrice={compareAtPrice}
					discountPercent={discountPercent}
					disabled={isAddToCartDisabled}
					disabledReason={disabledReason}
					// --- INI DIA DATA GTM YANG DIKIRIMKAN ---
					productId={product.id}
					productName={product.name}
					priceValue={currentPrice || 0}
					currency={selectedVariant?.pricing?.price?.gross?.currency || "IDR"}
				/>

				<StickyBar productName={product.name} price={price} show={!isAddToCartDisabled} />
			</form>
		</>
	);
}

export function VariantSectionSkeleton() {
	return (
		<>
			<div className="order-1 h-4 w-20 animate-pulse animate-skeleton-delayed rounded bg-muted opacity-0" />

			<div className="order-3 mt-4 animate-pulse animate-skeleton-delayed space-y-6 opacity-0">
				<div className="space-y-4">
					<div className="h-4 w-16 rounded bg-muted" />
					<div className="flex gap-2">
						<div className="h-10 w-16 rounded bg-muted" />
						<div className="h-10 w-16 rounded bg-muted" />
						<div className="h-10 w-16 rounded bg-muted" />
					</div>
				</div>

				<div className="h-8 w-24 rounded bg-muted" />

				<div className="h-12 w-full rounded bg-muted" />
			</div>
		</>
	);
}
