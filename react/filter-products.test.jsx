import { describe, test, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import ProductProvider, { ProductContext } from "../contexts/ProductContext";

// Test component to access and display context values
const TestComponent = () => {
	const { products } = useContext(ProductContext);

	// Group products by category for easier testing
	const categoryCounts = products.reduce((acc, product) => {
		acc[product.category] = (acc[product.category] || 0) + 1;
		return acc;
	}, {});

	return (
		<div>
			<div data-testid="total-products">{products.length}</div>

			{/* Display count of products by category */}
			{Object.entries(categoryCounts).map(([category, count]) => (
				<div
					key={category}
					data-testid={`category-${category.replace(/[^a-zA-Z0-9]/g, "-")}`}
				>
					{count}
				</div>
			))}

			{/* Display product categories for debugging */}
			<div data-testid="all-categories">
				{Array.from(new Set(products.map((p) => p.category))).join(", ")}
			</div>
		</div>
	);
};

describe("ProductProvider Category Filtering", () => {
	test("should only include products from specified categories", async () => {
		render(
			<ProductProvider>
				<TestComponent />
			</ProductProvider>
		);

		// Wait for products to load
		await waitFor(
			() => {
				expect(
					Number(screen.getByTestId("total-products").textContent)
				).toBeGreaterThan(0);
			},
			{ timeout: 5000 }
		);

		// Get all categories that have products
		const categoriesText = screen.getByTestId("all-categories").textContent;
		const categories = categoriesText.split(", ");

		// Verify that only the allowed categories are present
		const allowedCategories = [
			"men's clothing",
			"women's clothing",
			"jewelery",
		];

		// Check each category is in the allowed list
		categories.forEach((category) => {
			expect(allowedCategories).toContain(category);
		});

		if (screen.queryByTestId("category-men-s-clothing")) {
			expect(screen.getByTestId("category-men-s-clothing")).toBeInTheDocument();
		}

		if (screen.queryByTestId("category-women-s-clothing")) {
			expect(
				screen.getByTestId("category-women-s-clothing")
			).toBeInTheDocument();
		}

		if (screen.queryByTestId("category-jewelery")) {
			expect(screen.getByTestId("category-jewelery")).toBeInTheDocument();
		}

		// Check that 'electronics' category is NOT present
		expect(
			screen.queryByTestId("category-electronics")
		).not.toBeInTheDocument();
	}, 10000);
});
