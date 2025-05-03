import { describe, test, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Header from "../components/Header";
import { SidebarContext } from "../contexts/SidebarContext";
import { CurrencyContext } from "../contexts/CurrencyContext";
import { CartContext } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import "@testing-library/jest-dom";

describe("Currency select", () => {
	test("should call setCurrency when a new currency is selected", async () => {
		const mockSetCurrency = vi.fn();

		await act(async () => {
			render(
				<BrowserRouter>
					<AuthProvider>
						<SidebarContext.Provider
							value={{
								isOpen: true,
								handleClose: vi.fn(),
							}}
						>
							<CurrencyContext.Provider
								value={{ currency: "USD", setCurrency: mockSetCurrency }}
							>
								<CartContext.Provider value={{ itemAmount: 0 }}>
									<Header />
								</CartContext.Provider>
							</CurrencyContext.Provider>
						</SidebarContext.Provider>
					</AuthProvider>
				</BrowserRouter>
			);
		});

		const select = screen.getByLabelText("Select currency");

		fireEvent.change(select, { target: { value: "EUR" } });

		expect(mockSetCurrency).toHaveBeenCalledWith("EUR");
	});
});
