import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CartProvider from "../contexts/CartContext";
import { CartTestComponent } from "./components/cart";
import "@testing-library/jest-dom";

describe("Shopping Cart", () => {
	let wrapper;

	beforeEach(() => {
		wrapper = render(
			<CartProvider>
				<CartTestComponent />
			</CartProvider>
		);
	});

	test("should correctly calculate total price based on price and amount", () => {
		act(() => {
			screen.getByTestId("add-product").click();
		});

		act(() => {
			screen.getByTestId("add-product").click();
		});

		// When fixed, total should be price × amount (10 × 2 = 20)
		expect(screen.getByTestId("total").textContent).toBe("20");

		// Add another product to verify total calculation
		act(() => {
			screen.getByTestId("add-another-product").click();
		});

		// Total should now be 20 + 20 = 40
		expect(screen.getByTestId("total").textContent).toBe("40");
	});
});
