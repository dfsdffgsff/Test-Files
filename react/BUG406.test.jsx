import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Home from "../pages/Home";
import { BrowserRouter } from "react-router";
import { CurrencyContext } from "../contexts/CurrencyContext";
import { ProductContext } from "../contexts/ProductContext";
import { CartContext } from "../contexts/CartContext";

describe("Home Page Layout", () => {
	test("renders category filter under search bar", () => {
		const mockProducts = [];

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
		const searchInput = screen.getByRole("textbox", { name: /search/i });

		// The filter options should be visible below
		const categoryButton = screen.getByRole("button", {
			name: /Filter by men's clothing/i,
		});

		// Check vertical visual order in DOM: heading > search > filter
		expect(heading.compareDocumentPosition(searchInput)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
		expect(searchInput.compareDocumentPosition(categoryButton)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
	});
});
