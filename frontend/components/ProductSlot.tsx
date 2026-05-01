"use client";
import { Product } from "@/services/api";

interface Props {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
}

export default function ProductSlot({ product, isSelected, onSelect }: Props) {
  const outOfStock = product.stock <= 0;
  const icon = product.icon || "🛒";

  return (
    <button
      onClick={() => !outOfStock && onSelect(product)}
      disabled={outOfStock}
      className={`
        relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-150
        ${outOfStock
          ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/30 cursor-not-allowed opacity-50"
          : isSelected
            ? "border-machine-highlight bg-machine-highlight/10 dark:bg-machine-highlight/20 shadow-lg shadow-machine-highlight/30 scale-105"
            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-machine-panel hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
        }
      `}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-gray-800 dark:text-white text-xs font-medium text-center leading-tight">{product.name}</span>
      <span className="text-yellow-600 dark:text-yellow-300 text-sm font-bold mt-1">{product.price}฿</span>
      {outOfStock ? (
        <span className="absolute top-1 right-1 bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-300 text-[9px] px-1 rounded">หมด</span>
      ) : (
        <span className="absolute top-1 right-1 text-gray-400 dark:text-gray-500 text-[9px]">×{product.stock}</span>
      )}
    </button>
  );
}
