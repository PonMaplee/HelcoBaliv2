import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div 
      className="group relative flex flex-col cursor-pointer font-sans"
      onClick={() => navigate(`/product/${product.id ?? 1}`)}
    >
      <div className="relative w-full aspect-[4/5] bg-white overflow-hidden rounded-none flex items-center justify-center">
        <img
          src={product.image}
          alt={product.title}
          className="object-contain object-center w-full h-full p-6 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* 2. Badges */}
        {product.badgeType === 'new' && (
          <span className="absolute top-3 right-3 bg-slate-600 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider z-10">
            New
          </span>
        )}
        {product.badgeType === 'bestseller' && (
          <span className="absolute top-3 right-3 bg-white text-slate-900 text-[10px] uppercase font-bold px-2 py-1 tracking-wider shadow-sm z-10">
            Best Seller
          </span>
        )}

        <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20">
          <button
            type="button"
            className="w-full bg-[#111111] text-white text-xs font-bold uppercase tracking-widest py-4 hover:bg-black transition-colors border-none cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide leading-tight">
            {product.title}
          </h3>
          <span className="text-sm text-slate-900 font-medium whitespace-nowrap">
            {product.price}
          </span>
        </div>
        
        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {product.notes}
        </p>
        
        <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {product.roast}
        </p>
      </div>
    </div>
  );
}
