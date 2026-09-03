import { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Loader2, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone 
} from 'lucide-react';
import { formatPrice } from '../utils/constants';
import { orderService } from '../services/orders';
import toast from 'react-hot-toast';

// Helper to dynamically load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartDrawer({ isOpen, onClose, cart, onAdd, onRemove, onClear, restaurantSlug }) {
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cash'
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Core order placement handler
  const submitOrderToBackend = async (paymentDetails = {}) => {
    const orderData = {
      restaurant_slug: restaurantSlug,
      customer_name: customerName.trim() || 'Guest',
      table_number: tableNumber.trim(),
      notes: notes.trim(),
      payment_method: paymentMethod,
      payment_status: paymentDetails.payment_status || (paymentMethod === 'online' ? 'paid' : 'pending'),
      razorpay_order_id: paymentDetails.razorpay_order_id || '',
      razorpay_payment_id: paymentDetails.razorpay_payment_id || '',
      razorpay_signature: paymentDetails.razorpay_signature || '',
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
    toast.success(paymentMethod === 'online' ? 'Payment verified! Order placed.' : 'Order placed successfully!');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setPlacing(true);

    try {
      if (paymentMethod === 'online') {
        // 1. Create order on backend
        const razorpayOrder = await orderService.createRazorpayOrder({
          amount: total,
          restaurant_slug: restaurantSlug,
          currency: 'INR',
        });

        // 2. Load Razorpay script
        const isLoaded = await loadRazorpayScript();

        if (isLoaded && window.Razorpay && !razorpayOrder.key_id.startsWith('rzp_test_5173TestSmartMenu')) {
          // Open official Razorpay Checkout Modal
          const options = {
            key: razorpayOrder.key_id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: razorpayOrder.restaurant_name || 'Smart Menu',
            description: `Order Payment (${itemCount} items)`,
            order_id: razorpayOrder.order_id,
            prefill: {
              name: customerName || 'Valued Customer',
              contact: '9876543210',
            },
            theme: {
              color: '#f97316',
            },
            handler: async function (response) {
              try {
                await submitOrderToBackend({
                  payment_status: 'paid',
                  razorpay_order_id: response.razorpay_order_id || razorpayOrder.order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });
              } catch (err) {
                console.error('Failed to complete order after payment:', err);
                toast.error(err.response?.data?.detail || 'Failed to complete order after payment');
              } finally {
                setPlacing(false);
              }
            },
            modal: {
              ondismiss: function () {
                setPlacing(false);
                toast('Payment cancelled', { icon: '⚠️' });
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            toast.error(response.error?.description || 'Payment Failed');
            setPlacing(false);
          });
          rzp.open();
          return; // Let handler complete the flow
        } else {
          // Sandbox test simulation mode
          toast.success('Simulating Razorpay Sandbox Test Payment...');
          setTimeout(async () => {
            await submitOrderToBackend({
              payment_status: 'paid',
              razorpay_order_id: razorpayOrder.order_id,
              razorpay_payment_id: `pay_test_${Math.random().toString(36).substring(2, 11)}`,
            });
            setPlacing(false);
          }, 800);
          return;
        }
      } else {
        // Pay at Counter (Cash)
        await submitOrderToBackend({ payment_status: 'pending' });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.detail || 'Failed to place order');
    } finally {
      if (paymentMethod !== 'online') {
        setPlacing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right ml-auto border-l border-gray-200/80 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Your Table Order
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orderPlaced ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-scale-in">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                Order Received!
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Sent straight to the kitchen display
              </p>

              <div className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Token:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white font-mono">
                    #{String(placedOrder?.id || 0).padStart(4, '0')}
                  </span>
                </div>
                {placedOrder?.table_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Table:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      Table {placedOrder.table_number}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className={`font-bold inline-flex items-center gap-1 ${
                    placedOrder?.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {placedOrder?.payment_status === 'paid' ? '✓ Paid Online (Razorpay)' : '⏳ Pay at Counter'}
                  </span>
                </div>
                {placedOrder?.razorpay_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment ID:</span>
                    <span className="font-mono text-[10px] text-gray-600 dark:text-gray-400">
                      {placedOrder.razorpay_payment_id}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold text-sm">
                  <span>Total Paid:</span>
                  <span className="text-primary-600 dark:text-primary-400 font-black">
                    {formatPrice(placedOrder?.total || total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => { setOrderPlaced(false); onClose(); }}
                className="btn-primary w-full mt-6 justify-center py-3 text-sm font-bold"
              >
                Order More Items
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Your cart is empty</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                Explore our delicious dishes and tap "+ ADD" to build your feast.
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Selected Items
                </h3>
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200/80 dark:border-gray-700">
                      <button
                        onClick={() => onRemove(item)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                        title={item.quantity === 1 ? 'Remove item' : 'Decrease'}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="w-5 text-center font-bold text-xs text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onAdd(item)}
                        className="w-6 h-6 rounded-lg bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs font-black text-gray-900 dark:text-white w-14 text-right">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Dining & Table Details */}
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Table & Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Table No. (e.g. 4)"
                    className="input-field text-xs py-2.5"
                  />
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name (optional)"
                    className="input-field text-xs py-2.5"
                  />
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions (e.g. less spicy, extra napkins)..."
                  className="input-field text-xs resize-none py-2"
                  rows={2}
                />
              </div>

              {/* 💳 Payment Method Selection */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Payment Method
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure Test Gateway
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Razorpay Online */}
                  <label 
                    onClick={() => setPaymentMethod('online')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'online'
                        ? 'border-primary-500 bg-primary-500/10 shadow-sm ring-1 ring-primary-500'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <CreditCard className={`w-4 h-4 ${paymentMethod === 'online' ? 'text-primary-500' : 'text-gray-400'}`} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        UPI/Card
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Pay Online</p>
                      <p className="text-[10px] text-gray-500">Razorpay Test Mode</p>
                    </div>
                  </label>

                  {/* Cash / Pay at counter */}
                  <label 
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'cash'
                        ? 'border-primary-500 bg-primary-500/10 shadow-sm ring-1 ring-primary-500'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Banknote className={`w-4 h-4 ${paymentMethod === 'cash' ? 'text-primary-500' : 'text-gray-400'}`} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        Cash
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Pay at Counter</p>
                      <p className="text-[10px] text-gray-500">Cash / After dining</p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Checkout Footer */}
        {!orderPlaced && cart.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Payable</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {formatPrice(total)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={placing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-amber-600 text-white font-extrabold shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all text-sm"
            >
              {placing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : paymentMethod === 'online' ? (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Pay {formatPrice(total)} via Razorpay</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm Order (Pay at Counter)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
