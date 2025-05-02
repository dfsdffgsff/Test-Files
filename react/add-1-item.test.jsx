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

	test("should add new product to cart with correct initial amount", () => {
		act(() => {
			screen.getByTestId("add-product").click();
		});

		// When fixed, new items should be added with amount: 1
		expect(screen.getByTestId("cart-length").textContent).toBe("1");
		expect(screen.getByTestId("item-amount").textContent).toBe("1");
	});
});
