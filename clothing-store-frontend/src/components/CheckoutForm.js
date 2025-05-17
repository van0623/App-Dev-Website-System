// src/components/CheckoutForm.js
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const CheckoutForm = () => {
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    paymentMethod: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle checkout logic here (e.g., POST data to backend)
    alert('Order placed successfully!');
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <form onSubmit={handleSubmit}>
      <h3>Checkout</h3>
      <div>
        <label>Name:</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      </div>
      <div>
        <label>Shipping Address:</label>
        <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
      </div>
      <div>
        <label>Payment Method:</label>
        <input type="text" value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} required />
      </div>
      <h4>Total: ${totalAmount}</h4>
      <button type="submit">Place Order</button>
    </form>
  );
};

export default CheckoutForm;
