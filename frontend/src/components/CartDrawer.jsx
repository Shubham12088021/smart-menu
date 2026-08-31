import { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Send, Loader2 } from 'lucide-react';
import { formatPrice } from '../utils/constants';
import { orderService } from '../services/orders';
import toast from 'react-hot-toast';

export default function CartDrawer({ isOpen, onClose, cart, onAdd, onRemove, onClear, restaurantSlug }) {
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const orderData = {
        restaurant_slug: restaurantSlug,
        customer_name: customerName || 'Guest',
        table_number: tableNumber,
        notes,
        items: cart.map(item => ({
          menu_item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      const order = await orderService.placeOrder(orderData);
      setPlacedOrder(order);
      setOrderPlaced(true);
      onClear();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error('Failed to place order');
    }
    setPlacing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right ml-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Your Order {itemCount > 0 && `(${itemCount})`}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {orderPlaced ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Order Placed!
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Order #{String(placedOrder?.id || 0).padStart(4, '0')}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Your order has been sent to the kitchen
              </p>
              <button
                onClick={() => { setOrderPlaced(false); onClose(); }}
                className="btn-primary mt-6"
              >
                Continue Browsing
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add items from the menu to get started
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRemove(item)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                        )}
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onAdd(item)}
                        className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white w-16 text-right">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Customer Info */}
              <div className="space-y-3 mb-6">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="input-field text-sm"
                />
                <input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Table number (optional)"
                  className="input-field text-sm"
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions..."
                  className="input-field text-sm resize-none"
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!orderPlaced && cart.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(total)}
              </span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full btn-primary text-base py-3 justify-center"
            >
              {placing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
