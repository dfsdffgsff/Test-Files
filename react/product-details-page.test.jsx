import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "../App";
import "@testing-library/jest-dom";
import { SidebarContext } from "../contexts/SidebarContext";
import { CartContext } from "../contexts/CartContext";
import { ProductContext } from "../contexts/ProductContext";
import { CurrencyContext } from "../contexts/CurrencyContext";

const mockSidebarContext = {
	isOpen: true,
	handleClose: vi.fn(),
};

const mockCartContext = {
	cart: [],
	clearCart: vi.fn(),
	itemAmount: 0,
	total: 0,
};

const mockProductContext = {
	products: [
		{ id: 1, title: "Product 1", price: 10, amount: 2, image: "image1.jpg" },
		{ id: 2, title: "Product 2", price: 20, amount: 1, image: "image2.jpg" },
	],
};

const mockCurrencyContext = {
	currency: "USD",
	setCurrency: vi.fn(),
	currencySymbol: "$",
};

describe("App routing", () => {
	it("should render product details page when navigating to /product/1", () => {
		// Render the app with a specific route
		render(
			<MemoryRouter initialEntries={["/product/1"]}>
				<CurrencyContext.Provider value={mockCurrencyContext}>
					<SidebarContext.Provider value={mockSidebarContext}>
						<CartContext.Provider value={mockCartContext}>
							<ProductContext.Provider value={mockProductContext}>
								<App />
							</ProductContext.Provider>
						</CartContext.Provider>
					</SidebarContext.Provider>
				</CurrencyContext.Provider>
			</MemoryRouter>
		);

		// Check if the product details page is rendered
		expect(screen.getByTestId("product-details")).toBeInTheDocument();
	});
});
