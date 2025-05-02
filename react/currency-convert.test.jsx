import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Product from "../components/Product";
import CartItem from "../components/CartItem";
import { CurrencyContext, EXCHANGE_RATES } from "../contexts/CurrencyContext";
import { CartContext } from "../contexts/CartContext";
import { MemoryRouter } from "react-router";

describe("Product currency conversion", () => {
	test("should display converted price with correct symbol in product component", () => {
		const mockProduct = {
			id: 1,
			title: "Test Product",
			category: "Test Category",
			price: 100,
			image: "test.jpg",
		};

		const currency = "EUR";
		const currencySymbol = "€";
		const expectedConvertedPrice = (
			mockProduct.price * EXCHANGE_RATES[currency]
		).toFixed(2);

		render(
			<MemoryRouter>
				<CurrencyContext.Provider value={{ currency, currencySymbol }}>
					<CartContext.Provider value={{ addToCart: () => {} }}>
						<Product product={mockProduct} />
					</CartContext.Provider>
				</CurrencyContext.Provider>
			</MemoryRouter>
		);

		expect(
			screen.getByText(`${currencySymbol} ${expectedConvertedPrice}`)
		).toBeInTheDocument();
	});

	test("should display converted price with correct symbol in cart-item component", () => {
		const item = {
			id: 1,
			title: "Sample Product",
			price: 100, // base price
		};

		const currency = "EUR";
		const currencySymbol = "€";
		const expectedPrice = (item.price * EXCHANGE_RATES[currency]).toFixed(2);

		render(
			<MemoryRouter>
				<CurrencyContext.Provider value={{ currency, currencySymbol }}>
					<CartContext.Provider value={{ addToCart: () => {} }}>
						<CartItem item={item} />
					</CartContext.Provider>
				</CurrencyContext.Provider>
			</MemoryRouter>
		);

		expect(
			screen.getByText(`${currencySymbol} ${expectedPrice}`)
		).toBeInTheDocument();
	});
});
