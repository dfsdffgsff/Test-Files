import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Home from "../pages/Home";
import { BrowserRouter } from "react-router";
import { ProductContext } from "../contexts/ProductContext";
import { CartContext } from "../contexts/CartContext";
import { CurrencyContext } from "../contexts/CurrencyContext";

vi.mock("../components/SearchBar", () => ({
	default: () => <div data-testid="searchbar">SearchBar</div>,
}));

describe("Home Page Layout", () => {
	test("SearchBar should appear below the 'Explore Our Products' heading", () => {
		const mockProducts = [
			{
				id: 1,
				title: "Hat",
				category: "Accessories",
				price: 20,
				image: "hat.jpg",
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

		const heading = screen.getByRole("heading", {
			name: /explore our products/i,
		});

		const searchbar = screen.getByTestId("searchbar");

		// Check DOM order: heading should come before searchbar
		const headingIndex = heading.compareDocumentPosition(searchbar);
		const isBefore = headingIndex & Node.DOCUMENT_POSITION_FOLLOWING;

		expect(isBefore).toBeTruthy();
	});
});
