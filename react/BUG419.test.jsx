import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CartProvider from "../contexts/CartContext";
import { CartTestComponent } from "./components/cart";
import "@testing-library/jest-dom";

describe("Cart decreaseAmount functionality", () => {
	let wrapper;

	beforeEach(() => {
		wrapper = render(
			<CartProvider>
				<CartTestComponent />
			</CartProvider>
		);
	});

	test("should remove item from cart when amount decreases to zero", () => {
		// Add a product
		act(() => {
			screen.getByTestId("add-product").click();
		});

		act(() => {
			screen.getByTestId("add-product").click();
		});

		act(() => {
			screen.getByTestId("decrease-amount").click();
		});

		// Still exists in cart
		expect(screen.getByTestId("cart-length").textContent).toContain("1");

		// Decrease again → amount = 0 → should be removed
		act(() => {
			screen.getByTestId("decrease-amount").click();
		});

		// Now, item should be removed from the cart
		expect(screen.queryByTestId("cart-length").textContent).toContain("0");
	});
});
