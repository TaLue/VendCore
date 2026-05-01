"use client";
import { useEffect, useState, useCallback } from "react";
import { getProducts, Product } from "@/services/api";
import { useVendingMachine } from "@/hooks/useVendingMachine";
import ProductSlot from "./ProductSlot";
import MoneyPanel from "./MoneyPanel";
import DisplayScreen from "./DisplayScreen";
import ThemeToggle from "./ThemeToggle";

export default function VendingMachine() {
  const [products, setProducts] = useState<Product[]>([]);
  const vm = useVendingMachine();

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (vm.purchaseResult?.status === "SUCCESS") {
      loadProducts();
    }
  }, [vm.purchaseResult, loadProducts]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-3xl bg-slate-200 dark:bg-machine-body rounded-2xl shadow-2xl shadow-black/40 dark:shadow-black/60 border border-gray-300 dark:border-gray-700 overflow-hidden">

        <div className="bg-blue-600 dark:bg-machine-accent px-6 py-3 flex items-center justify-between border-b border-blue-700 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-machine-highlight shadow-lg shadow-machine-highlight/60 animate-pulse" />
            <span className="text-white font-bold tracking-widest text-sm">BLUE VENDING</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/admin" className="text-blue-200 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-xs transition-colors">
              Admin ›
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-0">
          <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-transparent">
            <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider mb-3">สินค้า</p>
            {products.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
                กำลังโหลด...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {products.map((product) => (
                  <ProductSlot
                    key={product.id}
                    product={product}
                    isSelected={vm.selectedProduct?.id === product.id}
                    onSelect={vm.selectProduct}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-72 p-5 flex flex-col gap-4 bg-white/40 dark:bg-transparent">
            <DisplayScreen
              selectedProduct={vm.selectedProduct}
              totalInserted={vm.getTotalInserted()}
              purchaseResult={vm.purchaseResult}
              isLoading={vm.isLoading}
            />
            <MoneyPanel
              insertedMoney={vm.insertedMoney}
              totalInserted={vm.getTotalInserted()}
              onInsert={vm.insertCoin}
              onCancel={vm.cancelTransaction}
              onPurchase={vm.handlePurchase}
              canPurchase={vm.canPurchase}
              isLoading={vm.isLoading}
            />
          </div>
        </div>

        <div className="bg-blue-100 dark:bg-machine-accent/50 px-6 py-2 border-t border-blue-200 dark:border-gray-700 text-center">
          <p className="text-blue-400 dark:text-gray-600 text-xs">Blue Vending Machine — Simple & Reliable</p>
        </div>
      </div>
    </div>
  );
}
