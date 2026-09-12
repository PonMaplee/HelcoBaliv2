import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart, formatIDR } from '../context/CartContext';
import SEO from '../components/SEO';

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, subtotal, deliveryFee, estimatedTaxes, total, totalCount } = useCart();

  // WhatsApp Concierge message generator
  const getWhatsAppLink = () => {
    const itemList = cart
      .map((item) => `- ${item.name} (${item.size || 'Standard'}) x${item.quantity} = ${formatIDR(item.price * item.quantity)}`)
      .join('%0A');
    const message = `Halo Helco Bali! Saya ingin memesan via website:%0A%0A${itemList}%0A%0ASubtotal: ${formatIDR(subtotal)}%0AEstimasi Pajak (11%): ${formatIDR(estimatedTaxes)}%0ATotal: ${formatIDR(total)}%0A%0AMohon info ketersediaan batch fresh cold brew hari ini. Terima kasih!`;
    return `https://wa.me/6281234567890?text=${message}`;
  };

  return (
    <div className="w-full bg-[#050505] min-h-screen pt-28 md:pt-36 pb-24 font-sans text-stone-300 selection:bg-amber-500 selection:text-black">
      <SEO 
        title="Your Artisan Shopping Bag | Helco Bali"
        description="Review your selected artisan cold brew bottles and specialty coffee blends before checkout."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-white/5 gap-4">
          <div>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-amber-500 block mb-2">
              Artisan Selection
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-white">
              Your Bag
            </h1>
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-500">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs uppercase tracking-widest text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="py-20 px-6 bg-[#080808] border border-white/5 rounded-3xl text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-12 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-500 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif italic text-white mb-3">
              Your bag is currently empty
            </h2>
            <p className="text-stone-400 text-sm max-w-md mb-8 leading-relaxed">
              Explore our 18-hour slow-dripped artisan cold brews and single-origin beans crafted in Bali.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-amber-500 text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-amber-600 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-all"
            >
              Explore Collection <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* =========================================================
                LEFT COLUMN (Bag Items List)
                ========================================================= */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {cart.map((item) => (
                <div 
                  key={`${item.id}-${item.size || 'def'}`} 
                  className="bg-[#080808] border border-white/5 hover:border-white/10 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-6 transition-all duration-300 shadow-xl"
                >
                  {/* Thumbnail */}
                  <div className="w-full sm:w-32 sm:h-32 aspect-square bg-[#050505] border border-white/5 rounded-xl shrink-0 flex items-center justify-center p-3 overflow-hidden">
                    <img 
                      src={item.image || '/placeholder.jpg'} 
                      alt={item.name} 
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-110" 
                    />
                  </div>

                  {/* Item Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <Link 
                          to={`/product/${item.id}`}
                          className="font-serif italic text-lg md:text-xl text-white hover:text-amber-500 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="font-semibold text-amber-500 text-base md:text-lg whitespace-nowrap">
                          {formatIDR(item.price * item.quantity)}
                        </p>
                      </div>

                      <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
                        {item.category} • {item.color}
                      </p>
                      
                      {item.size && (
                        <span className="inline-block text-[11px] font-medium text-stone-400 border border-white/10 bg-white/5 px-2.5 py-0.5 rounded-full mb-3">
                          {item.size}
                        </span>
                      )}
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                      {/* Quantity Pill */}
                      <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 bg-[#050505]">
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-stone-500 hover:text-white p-1 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          {item.quantity === 1 ? <Trash2 size={14} className="hover:text-red-400" /> : <Minus size={14} />}
                        </button>
                        <span className="font-bold text-xs w-6 text-center text-white select-none">
                          {item.quantity}
                        </span>
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-stone-500 hover:text-amber-500 p-1 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-stone-500 hover:text-red-400 transition-colors flex items-center gap-1.5 p-1.5 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}

              {/* Artisan Note */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-3 text-xs text-stone-400">
                <Sparkles size={18} className="text-amber-500 shrink-0" />
                <span>All bottles are slow-dripped for 18 hours and dispatched with chilled packaging to guarantee peak taste clarity.</span>
              </div>
            </div>

            {/* =========================================================
                RIGHT COLUMN (Summary & Checkout)
                ========================================================= */}
            <div className="lg:col-span-5">
              <div className="bg-[#080808] border border-white/10 rounded-3xl p-6 md:p-8 sticky top-28 shadow-2xl">
                <h2 className="text-2xl font-serif italic text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between items-center text-stone-400">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">{formatIDR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-stone-400">
                    <span>Delivery & Handling</span>
                    <span className="text-amber-500 font-semibold uppercase tracking-wider text-xs">
                      {deliveryFee === 0 ? 'Complimentary' : formatIDR(deliveryFee)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-stone-400">
                    <span>Estimated Tax (11% PPN)</span>
                    <span className="text-white font-medium">{formatIDR(estimatedTaxes)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-5 border-t border-b border-white/10 mb-8">
                  <span className="font-serif italic text-lg text-white">Total</span>
                  <div className="text-right">
                    <span className="font-serif text-2xl font-bold text-amber-500 block">
                      {formatIDR(total)}
                    </span>
                    <span className="text-[10px] text-stone-500 uppercase tracking-widest">
                      Inclusive of all taxes
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* WhatsApp Direct Order Button */}
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-full bg-amber-500 text-black font-bold uppercase tracking-[0.15em] text-xs hover:bg-amber-600 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    Order via WhatsApp Concierge
                  </a>

                  {/* Standard Checkout */}
                  <button
                    type="button"
                    onClick={() => alert(`Thank you for your order! Our team will prepare your cold brew fresh.`)}
                    className="w-full py-4 rounded-full bg-transparent border border-white/15 text-stone-300 font-bold uppercase tracking-[0.15em] text-xs hover:border-amber-500 hover:text-amber-500 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Proceed with Checkout
                  </button>
                </div>

                {/* Trust Guarantees */}
                <div className="mt-8 pt-6 border-t border-white/5 space-y-2 text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-amber-500 shrink-0" />
                    <span>100% Specialty Arabica & Artisan Robusta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-amber-500 shrink-0" />
                    <span>Cold Chain Protected Across Bali & Major Cities</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
