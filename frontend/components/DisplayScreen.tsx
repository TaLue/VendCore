"use client";
import { Product, PurchaseResponse } from "@/services/api";

interface Props {
  selectedProduct: Product | null;
  totalInserted: number;
  purchaseResult: PurchaseResponse | null;
  isLoading: boolean;
}

export default function DisplayScreen({ selectedProduct, totalInserted, purchaseResult, isLoading }: Props) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-green-400 text-sm">กำลังประมวลผล...</p>
        </div>
      );
    }

    if (purchaseResult) {
      if (purchaseResult.status === "SUCCESS") {
        return (
          <div className="text-center">
            <p className="text-green-400 text-lg font-bold mb-1">✓ {purchaseResult.message}</p>
            {purchaseResult.change_amount > 0 ? (
              <>
                <p className="text-yellow-300 text-sm mb-1">เงินทอน {purchaseResult.change_amount} บาท</p>
                <div className="flex flex-wrap gap-1 justify-center mt-1">
                  {purchaseResult.change.map((c) => (
                    <span key={c.value} className="bg-yellow-900/50 text-yellow-300 text-xs px-2 py-0.5 rounded">
                      {c.value}฿ ×{c.quantity}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm">ไม่มีเงินทอน</p>
            )}
          </div>
        );
      } else {
        const messages: Record<string, string> = {
          INSUFFICIENT_PAYMENT: "💰 เงินไม่เพียงพอ",
          OUT_OF_STOCK: "❌ สินค้าหมด",
          CANNOT_MAKE_CHANGE: "💸 ไม่มีเหรียญทอน",
        };
        return (
          <div className="text-center">
            <p className="text-red-400 text-base font-bold">{messages[purchaseResult.reason] ?? "เกิดข้อผิดพลาด"}</p>
            <p className="text-gray-400 text-sm mt-1">{purchaseResult.message}</p>
          </div>
        );
      }
    }

    if (selectedProduct) {
      return (
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">สินค้าที่เลือก</p>
          <p className="text-white text-base font-bold">{selectedProduct.name}</p>
          <p className="text-yellow-300 text-sm">{selectedProduct.price} บาท</p>
          {totalInserted > 0 && (
            <p className="text-green-400 text-xs mt-2">
              ใส่เงินแล้ว {totalInserted} บาท
              {totalInserted < selectedProduct.price && (
                <span className="text-gray-400"> (ขาดอีก {selectedProduct.price - totalInserted} บาท)</span>
              )}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-green-400 text-sm font-mono animate-pulse">BLUE VENDING</p>
        <p className="text-gray-500 text-xs mt-2">เลือกสินค้าเพื่อเริ่มต้น</p>
      </div>
    );
  };

  return (
    <div className="bg-machine-screen border-2 border-gray-400 dark:border-gray-700 rounded-lg p-4 min-h-[120px] flex items-center justify-center shadow-inner shadow-black/50">
      {renderContent()}
    </div>
  );
}
