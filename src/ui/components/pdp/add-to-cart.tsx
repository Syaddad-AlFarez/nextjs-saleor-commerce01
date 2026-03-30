"use client";

import { useFormStatus } from "react-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToCartProps {
	price: string;
	compareAtPrice?: string | null;
	discountPercent?: number | null;
	disabled?: boolean;
	disabledReason?: "no-selection" | "out-of-stock";
	// Tambahan props untuk kebutuhan GTM / GA4
	productId?: string;
	productName?: string;
	numericPrice?: number;
	currency?: string;
	variantId?: string;
	variantName?: string;
	variantAttributes?: Record<string, string>;
	categoryName?: string;
}

interface AddToCartProps {
	price: string;
	compareAtPrice?: string | null;
	discountPercent?: number | null;
	disabled?: boolean;
	disabledReason?: "no-selection" | "out-of-stock";
	productId?: string;
	productName?: string;
	numericPrice?: number;
	currency?: string;

	// ---> TAMBAHAN PROPS GTM <---
	variantId?: string;
	variantName?: string;
	variantAttributes?: Record<string, string>;
	categoryName?: string;
}

// 2. Tangkap props tersebut di komponen AddToCartButton
function AddToCartButton({
	disabled,
	disabledReason,
	productId,
	productName,
	numericPrice,
	currency = "IDR",
	// ---> TANGKAP PROPS BARU <---
	variantId,
	variantName,
	variantAttributes,
	categoryName,
}: {
	disabled?: boolean;
	disabledReason?: "no-selection" | "out-of-stock";
	productId?: string;
	productName?: string;
	numericPrice?: number;
	currency?: string;
	variantId?: string;
	variantName?: string;
	variantAttributes?: Record<string, string>;
	categoryName?: string;
}) {
	const { pending } = useFormStatus();

	const getButtonText = () => {
		if (pending) return "Adding...";
		if (!disabled) return "Add to bag";
		if (disabledReason === "out-of-stock") return "Out of stock";
		return "Select options";
	};

	// 3. Modifikasi fungsi dataLayer
	const handleAddToCartClick = () => {
		if (disabled || pending) return;

		if (typeof window !== "undefined") {
			window.dataLayer = window.dataLayer || [];

			// Buat object dasar (Native Dimensions GA4)
			const itemToCart: any = {
				item_id: variantId || productId,
				item_name: productName,
				price: numericPrice,
				quantity: 1,
				item_category: categoryName,
				item_variant: variantName, // Umumnya berisi string lengkap misal "Black / M"
			};

			// Menggabungkan Atribut Dinamis ke dalam Object (Custom Dimensions)
			// Ini akan otomatis memasukkan atribut apapun yang ada (contoh: color: "Red", shoe_size: "42")
			if (variantAttributes) {
				Object.assign(itemToCart, variantAttributes);
			}

			window.dataLayer.push({
				event: "add_to_cart",
				ecommerce: {
					currency: currency,
					value: numericPrice,
					items: [itemToCart],
				},
			});
		}
	};

	return (
		<Button
			type="submit"
			size="lg"
			disabled={disabled || pending}
			onClick={handleAddToCartClick}
			className={cn("h-14 w-full text-base font-medium transition-all duration-200", pending && "opacity-80")}
		>
			<ShoppingBag className={cn("mr-2 h-5 w-5 transition-transform", pending && "scale-90")} />
			{getButtonText()}
		</Button>
	);
}

export function AddToCart({
	price,
	compareAtPrice,
	discountPercent,
	disabled = false,
	disabledReason,
	productId,
	productName,
	numericPrice,
	currency,
	// ---> DESTRUKTURISASI PROPS BARU <---
	variantId,
	variantName,
	variantAttributes,
	categoryName,
}: AddToCartProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-baseline gap-3">
				{/* ... isi tidak berubah ... */}
				<span className="text-2xl font-semibold tracking-tight">{price}</span>
				{compareAtPrice && (
					<>
						<span className="text-lg text-muted-foreground line-through">{compareAtPrice}</span>
						{discountPercent && (
							<span className="text-sm font-medium text-destructive">-{discountPercent}%</span>
						)}
					</>
				)}
			</div>

			{/* Add to Cart Button */}
			<AddToCartButton
				disabled={disabled}
				disabledReason={disabledReason}
				productId={productId}
				productName={productName}
				numericPrice={numericPrice}
				currency={currency}
				// ---> LEMPAR KE KOMPONEN TOMBOL <---
				variantId={variantId}
				variantName={variantName}
				variantAttributes={variantAttributes}
				categoryName={categoryName}
			/>

			{/* Trust Signals */}
			<div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
				{/* ... isi tidak berubah ... */}
			</div>
		</div>
	);
}
