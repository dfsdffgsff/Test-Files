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

	test("should increase amount when adding the same product", () => {
		act(() => {
			screen.getByTestId("add-product").click();
		});

		const initialAmount = Number(screen.getByTestId("item-amount").textContent);

		act(() => {
			screen.getByTestId("add-product").click();
		});

		// When fixed, adding the same product should increase amount by 1
		expect(screen.getByTestId("cart-length").textContent).toBe("1"); // Still one unique item
		expect(Number(screen.getByTestId("item-amount").textContent)).toBe(
			initialAmount + 1
		);
	});
});
