"use client";
import { useState } from "react";
import { MoneyDenomination, updateMoney } from "@/services/api";

interface Props {
  money: MoneyDenomination[];
  onRefresh: () => void;
}

export default function MoneyTable({ money, onRefresh }: Props) {
  const [quantities, setQuantities] = useState<Record<number, string>>(
    Object.fromEntries(money.map((m) => [m.denomination, String(m.quantity)]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const sorted = [...money].sort((a, b) => b.denomination - a.denomination);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    const hasNegative = sorted.some((m) => Number(quantities[m.denomination] ?? 0) < 0);
    if (hasNegative) {
      setMessage("จำนวนต้องไม่ติดลบ");
      setIsSaving(false);
      return;
    }
    try {
      const updates = sorted.map((m) => ({
        denomination: m.denomination,
        quantity: Number(quantities[m.denomination] ?? m.quantity),
      }));
      await updateMoney(updates);
      setMessage("บันทึกสำเร็จ");
      onRefresh();
    } catch {
      setMessage("บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const totalValue = sorted.reduce(
    (sum, m) => sum + m.denomination * Number(quantities[m.denomination] ?? 0),
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-800 dark:text-white text-lg font-bold">สต็อกเงิน</h2>
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          มูลค่ารวม: <span className="text-yellow-600 dark:text-yellow-300 font-bold">{totalValue.toLocaleString()} ฿</span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-transparent">
        <table className="w-full text-sm bg-white dark:bg-transparent">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-left bg-gray-50 dark:bg-transparent">
              <th className="pb-2 pt-2 px-3 pr-4">ประเภท</th>
              <th className="pb-2 pt-2 pr-4 w-28">ราคา</th>
              <th className="pb-2 pt-2 w-36">จำนวน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sorted.map((m) => (
              <tr key={m.denomination} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="py-2.5 px-3 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    m.money_type === "COIN"
                      ? "bg-amber-100 dark:bg-yellow-900/50 text-amber-700 dark:text-yellow-300"
                      : "bg-emerald-100 dark:bg-green-900/50 text-emerald-700 dark:text-green-300"
                  }`}>
                    {m.money_type === "COIN" ? "เหรียญ" : "ธนบัตร"}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-gray-800 dark:text-white font-bold">{m.denomination} ฿</td>
                <td className="py-2.5">
                  <input
                    type="number"
                    min="0"
                    className="w-24 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white text-sm rounded px-2 py-1 border border-gray-300 dark:border-gray-600 focus:border-blue-400 outline-none"
                    value={quantities[m.denomination] ?? ""}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setQuantities({ ...quantities, [m.denomination]: String(val) });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
        >
          {isSaving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        {message && (
          <span className={`text-sm ${message.includes("สำเร็จ") ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
