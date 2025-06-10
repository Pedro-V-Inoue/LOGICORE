import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Project = {
  id: number;
  project_no: number;
  project_name: string;
  product_name: string;
};

type PurchaseOrder = {
  id: number;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
  total_price: number | null;
};

type DailyReport = {
  id: number;
  user_id: string | null;
  task_description: string | null;
  work_hours: number | null;
  overtime_hours: number | null;
  note: string | null;
  user_name: string; // 追加: 作業者名（profilesテーブル等から取得）
};

// propsなどでprojectIdを受け取る想定
export default function CostSheet({ projectId }: { projectId: number }) {
  const [project, setProject] = useState<Project | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [dailyReports, setDailyReports] = useState<Record<
    number, // purchase_order_id
    DailyReport[]
  >>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetchData();
  }, [projectId]);

  async function fetchData() {
    setLoading(true);

    // 1. 工事情報取得
    const { data: projectData, error: projectErr } = await supabase
      .from("projects")
      .select("id, project_no, project_name, product_name")
      .eq("id", projectId)
      .single();

    if (projectErr) {
      alert("工事情報取得エラー: " + projectErr.message);
      setLoading(false);
      return;
    }
    setProject(projectData);

    // 2. 発注品取得
    const { data: poData, error: poErr } = await supabase
      .from("purchase_orders")
      .select("id, item_name, quantity, unit, unit_price, total_price")
      .eq("project_id", projectId)
      .order("id");

    if (poErr) {
      alert("発注品取得エラー: " + poErr.message);
      setLoading(false);
      return;
    }
    setPurchaseOrders(poData || []);

    // 3. 作業者の日報取得（作業者名と結合）
    // 作業者名は profiles テーブルと join (user_id -> id)
    // また、発注品に紐づく日報を想定（project_idで絞り込み）

    const { data: drData, error: drErr } = await supabase
      .from("daily_reports")
      .select(`
        id,
        user_id,
        task_description,
        work_hours,
        overtime_hours,
        note,
        project_id,
        profiles (
          name
        )
      `)
      .eq("project_id", projectId)
      .order("id");

    if (drErr) {
      alert("日報取得エラー: " + drErr.message);
      setLoading(false);
      return;
    }

    // 日報を発注品に紐づけるロジック
    // ※ purchase_ordersに直接日報が紐づかない場合はproject単位のみ表示対応に。
    // 日報が発注品IDを持っているならproject_idではなくpurchase_order_idを基準にできるが、現状スキーマにない。

    // 今回は日報を全体で取得し、日報のtask_descriptionを発注品のitem_nameと紐づける（簡易マッチング）例示

    const dailyMap: Record<number, DailyReport[]> = {};
    (poData || []).forEach((po) => {
      dailyMap[po.id] = [];
    });

    (drData || []).forEach((dr) => {
      // task_descriptionに発注品名が含まれる場合、紐づける想定（例）
      if (!dr.task_description) return;

      const targetPo = (poData || []).find((po) =>
        dr.task_description?.includes(po.item_name)
      );

      if (targetPo) {
        dailyMap[targetPo.id] = dailyMap[targetPo.id] || [];
        dailyMap[targetPo.id].push({
          id: dr.id,
          user_id: dr.user_id,
          task_description: dr.task_description,
          work_hours: dr.work_hours,
          overtime_hours: dr.overtime_hours,
          note: dr.note,
          user_name: dr.profiles?.[0]?.name ?? "不明",
        });
      }
    });

    setDailyReports(dailyMap);
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {loading && <div>読み込み中...</div>}

      {project && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            工事No: {project.project_no} | {project.project_name} | {project.product_name}
          </h1>
        </div>
      )}

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">品名</th>
            <th className="border p-2">数量</th>
            <th className="border p-2">単位</th>
            <th className="border p-2">単価</th>
            <th className="border p-2">合計金額</th>
            <th className="border p-2">作業者</th>
            <th className="border p-2">作業内容</th>
            <th className="border p-2">時間</th>
            <th className="border p-2">特記事項</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map((po) => {
            const reports = dailyReports[po.id] || [];
            return (
              <tbody key={po.id}>
                <tr className="bg-gray-200 font-bold">
                  <td className="border p-2">{po.item_name}</td>
                  <td className="border p-2">{po.quantity}</td>
                  <td className="border p-2">{po.unit}</td>
                  <td className="border p-2">{po.unit_price}</td>
                  <td className="border p-2">{po.total_price}</td>
                  <td className="border p-2" colSpan={4}></td>
                </tr>

                {/* 作業者ごとの日報 */}
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2">{r.user_name}</td>
                    <td className="border p-2">{r.task_description}</td>
                    <td className="border p-2">{r.work_hours}</td>
                    <td className="border p-2">{r.note}</td>
                  </tr>
                ))}

                {/* 残業時間を別行で表示 */}
                {reports.map(
                  (r) =>
                    r.overtime_hours && r.overtime_hours > 0 && (
                      <tr key={"ot-" + r.id} className="italic text-red-600">
                        <td className="border p-2"></td>
                        <td className="border p-2"></td>
                        <td className="border p-2"></td>
                        <td className="border p-2"></td>
                        <td className="border p-2"></td>
                        <td className="border p-2">{r.user_name}</td>
                        <td className="border p-2">残業</td>
                        <td className="border p-2">{r.overtime_hours}</td>
                        <td className="border p-2">残業</td>
                      </tr>
                    )
                )}
              </tbody>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
