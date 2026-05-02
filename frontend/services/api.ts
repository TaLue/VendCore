import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});

export interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  stock: number;
}

export interface MoneyDenomination {
  id: string;
  denomination: number;
  money_type: "COIN" | "BANKNOTE";
  quantity: number;
}

export interface ChangeItem {
  value: number;
  quantity: number;
}

export type PurchaseResponse =
  | { status: "SUCCESS"; change: ChangeItem[]; change_amount: number; message: string }
  | { status: "FAILED"; reason: string; message: string };

export type CreateProductInput = { name: string; image_url?: string; price: number; stock: number };
export type UpdateProductInput = { name?: string; image_url?: string; price?: number; stock?: number };

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/products");
  return data;
};

export const createProduct = async (body: CreateProductInput): Promise<Product> => {
  const { data } = await api.post("/products", body);
  return data;
};

export const updateProduct = async (id: string, body: UpdateProductInput): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, body);
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
};

export const getMoney = async (): Promise<MoneyDenomination[]> => {
  const { data } = await api.get("/money");
  return data;
};

export const updateMoney = async (
  denominations: { denomination: number; quantity: number }[]
): Promise<MoneyDenomination[]> => {
  const { data } = await api.put("/money", { denominations });
  return data;
};

export const purchase = async (
  productId: string,
  insertedMoney: ChangeItem[]
): Promise<PurchaseResponse> => {
  const { data } = await api.post("/purchase", {
    product_id: productId,
    inserted_money: insertedMoney,
  });
  return data;
};
