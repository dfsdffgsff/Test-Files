import { render, screen, fireEvent } from "@testing-library/react";
import Checkout from "../pages/Checkout";
import { BrowserRouter } from "react-router";
import { CartContext } from "../contexts/CartContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import { describe, it, expect, vi } from "vitest";

describe("Checkout Form", () => {
	it("should allow typing into input fields", () => {
		const mockCart = [
			{
				id: 1,
				title: "Test Product",
				price: 100,
				amount: 1,
				image: "test.jpg",
			},
		];

		render(
			<BrowserRouter>
				<CartContext.Provider
					value={{ cart: mockCart, total: 100, clearCart: vi.fn() }}
				>
					<CurrencyContext.Provider value={{ currencySymbol: "$" }}>
						<Checkout />
					</CurrencyContext.Provider>
				</CartContext.Provider>
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/Full Name/i);
		fireEvent.change(nameInput, { target: { value: "Alice Smith" } });
		expect(nameInput.value).toBe("Alice Smith");

		const emailInput = screen.getByLabelText(/Email Address/i);
		fireEvent.change(emailInput, { target: { value: "alice@example.com" } });
		expect(emailInput.value).toBe("alice@example.com");

		const streetAddressInput = screen.getByLabelText(/Street Address/i);
		fireEvent.change(streetAddressInput, { target: { value: "123 Main St" } });
		expect(streetAddressInput.value).toBe("123 Main St");

		const cityInput = screen.getByLabelText(/City/i);
		fireEvent.change(cityInput, { target: { value: "New York" } });
		expect(cityInput.value).toBe("New York");

		const postalCodeInput = screen.getByLabelText(/Postal Code/i);
		fireEvent.change(postalCodeInput, { target: { value: "10001" } });
		expect(postalCodeInput.value).toBe("10001");

		const countryInput = screen.getByLabelText(/Country/i);
		fireEvent.change(countryInput, { target: { value: "USA" } });
		expect(countryInput.value).toBe("USA");

		const cardNumberInput = screen.getByLabelText(/Card Number/i);
		fireEvent.change(cardNumberInput, {
			target: { value: "4111111111111111" },
		});
		expect(cardNumberInput.value).toBe("4111111111111111");

		const expirationDateInput = screen.getByLabelText(/Expiration Date/i);
		fireEvent.change(expirationDateInput, {
			target: { value: "12/25" },
		});
		expect(expirationDateInput.value).toBe("12/25");

		const cvvInput = screen.getByLabelText(/CVV/i);
		fireEvent.change(cvvInput, {
			target: { value: "123" },
		});
	});
});
