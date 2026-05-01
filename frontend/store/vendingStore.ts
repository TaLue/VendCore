import { create } from "zustand";
import { ChangeItem, Product, PurchaseResponse } from "@/services/api";

interface InsertedMoney {
  [denomination: number]: number;
}

interface VendingState {
  selectedProduct: Product | null;
  insertedMoney: InsertedMoney;
  purchaseResult: PurchaseResponse | null;
  isLoading: boolean;

  selectProduct: (product: Product | null) => void;
  insertCoin: (denomination: number) => void;
  cancelTransaction: () => void;
  setPurchaseResult: (result: PurchaseResponse | null) => void;
  setLoading: (loading: boolean) => void;

  getTotalInserted: () => number;
  getInsertedMoneyArray: () => ChangeItem[];
}

export const useVendingStore = create<VendingState>((set, get) => ({
  selectedProduct: null,
  insertedMoney: {},
  purchaseResult: null,
  isLoading: false,

  selectProduct: (product) =>
    set({ selectedProduct: product, purchaseResult: null }),

  insertCoin: (denomination) =>
    set((state) => ({
      insertedMoney: {
        ...state.insertedMoney,
        [denomination]: (state.insertedMoney[denomination] || 0) + 1,
      },
      purchaseResult: null,
    })),

  cancelTransaction: () =>
    set({ selectedProduct: null, insertedMoney: {}, purchaseResult: null }),

  setPurchaseResult: (result) => set({ purchaseResult: result }),
  setLoading: (loading) => set({ isLoading: loading }),

  getTotalInserted: () => {
    const { insertedMoney } = get();
    return Object.entries(insertedMoney).reduce(
      (sum, [denom, qty]) => sum + Number(denom) * qty,
      0
    );
  },

  getInsertedMoneyArray: () => {
    const { insertedMoney } = get();
    return Object.entries(insertedMoney)
      .filter(([, qty]) => qty > 0)
      .map(([denom, qty]) => ({ value: Number(denom), quantity: qty }));
  },
}));
