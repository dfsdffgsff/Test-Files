import { useContext } from "react";
import { CartContext } from "../../contexts/CartContext";

// Test component to access context values
export const CartTestComponent = () => {
	const context = useContext(CartContext);
	return (
		<div>
			<div data-testid="cart-length">{context.cart.length}</div>
			<div data-testid="item-amount">{context.itemAmount}</div>
			<div data-testid="total">{context.total}</div>
			<button
				data-testid="add-product"
				onClick={() =>
					context.addToCart({ id: 1, title: "Test Product", price: 10 }, 1)
				}
			>
				Add Product
			</button>
			<button
				data-testid="add-another-product"
				onClick={() =>
					context.addToCart({ id: 2, title: "Test Product 2", price: 20 }, 2)
				}
			>
				Add Another Product
			</button>
			<button
				data-testid="remove-product"
				onClick={() => context.removeFromCart(1)}
			>
				Remove Product
			</button>
			<button data-testid="clear-cart" onClick={() => context.clearCart()}>
				Clear Cart
			</button>
			<button
				data-testid="increase-amount"
				onClick={() => context.increaseAmount(1)}
			>
				Increase Amount
			</button>
			<button
				data-testid="decrease-amount"
				onClick={() => context.decreaseAmount(1)}
			>
				Decrease Amount
			</button>
		</div>
	);
};
