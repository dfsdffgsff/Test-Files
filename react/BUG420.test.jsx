import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Home from "../pages/Home";
import { BrowserRouter } from "react-router";
import { ProductContext } from "../contexts/ProductContext";
import { CartContext } from "../contexts/CartContext";
import { CurrencyContext } from "../contexts/CurrencyContext";

// Mock SearchBar normally (without changing its structure)
vi.mock("../components/SearchBar", async () => {
	const actual = await vi.importActual("../components/SearchBar");
	return { default: actual.default };
});

describe("Home Page Search Functionality", () => {
	test("filters products based on search input", () => {
		const mockProducts = [
			{
				id: 1,
				title: "Red Hat",
				category: "Accessories",
				price: 20,
				image: "red-hat.jpg",
			},
			{
				id: 2,
				title: "Blue Jacket",
				category: "Clothing",
				price: 50,
				image: "blue-jacket.jpg",
			},
			{
				id: 3,
				title: "Green Shoes",
				category: "Footwear",
				price: 80,
				image: "green-shoes.jpg",
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

		// All products should be visible initially
		expect(screen.getByText(/red hat/i)).toBeInTheDocument();
		expect(screen.getByText(/blue jacket/i)).toBeInTheDocument();
		expect(screen.getByText(/green shoes/i)).toBeInTheDocument();

		// Find the search input
		const searchInput = screen.getByRole("textbox", { name: /search/i });

		// Type "hat" to filter
		fireEvent.change(searchInput, { target: { value: "hat" } });

		// Only Red Hat should appear
		expect(screen.getByText(/red hat/i)).toBeInTheDocument();
		expect(screen.queryByText(/blue jacket/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/green shoes/i)).not.toBeInTheDocument();

		// Clear search
		fireEvent.change(searchInput, { target: { value: "" } });

		// All products should appear again
		expect(screen.getByText(/red hat/i)).toBeInTheDocument();
		expect(screen.getByText(/blue jacket/i)).toBeInTheDocument();
		expect(screen.getByText(/green shoes/i)).toBeInTheDocument();
	});
});
