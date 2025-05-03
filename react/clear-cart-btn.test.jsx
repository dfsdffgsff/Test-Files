import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import Sidebar from "../components/Sidebar";
import { SidebarContext } from "../contexts/SidebarContext";
import { CartContext } from "../contexts/CartContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import "@testing-library/jest-dom";

describe("Sidebar Component", () => {
	// Mock the contexts
	const mockSidebarContext = {
		isOpen: true,
		handleClose: vi.fn(),
	};

	const mockCartContext = {
		cart: [
			{ id: 1, title: "Product 1", price: 10, amount: 2, image: "image1.jpg" },
			{ id: 2, title: "Product 2", price: 20, amount: 1, image: "image2.jpg" },
		],
		clearCart: vi.fn(),
		itemAmount: 3,
		total: 40,
	};

	// Mock CartItem component
	vi.mock("./CartItem", () => ({
		default: ({ item }) => (
			<div data-testid={`cart-item-${item.id}`}>
				{item.title} - ${item.price} x {item.amount}
			</div>
		),
	}));

	beforeEach(() => {
		// Reset the mock functions
		mockCartContext.clearCart.mockReset();
	});

	test("clear cart button should call clearCart function when clicked", () => {
		render(
			<BrowserRouter>
				<CurrencyContext.Provider value={{ currencySymbol: "$" }}>
					<SidebarContext.Provider value={mockSidebarContext}>
						<CartContext.Provider value={mockCartContext}>
							<Sidebar />
						</CartContext.Provider>
					</SidebarContext.Provider>
				</CurrencyContext.Provider>
			</BrowserRouter>
		);

		// Find the trash icon button
		const clearCartButton = document.querySelector(".clear-cart-btn");

		// Click the button
		if (clearCartButton) {
			fireEvent.click(clearCartButton);
		}

		// Check if clearCart was called
		expect(mockCartContext.clearCart).toHaveBeenCalledTimes(1);
	});
});
