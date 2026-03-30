"use client";

import { useEffect } from "react";

// Definisikan tipe data sesuai dengan yang ada di GraphQL Anda,
// atau gunakan tipe any sementara jika ingin memastikan fungsionalitasnya berjalan dulu.
export function ViewItemTracker({
	product,
	selectedVariant,
	channel,
}: {
	product: any;
	selectedVariant: any;
	channel: string;
}) {
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Pastikan array dataLayer sudah tersedia di window
		window.dataLayer = window.dataLayer || [];

		// Mengambil harga dari struktur data product
		const price = product.pricing?.priceRange?.start?.gross?.amount || 0;
		const currency = product.pricing?.priceRange?.start?.gross?.currency || "USD";

		// Membersihkan object ecommerce sebelumnya untuk mencegah data ganda (Best Practice GA4)
		window.dataLayer.push({ ecommerce: null });

		// Push event view_item ke Data Layer
		window.dataLayer.push({
			event: "view_item",
			ecommerce: {
				currency: currency,
				value: price,
				items: [
					{
						item_id: selectedVariant?.id || product.id,
						item_name: product.name,
						item_category: product.category?.name || "",
						affiliation: channel,
						price: price,
						quantity: 1,
					},
				],
			},
		});
	}, [product, selectedVariant, channel]);

	return null; // Komponen ini tidak menampilkan elemen UI apapun
}
