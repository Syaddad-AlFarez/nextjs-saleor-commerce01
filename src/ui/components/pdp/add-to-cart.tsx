"use client";

import { useFormStatus } from "react-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { cn } from "@/lib/utils";
import { sendGTMEvent } from "@next/third-parties/google";

interface AddToCartProps {
	price: string;
	compareAtPrice?: string | null;
	discountPercent?: number | null;
	disabled?: boolean;
	disabledReason?: "no-selection" | "out-of-stock";
	productId?: string;
	productName?: string;
	priceValue?: number;
	currency?: string;
}

function AddToCartButton({
	disabled,
	disabledReason,
	onClick,
}: {
	disabled?: boolean;
	disabledReason?: "no-selection" | "out-of-stock";
	onClick?: () => void;
}) {
	const { pending } = useFormStatus();

	const getButtonText = () => {
		if (pending) return "Adding...";
		if (!disabled) return "Add to bag";
		if (disabledReason === "out-of-stock") return "Out of stock";
		return "Select options";
	};

	return (
		<Button
			type="submit"
			size="lg"
			disabled={disabled || pending}
			onClick={() => {
				// Hapus pengecekan pending di sini agar form tidak memblokir GTM
				console.log("🖱️ [DEBUG] Tombol ditekan!");
				if (!disabled && onClick) {
					onClick();
				}
			}}
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
	productId = "unknown_id",
	productName = "unknown_product",
	priceValue = 0,
	currency = "USD",
}: AddToCartProps) {
	const fireGTMEvent = () => {
		console.log(`🔥 [DEBUG] Mengirim data ke GTM untuk produk: ${productName} - Harga: ${priceValue}`);

		// Menggunakan metode bawaan Next.js
		sendGTMEvent({
			event: "add_to_cart",
			ecommerce: {
				currency: currency,
				value: priceValue,
				items: [
					{
						item_id: productId,
						item_name: productName,
						price: priceValue,
						quantity: 1,
					},
				],
			},
		});

		// Tembakan cadangan (Fallback) jika sendGTMEvent terlambat
		if (typeof window !== "undefined") {
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({
				event: "add_to_cart_fallback",
				ecommerce: {
					currency: currency,
					value: priceValue,
					items: [{ item_id: productId, item_name: productName, price: priceValue, quantity: 1 }],
				},
			});
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-baseline gap-3">
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

			<AddToCartButton disabled={disabled} disabledReason={disabledReason} onClick={fireGTMEvent} />

			<div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
					</svg>
					Secure checkout
				</span>
			</div>
		</div>
	);
}
