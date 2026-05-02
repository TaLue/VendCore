"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Product, createProduct, updateProduct, deleteProduct, uploadImage } from "@/services/api";

interface Props {
  products: Product[];
  onRefresh: () => void;
}

interface FormState {
  name: string;
  price: string;
  stock: string;
  imageUrl: string | null;
  imageFile: File | null;
  imagePreview: string | null;
}

const EMPTY_FORM: FormState = { name: "", price: "", stock: "", imageUrl: null, imageFile: null, imagePreview: null };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const inputCls = "w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white text-sm rounded px-2 py-1 border border-gray-300 dark:border-gray-600 focus:border-blue-400 outline-none";

const ALLOWED_TYPES = ["image/png", "image/jpeg"];

interface ImagePickerProps {
  preview: string | null;
  currentUrl: string | null;
  onChange: (file: File, preview: string) => void;
  onError: (msg: string) => void;
}

function ImagePicker({ preview, currentUrl, onChange, onError }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displaySrc = preview ?? (currentUrl ? `${API_URL}${currentUrl}` : null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="w-10 h-10 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 cursor-pointer overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors"
      title="คลิกเพื่ออัปโหลดรูป"
    >
      {displaySrc ? (
        <Image src={displaySrc} alt="preview" width={40} height={40} className="object-cover w-full h-full" unoptimized />
      ) : (
        <span className="text-gray-400 text-lg">+</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (!ALLOWED_TYPES.includes(file.type)) {
            onError("รองรับเฉพาะไฟล์ PNG และ JPEG เท่านั้น");
            e.target.value = "";
            return;
          }
          onError("");
          const reader = new FileReader();
          reader.onload = (ev) => onChange(file, ev.target?.result as string);
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}

export default function ProductTable({ products, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.image_url,
      imageFile: null,
      imagePreview: null,
    });
  };

  const resolveImageUrl = async (form: FormState): Promise<string | undefined> => {
    if (form.imageFile) {
      setUploading(true);
      try {
        return await uploadImage(form.imageFile);
      } finally {
        setUploading(false);
      }
    }
    return form.imageUrl ?? undefined;
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError("");
    if (editForm.price !== "" && Number(editForm.price) <= 0) { setError("ราคาต้องมากกว่า 0"); return; }
    if (editForm.stock !== "" && Number(editForm.stock) < 0) { setError("จำนวนต้องไม่ติดลบ"); return; }
    try {
      const image_url = await resolveImageUrl(editForm);
      await updateProduct(editingId, {
        name: editForm.name || undefined,
        image_url,
        price: editForm.price ? Number(editForm.price) : undefined,
        stock: editForm.stock !== "" ? Number(editForm.stock) : undefined,
      });
      setEditingId(null);
      onRefresh();
    } catch {
      setError("บันทึกไม่สำเร็จ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบสินค้านี้?")) return;
    try {
      await deleteProduct(id);
      onRefresh();
    } catch {
      setError("ลบไม่สำเร็จ");
    }
  };

  const handleAdd = async () => {
    setError("");
    if (!addForm.name || !addForm.price || addForm.stock === "") { setError("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (Number(addForm.price) <= 0) { setError("ราคาต้องมากกว่า 0"); return; }
    if (Number(addForm.stock) < 0) { setError("จำนวนต้องไม่ติดลบ"); return; }
    try {
      const image_url = await resolveImageUrl(addForm);
      await createProduct({
        name: addForm.name,
        image_url,
        price: Number(addForm.price),
        stock: Number(addForm.stock),
      });
      setAddForm(EMPTY_FORM);
      setIsAdding(false);
      onRefresh();
    } catch {
      setError("เพิ่มสินค้าไม่สำเร็จ");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-800 dark:text-white text-lg font-bold">สินค้า</h2>
        <button
          onClick={() => { setIsAdding(true); setError(""); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
        >
          + เพิ่มสินค้า
        </button>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-sm mb-3">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-transparent">
        <table className="w-full text-sm bg-white dark:bg-transparent">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-left bg-gray-50 dark:bg-transparent">
              <th className="pb-2 pt-2 px-3 w-12">รูป</th>
              <th className="pb-2 pt-2 pr-4">ชื่อ</th>
              <th className="pb-2 pt-2 pr-4 w-24">ราคา (฿)</th>
              <th className="pb-2 pt-2 pr-4 w-24">สต็อก</th>
              <th className="pb-2 pt-2 w-28" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

            {isAdding && (
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="py-2 px-3">
                  <ImagePicker
                    preview={addForm.imagePreview}
                    currentUrl={addForm.imageUrl}
                    onChange={(file, preview) => setAddForm({ ...addForm, imageFile: file, imagePreview: preview })}
                    onError={setError}
                  />
                </td>
                <td className="py-2 pr-4">
                  <input className={inputCls} placeholder="ชื่อสินค้า" value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                </td>
                <td className="py-2 pr-4">
                  <input type="number" min="1" className={inputCls} placeholder="ราคา" value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: String(Math.max(1, Number(e.target.value))) })} />
                </td>
                <td className="py-2 pr-4">
                  <input type="number" min="0" className={inputCls} placeholder="สต็อก" value={addForm.stock}
                    onChange={(e) => setAddForm({ ...addForm, stock: String(Math.max(0, Number(e.target.value))) })} />
                </td>
                <td className="py-2 pr-3">
                  <div className="flex gap-1">
                    <button onClick={handleAdd} disabled={uploading} className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-xs px-2 py-1 rounded border border-green-400 dark:border-green-700 transition-colors disabled:opacity-50">
                      {uploading ? "..." : "บันทึก"}
                    </button>
                    <button onClick={() => setIsAdding(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 transition-colors">ยกเลิก</button>
                  </div>
                </td>
              </tr>
            )}

            {products.map((product) =>
              editingId === product.id ? (
                <tr key={product.id} className="bg-yellow-50 dark:bg-yellow-900/10">
                  <td className="py-2 px-3">
                    <ImagePicker
                      preview={editForm.imagePreview}
                      currentUrl={editForm.imageUrl}
                      onChange={(file, preview) => setEditForm({ ...editForm, imageFile: file, imagePreview: preview })}
                      onError={setError}
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input className={`${inputCls} border-yellow-400 dark:border-yellow-600`} value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </td>
                  <td className="py-2 pr-4">
                    <input type="number" min="1" className={`${inputCls} border-yellow-400 dark:border-yellow-600`} value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: String(Math.max(1, Number(e.target.value))) })} />
                  </td>
                  <td className="py-2 pr-4">
                    <input type="number" min="0" className={`${inputCls} border-yellow-400 dark:border-yellow-600`} value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: String(Math.max(0, Number(e.target.value))) })} />
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-1">
                      <button onClick={saveEdit} disabled={uploading} className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-400 dark:border-yellow-700 transition-colors disabled:opacity-50">
                        {uploading ? "..." : "บันทึก"}
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 transition-colors">ยกเลิก</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-2 px-3">
                    <div className="w-9 h-9 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {product.image_url ? (
                        <Image
                          src={`${API_URL}${product.image_url}`}
                          alt={product.name}
                          width={36}
                          height={36}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <span className="text-gray-400 text-base">📦</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-800 dark:text-white">{product.name}</td>
                  <td className="py-2.5 pr-4 text-yellow-600 dark:text-yellow-300 font-medium">{product.price}</td>
                  <td className="py-2.5 pr-4">
                    <span className={product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(product)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">แก้ไข</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs px-2 py-1 rounded border border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-500 transition-colors">ลบ</button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
