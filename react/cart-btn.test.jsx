// Header.test.jsx
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import Header from "../components/Header";
import { SidebarContext } from "../contexts/SidebarContext";
import { CartContext } from "../contexts/CartContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import "@testing-library/jest-dom";

describe("Header Component", () => {
	// Mock the contexts
	const mockSetIsOpen = vi.fn();
	const mockSidebarContext = {
		isOpen: false,
		setIsOpen: mockSetIsOpen,
	};

	const mockCartContext = {
		itemAmount: 3,
	};

	const mockCurrencyContext = {
		currency: "USD",
		setCurrency: vi.fn(),
		currencySymbol: "$",
	};

	beforeEach(() => {
		// Reset the mock function before each test
		mockSetIsOpen.mockReset();
	});

	test("cart button should open the sidebar when clicked", () => {
		render(
			<BrowserRouter>
				<CurrencyContext.Provider value={mockCurrencyContext}>
					<SidebarContext.Provider value={mockSidebarContext}>
						<CartContext.Provider value={mockCartContext}>
							<Header />
						</CartContext.Provider>
					</SidebarContext.Provider>
				</CurrencyContext.Provider>
			</BrowserRouter>
		);

		// Find the cart button
		const cartButton = document.querySelector(".cart-btn");

		// Click the cart button
		if (cartButton) {
			fireEvent.click(cartButton);
		}

		// Check if setIsOpen was called with true
		expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
	});
});
