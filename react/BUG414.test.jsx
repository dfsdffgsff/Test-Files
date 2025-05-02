import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";
import "@testing-library/jest-dom";

describe("Footer Component", () => {
	test("renders the current year in the copyright text", () => {
		// Get the current year
		const currentYear = new Date().getFullYear().toString();

		// Render the footer
		render(<Footer />);

		// Check if copyright text contains the current year
		const copyrightText = screen.getByText(/copyright/i);
		expect(copyrightText).toBeInTheDocument();
		expect(copyrightText.textContent).toContain(currentYear);
	});
});
