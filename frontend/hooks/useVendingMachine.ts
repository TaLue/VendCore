"use client";
import { useCallback } from "react";
import { purchase } from "@/services/api";
import { useVendingStore } from "@/store/vendingStore";

export function useVendingMachine() {
  const store = useVendingStore();

  const handlePurchase = useCallback(async () => {
    if (!store.selectedProduct) return;

    store.setLoading(true);
    try {
      const result = await purchase(store.selectedProduct.id, store.getInsertedMoneyArray());
      store.setPurchaseResult(result);
      if (result.status === "SUCCESS") {
        store.cancelTransaction();
        store.setPurchaseResult(result);
      }
    } catch {
      store.setPurchaseResult({
        status: "FAILED",
        reason: "NETWORK_ERROR",
        message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      });
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const canPurchase =
    !!store.selectedProduct &&
    store.getTotalInserted() >= (store.selectedProduct?.price ?? Infinity) &&
    store.getInsertedMoneyArray().length > 0;

  return { ...store, handlePurchase, canPurchase };
}
