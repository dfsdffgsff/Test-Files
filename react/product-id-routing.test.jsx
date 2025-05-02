import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import ProductDetails from "../pages/ProductDetails";
import { CartContext } from "../contexts/CartContext";
import { ProductContext } from "../contexts/ProductContext";

describe("ProductDetails - Product selection by URL ID", () => {
	test("should display product that matches the URL ID", () => {
		const mockProducts = [
			{
				id: 1,
				title: "First Product",
				price: 100,
				description: "First",
				image: "first.jpg",
			},
			{
				id: 2,
				title: "Second Product",
				price: 200,
				description: "Second",
				image: "second.jpg",
			},
		];

		render(
			<MemoryRouter initialEntries={["/product/2"]}>
				<CartContext.Provider value={{ addToCart: () => {} }}>
					<ProductContext.Provider value={{ products: mockProducts }}>
						<Routes>
							<Route path="/product/:id" element={<ProductDetails />} />
						</Routes>
					</ProductContext.Provider>
				</CartContext.Provider>
			</MemoryRouter>
		);

		// Should display the second product (id: 2), not the first one
		expect(screen.getByText(/Second Product/i)).toBeInTheDocument();
		expect(screen.queryByText(/First Product/i)).not.toBeInTheDocument();
	});
});
