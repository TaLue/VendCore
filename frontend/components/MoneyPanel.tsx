"use client";

interface Props {
  insertedMoney: Record<number, number>;
  totalInserted: number;
  onInsert: (denomination: number) => void;
  onCancel: () => void;
  onPurchase: () => void;
  canPurchase: boolean;
  isLoading: boolean;
}

const COINS = [1, 5, 10];
const BANKNOTES = [20, 50, 100, 500, 1000];

export default function MoneyPanel({
  insertedMoney,
  totalInserted,
  onInsert,
  onCancel,
  onPurchase,
  canPurchase,
  isLoading,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Amount bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full transition-all" style={{ width: totalInserted > 0 ? "100%" : "0%" }} />
        </div>
        <span className="text-yellow-600 dark:text-yellow-300 font-bold text-sm w-20 text-right">{totalInserted} บาท</span>
      </div>

      {/* Coins */}
      <div>
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-1.5 uppercase tracking-wider">เหรียญ</p>
        <div className="flex gap-2">
          {COINS.map((denom) => (
            <button
              key={denom}
              onClick={() => onInsert(denom)}
              disabled={isLoading}
              className="flex-1 relative bg-amber-50 hover:bg-amber-100 dark:bg-yellow-600/20 dark:hover:bg-yellow-600/40 border border-amber-300 hover:border-amber-400 dark:border-yellow-600/50 dark:hover:border-yellow-400 text-amber-700 dark:text-yellow-300 rounded-full py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              {denom}฿
              {insertedMoney[denom] > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {insertedMoney[denom]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Banknotes */}
      <div>
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-1.5 uppercase tracking-wider">ธนบัตร</p>
        <div className="grid grid-cols-3 gap-2">
          {BANKNOTES.map((denom) => (
            <button
              key={denom}
              onClick={() => onInsert(denom)}
              disabled={isLoading}
              className="relative bg-emerald-50 hover:bg-emerald-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 border border-emerald-300 hover:border-emerald-400 dark:border-green-700/50 dark:hover:border-green-400 text-emerald-700 dark:text-green-300 rounded-md py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              {denom}฿
              {insertedMoney[denom] > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {insertedMoney[denom]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg py-2.5 text-sm font-medium transition-all disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          onClick={onPurchase}
          disabled={!canPurchase || isLoading}
          className={`flex-2 flex-grow-[2] rounded-lg py-2.5 text-sm font-bold transition-all
            ${canPurchase && !isLoading
              ? "bg-machine-highlight hover:bg-red-500 text-white shadow-lg shadow-machine-highlight/40 active:scale-95"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
        >
          {isLoading ? "กำลังซื้อ..." : "ซื้อ"}
        </button>
      </div>
    </div>
  );
}
