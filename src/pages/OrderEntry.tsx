import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type PurchaseOrder = {
  id: number;
  project_id: number | null;
  item_name: string;
  spec: string | null;
  note: string | null;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
  total_price: number | null;
  order_date: string;
  ordered_by: string | null;
  weight: number | null;
};

const units = ["kg", "本", "枚", "ヶ", "h", "個"];

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<PurchaseOrder | null>(null);

  // フォーム状態
  const [form, setForm] = useState<Omit<PurchaseOrder, "id" | "total_price">>({
    project_id: null,
    item_name: "",
    spec: "",
    note: "",
    quantity: null,
    unit: null,
    unit_price: null,
    order_date: new Date().toISOString().slice(0, 10),
    ordered_by: "",
    weight: null,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("*")
      .order("order_date", { ascending: false });

    if (error) {
      alert("取得エラー: " + error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  function openNewModal() {
    setEditOrder(null);
    setForm({
      project_id: null,
      item_name: "",
      spec: "",
      note: "",
      quantity: null,
      unit: null,
      unit_price: null,
      order_date: new Date().toISOString().slice(0, 10),
      ordered_by: "",
      weight: null,
    });
    setModalOpen(true);
  }

  function openEditModal(order: PurchaseOrder) {
    setEditOrder(order);
    setForm({
      project_id: order.project_id,
      item_name: order.item_name,
      spec: order.spec ?? "",
      note: order.note ?? "",
      quantity: order.quantity,
      unit: order.unit,
      unit_price: order.unit_price,
      order_date: order.order_date,
      ordered_by: order.ordered_by ?? "",
      weight: order.weight,
    });
    setModalOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "unit_price" || name === "weight"
          ? value === "" ? null : Number(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // バリデーション（必須チェック）
    if (!form.item_name) {
      alert("品名は必須です");
      return;
    }
    if (!form.quantity || form.quantity <= 0) {
      alert("数量は正の数を入力してください");
      return;
    }
    if (!form.unit) {
      alert("単位を選択してください");
      return;
    }
    if (!form.unit_price || form.unit_price <= 0) {
      alert("単価は正の数を入力してください");
      return;
    }

    if (editOrder) {
      // 更新
      const { error } = await supabase
        .from("purchase_orders")
        .update({
          ...form,
        })
        .eq("id", editOrder.id);

      if (error) {
        alert("更新エラー: " + error.message);
      } else {
        alert("更新しました");
        setModalOpen(false);
        fetchOrders();
      }
    } else {
      // 新規登録
      const { error } = await supabase.from("purchase_orders").insert([form]);

      if (error) {
        alert("登録エラー: " + error.message);
      } else {
        alert("登録しました");
        setModalOpen(false);
        fetchOrders();
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">発注品一覧</h2>
      <button
        onClick={openNewModal}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        新規発注品追加
      </button>
      {loading ? (
        <div>読み込み中...</div>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">品名</th>
              <th className="border p-2">規格</th>
              <th className="border p-2">特記事項</th>
              <th className="border p-2">数量</th>
              <th className="border p-2">単位</th>
              <th className="border p-2">単価</th>
              <th className="border p-2">合計金額</th>
              <th className="border p-2">発注日</th>
              <th className="border p-2">発注者</th>
              <th className="border p-2">重量</th>
              <th className="border p-2">編集</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="border p-2">{o.item_name}</td>
                <td className="border p-2">{o.spec}</td>
                <td className="border p-2">{o.note}</td>
                <td className="border p-2">{o.quantity}</td>
                <td className="border p-2">{o.unit}</td>
                <td className="border p-2">{o.unit_price}</td>
                <td className="border p-2">{o.total_price}</td>
                <td className="border p-2">{o.order_date}</td>
                <td className="border p-2">{o.ordered_by}</td>
                <td className="border p-2">{o.weight}</td>
                <td className="border p-2">
                  <button
                    className="bg-yellow-400 text-black px-2 py-1 rounded"
                    onClick={() => openEditModal(o)}
                  >
                    編集
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto"
          >
            <h3 className="text-lg font-bold mb-4">{editOrder ? "発注品編集" : "新規発注品追加"}</h3>

            <label className="block mb-2">
              品名 *
              <input
                name="item_name"
                type="text"
                value={form.item_name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>

            <label className="block mb-2">
              規格
              <input
                name="spec"
                type="text"
                value={form.spec || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block mb-2">
              特記事項
              <textarea
                name="note"
                value={form.note || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block mb-2">
              数量 *
              <input
                name="quantity"
                type="number"
                step="0.01"
                value={form.quantity ?? ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>

            <label className="block mb-2">
              単位 *
              <select
                name="unit"
                value={form.unit || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">選択してください</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mb-2">
              単価 *
              <input
                name="unit_price"
                type="number"
                value={form.unit_price ?? ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </label>

            <label className="block mb-2">
              発注日
              <input
                name="order_date"
                type="date"
                value={form.order_date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block mb-2">
              発注者
              <input
                name="ordered_by"
                type="text"
                value={form.ordered_by || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <label className="block mb-2">
              重量
              <input
                name="weight"
                type="number"
                step="0.01"
                value={form.weight ?? ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </label>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setModalOpen(false)}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editOrder ? "更新" : "登録"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
