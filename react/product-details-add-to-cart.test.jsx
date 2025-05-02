import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import ProductDetails from "../pages/ProductDetails";
import { CartContext } from "../contexts/CartContext";
import { ProductContext } from "../contexts/ProductContext";

describe("ProductDetails - Add to Cart button", () => {
	test("should call addToCart when button is clicked", async () => {
		const mockAddToCart = vi.fn();
		const mockProducts = [
			{
				id: 1,
				title: "Test Product",
				price: 100,
				description: "Nice item",
				image: "img.jpg",
			},
		];

		render(
			<MemoryRouter initialEntries={["/product/1"]}>
				<CartContext.Provider value={{ addToCart: mockAddToCart }}>
					<ProductContext.Provider value={{ products: mockProducts }}>
						<Routes>
							<Route path="/product/:id" element={<ProductDetails />} />
						</Routes>
					</ProductContext.Provider>
				</CartContext.Provider>
			</MemoryRouter>
		);

		const button = await screen.findByRole("button", { name: /add to cart/i });
		fireEvent.click(button);

		expect(mockAddToCart).toHaveBeenCalledWith(mockProducts[0], 1);
	});
});
