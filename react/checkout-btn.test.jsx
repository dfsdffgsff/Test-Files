import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SidebarContext } from "../contexts/SidebarContext";
import { CartContext } from "../contexts/CartContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import { ProductContext } from "../contexts/ProductContext";
import App from "../App";

describe("Sidebar Component - Checkout Functionality", () => {
	it("should navigate to checkout page when checkout button is clicked with items in cart", () => {
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
				{
					id: 1,
					title: "Product 1",
					price: 10,
					amount: 2,
					image: "image1.jpg",
				},
				{
					id: 2,
					title: "Product 2",
					price: 20,
					amount: 1,
					image: "image2.jpg",
				},
			],
		};

		const mockCurrencyContext = {
			currency: "USD",
			setCurrency: vi.fn(),
			currencySymbol: "$",
		};

		// Render the Sidebar component with all required contexts
		render(
			<MemoryRouter initialEntries={["/checkout"]}>
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

		expect(screen.getByTestId("checkout")).toBeInTheDocument();
	});
});
