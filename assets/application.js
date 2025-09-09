// Put your application javascript here

// Cart functionality
class Cart {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateCartCount();
  }

  bindEvents() {
    // Handle add to cart form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('form[action*="/cart/add"]')) {
        e.preventDefault();
        this.addToCart(e.target);
      }
    });

    // Handle cart quantity updates
    document.addEventListener('change', (e) => {
      if (e.target.matches('input[name="updates[]"]')) {
        this.updateCartItem(e.target);
      }
    });

    // Handle remove item links
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href*="/cart/change"]')) {
        e.preventDefault();
        this.removeFromCart(e.target.href);
      }
    });
  }

  async addToCart(form) {
    const submitButton = form.querySelector('button[name="add"]');
    const originalText = submitButton.textContent;
    
    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Adding...';

      const formData = new FormData(form);
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const result = await response.json();
      
      // Update cart count
      await this.updateCartCount();
      
      // Show success message
      this.showNotification('Item added to cart!', 'success');
      
      // Update cart drawer if it exists
      this.updateCartDrawer();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Failed to add item to cart', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }

  async updateCartItem(input) {
    const quantity = input.value;
    const index = input.id.replace('updates_', '');
    
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: index,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      const result = await response.json();
      
      // Update cart count and totals
      await this.updateCartCount();
      this.updateCartTotals(result);
      
    } catch (error) {
      console.error('Error updating cart:', error);
      this.showNotification('Failed to update cart', 'error');
    }
  }

  async removeFromCart(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Reload the page to update cart display
      window.location.reload();
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      this.showNotification('Failed to remove item', 'error');
    }
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Update cart count in header
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
        if (cart.item_count > 0) {
          element.textContent = cart.item_count;
          element.style.display = 'flex';
        } else {
          element.style.display = 'none';
        }
      });
      
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  updateCartTotals(cart) {
    // Update subtotal if on cart page
    const subtotalElement = document.querySelector('.cart-subtotal');
    if (subtotalElement) {
      subtotalElement.textContent = this.formatMoney(cart.total_price);
    }
  }

  updateCartDrawer() {
    // If you have a cart drawer, update it here
    // This would depend on your specific cart drawer implementation
  }

  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }
}

// Initialize cart functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Cart();
});
