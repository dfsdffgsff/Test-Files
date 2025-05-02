import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Home from "../pages/Home";
import { BrowserRouter } from "react-router";
import { ProductContext } from "../contexts/ProductContext";
import { CartContext } from "../contexts/CartContext";
import { CurrencyContext } from "../contexts/CurrencyContext";

describe("Home Page Category Filtering", () => {
	test("filters products based on selected category", () => {
		const mockProducts = [
			{
				id: 1,
				title: "Men's Jacket",
				category: "men's clothing",
				price: 50,
				image: "test.jpg",
			},
			{
				id: 2,
				title: "Gold Ring",
				category: "jewelery",
				price: 200,
				image: "test.jpg",
			},
			{
				id: 3,
				title: "Women's Dress",
				category: "women's clothing",
				price: 80,
				image: "test.jpg",
			},
		];

		render(
			<BrowserRouter>
				<CurrencyContext.Provider
					value={{ currency: "USD", currencySymbol: "$" }}
				>
					<CartContext.Provider value={{ addToCart: () => {} }}>
						<ProductContext.Provider value={{ products: mockProducts }}>
							<Home />
						</ProductContext.Provider>
					</CartContext.Provider>
				</CurrencyContext.Provider>
			</BrowserRouter>
		);

		// All products visible initially
		expect(screen.getByText(/jacket/i)).toBeInTheDocument();
		expect(screen.getByText(/ring/i)).toBeInTheDocument();
		expect(screen.getByText(/dress/i)).toBeInTheDocument();

		// Click "jewelery"
		const jewelryButton = screen.getByRole("button", {
			name: /Filter by jewelery/i,
		});
		fireEvent.click(jewelryButton);

		// Only jewelery should be visible
		expect(screen.getByText(/ring/i)).toBeInTheDocument();
		expect(screen.queryByText(/jacket/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/dress/i)).not.toBeInTheDocument();

		// Click "all"
		const allButton = screen.getByRole("button", {
			name: /Filter by all products/i,
		});
		fireEvent.click(allButton);

		// All products should be visible again
		expect(screen.getByText(/jacket/i)).toBeInTheDocument();
		expect(screen.getByText(/ring/i)).toBeInTheDocument();
		expect(screen.getByText(/dress/i)).toBeInTheDocument();

		// Click "men's clothing"
		const mensClothingButton = screen.getByRole("button", {
			name: /Filter by men's clothing/i,
		});
		fireEvent.click(mensClothingButton);

		expect(screen.getByText(/jacket/i)).toBeInTheDocument();
		expect(screen.queryByText(/ring/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/dress/i)).not.toBeInTheDocument();
	});
});
