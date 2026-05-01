"use client";
import { useEffect, useState, useCallback } from "react";
import { getProducts, getMoney, Product, MoneyDenomination } from "@/services/api";
import ProductTable from "@/components/admin/ProductTable";
import MoneyTable from "@/components/admin/MoneyTable";
import ThemeToggle from "@/components/ThemeToggle";

type Tab = "products" | "money";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [money, setMoney] = useState<MoneyDenomination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, m] = await Promise.all([getProducts(), getMoney()]);
      setProducts(p);
      setMoney(m);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-machine-body border-b border-blue-700 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-blue-200 dark:text-gray-400 hover:text-white transition-colors text-sm">‹ กลับ</a>
          <span className="text-blue-300 dark:text-gray-600">|</span>
          <h1 className="text-white font-bold tracking-wide">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={loadData}
            className="text-blue-200 dark:text-gray-400 hover:text-white text-sm transition-colors"
          >
            รีเฟรช ↻
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-transparent">
        <div className="flex gap-0">
          {(["products", "money"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                tab === t
                  ? "border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {t === "products" ? "สินค้า" : "สต็อกเงิน"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500">กำลังโหลด...</div>
        ) : tab === "products" ? (
          <ProductTable products={products} onRefresh={loadData} />
        ) : (
          <MoneyTable money={money} onRefresh={loadData} />
        )}
      </div>
    </div>
  );
}
