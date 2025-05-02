import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import ProductProvider, { ProductContext } from "../contexts/ProductContext";

// Test component to access context values
const TestComponent = () => {
	const { products } = useContext(ProductContext);
	return (
		<div>
			<div data-testid="products-count">{products.length}</div>
			{products.length > 0 && (
				<div data-testid="first-product-title">{products[0].title}</div>
			)}
		</div>
	);
};

describe("ProductProvider", () => {
	// We're not mocking fetch anymore since we want to use the real API

	test("should fetch products from the API successfully", async () => {
		// Render the provider and test component
		render(
			<ProductProvider>
				<TestComponent />
			</ProductProvider>
		);

		// Initial state should have 0 products
		expect(screen.getByTestId("products-count").textContent).toBe("0");

		// Wait for the products to be loaded
		await waitFor(
			() => {
				expect(
					Number(screen.getByTestId("products-count").textContent)
				).toBeGreaterThan(0);
			},
			{ timeout: 5000 }
		);

		// Verify that we have at least one product with a title
		expect(screen.getByTestId("first-product-title").textContent).toBeTruthy();
	}, 10000);
});
