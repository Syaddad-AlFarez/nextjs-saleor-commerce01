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
	// Tambahan Props khusus untuk GTM Analytics
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
				// Tembakkan event GTM HANYA jika tombol aktif dan tidak sedang loading
				if (!disabled && !pending && onClick) {
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
	// Fungsi utama yang membungkus data produk ke format E-commerce standar GTM
	const fireGTMEvent = () => {
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

			{/* Tombol dengan fungsi GTM */}
			<AddToCartButton disabled={disabled} disabledReason={disabledReason} onClick={fireGTMEvent} />

			<div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
					</svg>
					Secure checkout
				</span>
				<span className="flex items-center gap-1.5">
					<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
						<path d="M9 22V12h6v10" />
					</svg>
					Free delivery over €100
				</span>
			</div>
		</div>
	);
}
