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
  projects?: {
    id: number;
    project_no: number;
    project_name: string;
  };
};

const units = ["kg", "本", "枚", "ヶ", "h", "個"];

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<PurchaseOrder | null>(null);

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
      .select(`
        *,
        projects (
          id,
          project_no,
          project_name
        )
      `)
      .order("order_date", { ascending: false });

    if (error) alert("取得エラー: " + error.message);
    else setOrders(data || []);

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
      [name]: ["quantity", "unit_price", "weight"].includes(name) ? (value === "" ? null : Number(value)) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.project_id || !form.item_name || !form.quantity || !form.unit || !form.unit_price) {
      alert("必須項目をすべて入力してください");
      return;
    }

    const { error } = editOrder
      ? await supabase.from("purchase_orders").update({ ...form }).eq("id", editOrder.id)
      : await supabase.from("purchase_orders").insert([form]);

    if (error) alert("エラー: " + error.message);
    else {
      alert(editOrder ? "更新しました" : "登録しました");
      setModalOpen(false);
      fetchOrders();
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="title is-4">発注品一覧</h2>
      <button className="button is-primary mb-4" onClick={openNewModal}>新規発注品追加</button>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <table className="table is-bordered is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>現場</th>
              <th>品名</th>
              <th>規格</th>
              <th>特記事項</th>
              <th>数量</th>
              <th>単位</th>
              <th>単価</th>
              <th>合計金額</th>
              <th>発注日</th>
              <th>発注者</th>
              <th>重量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  {o.projects
                    ? `No.${o.projects.project_no}：${o.projects.project_name}`
                    : "不明"}
                </td>
                <td>{o.item_name}</td>
                <td>{o.spec}</td>
                <td>{o.note}</td>
                <td>{o.quantity}</td>
                <td>{o.unit}</td>
                <td>{o.unit_price}</td>
                <td>{o.total_price}</td>
                <td>{o.order_date}</td>
                <td>{o.ordered_by}</td>
                <td>{o.weight}</td>
                <td>
                  <button className="button is-small is-warning" onClick={() => openEditModal(o)}>編集</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setModalOpen(false)}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">{editOrder ? "発注品編集" : "新規発注品追加"}</p>
              <button className="delete" aria-label="close" onClick={() => setModalOpen(false)}></button>
            </header>
            <section className="modal-card-body">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">現場（プロジェクト） *</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        name="project_id"
                        value={form.project_id ?? ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, project_id: Number(e.target.value) }))}
                        required
                      >
                        <option value="">選択してください</option>
                        {orders
                          .filter((o) => o.projects)
                          .map((o) => (
                            <option key={o.projects!.id} value={o.projects!.id}>
                              {o.projects!.project_no} - {o.projects!.project_name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ここから下は既存のフォーム内容 */}
                <div className="field">
                  <label className="label">品名 *</label>
                  <div className="control">
                    <input name="item_name" className="input" type="text" value={form.item_name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="field">
                  <label className="label">規格</label>
                  <div className="control">
                    <input name="spec" className="input" type="text" value={form.spec || ""} onChange={handleChange} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">特記事項</label>
                  <div className="control">
                    <textarea name="note" className="textarea" value={form.note || ""} onChange={handleChange} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">数量 *</label>
                  <div className="control">
                    <input name="quantity" className="input" type="number" step="0.01" value={form.quantity ?? ""} onChange={handleChange} required />
                  </div>
                </div>
                <div className="field">
                  <label className="label">単位 *</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select name="unit" value={form.unit || ""} onChange={handleChange} required>
                        <option value="">選択してください</option>
                        {units.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label">単価 *</label>
                  <div className="control">
                    <input name="unit_price" className="input" type="number" value={form.unit_price ?? ""} onChange={handleChange} required />
                  </div>
                </div>
                <div className="field">
                  <label className="label">発注日</label>
                  <div className="control">
                    <input name="order_date" className="input" type="date" value={form.order_date} onChange={handleChange} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">発注者</label>
                  <div className="control">
                    <input name="ordered_by" className="input" type="text" value={form.ordered_by || ""} onChange={handleChange} />
                  </div>
                </div>
                <div className="field">
                  <label className="label">重量</label>
                  <div className="control">
                    <input name="weight" className="input" type="number" step="0.01" value={form.weight ?? ""} onChange={handleChange} />
                  </div>
                </div>
                <div className="field is-grouped is-justify-content-flex-end mt-4">
                  <div className="control">
                    <button type="button" className="button is-light" onClick={() => setModalOpen(false)}>キャンセル</button>
                  </div>
                  <div className="control">
                    <button type="submit" className="button is-primary">{editOrder ? "更新" : "登録"}</button>
                  </div>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
