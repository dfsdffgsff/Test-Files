import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../components/Header";
import {
	CurrencyContext,
	EXCHANGE_RATES,
	CURRENCY_SYMBOLS,
} from "../contexts/CurrencyContext";
import { SidebarContext } from "../contexts/SidebarContext";
import { CartContext } from "../contexts/CartContext";
import { MemoryRouter } from "react-router";

describe("Currency select menu", () => {
	test("should include LKR option with correct label and value", () => {
		render(
			<MemoryRouter>
				<SidebarContext.Provider
					value={{
						isOpen: true,
						handleClose: vi.fn(),
					}}
				>
					<CurrencyContext.Provider
						value={{
							currency: "USD",
							setCurrency: () => {},
							currencySymbol: "$",
						}}
					>
						<CartContext.Provider value={{ itemAmount: 0 }}>
							<Header />
						</CartContext.Provider>
					</CurrencyContext.Provider>
				</SidebarContext.Provider>
			</MemoryRouter>
		);

		// Find the LKR option in the dropdown
		const lkrOption = screen.getByRole("option", { name: /LKR/i });

		expect(lkrOption).toBeInTheDocument();
		expect(lkrOption).toHaveValue("LKR");
	});

	test("should have correct exchange rate for LKR", () => {
		expect(EXCHANGE_RATES).toHaveProperty("LKR");
		expect(EXCHANGE_RATES.LKR).toBeCloseTo(297.954, 2);
	});

	test("should have correct currency symbol for LKR", () => {
		expect(CURRENCY_SYMBOLS).toHaveProperty("LKR");
		expect(CURRENCY_SYMBOLS.LKR).toBe("Rs");
	});
});
