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

export default function CostSheet() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [dailyReports, setDailyReports] = useState<Record<number, DailyReport[]>>({});
  const [loading, setLoading] = useState(false);

  // 初期：プロジェクト一覧を取得
  useEffect(() => {
    fetchProjects();
  }, []);

  // プロジェクト選択時にデータ取得
  useEffect(() => {
    if (selectedProjectId){
      fetchData(selectedProjectId);
    }
  }, [selectedProjectId]);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("id, project_no, project_name, product_name")
      .order("project_no");

    if (error) {
      alert("プロジェクト取得エラー: " + error.message);
    } else {
      setProjects(data || []);
    }
  }

  async function fetchData(projectId: number) {
    setLoading(true);

    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    setProject(projectData);

    const { data: poData } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("project_id", projectId);
    setPurchaseOrders(poData || []);

    const { data: drData } = await supabase
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
      .eq("project_id", projectId);

    // 日報をアイテムにマッピング
    const dailyMap: Record<number, DailyReport[]> = {};
    (poData || []).forEach((po) => (dailyMap[po.id] = []));

    (drData || []).forEach((dr: any) => {
      const targetPo = (poData || []).find((po) =>
        dr.task_description?.includes(po.item_name)
      );
      if (targetPo) {
        dailyMap[targetPo.id].push({
          id: dr.id,
          user_id: dr.user_id,
          task_description: dr.task_description,
          work_hours: dr.work_hours,
          overtime_hours: dr.overtime_hours,
          note: dr.note,
          user_name: dr.profiles?.name ?? "不明",
        });
      }
    });

    setDailyReports(dailyMap);
    setLoading(false);
  }

  return (
    <div className="container mt-5">
      <h1 className="title is-4">原価内訳表</h1>

      {/* ▼ プロジェクト選択 */}
      <div className="field mb-4">
        <label className="label">プロジェクト選択</label>
        <div className="control">
          <div className="select is-fullwidth">
            <select
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              <option value="">-- 選択してください --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  No.{p.project_no} | {p.project_name} | {p.product_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <progress className="progress is-small is-primary" max="100">読み込み中</progress>}

      {project && (
        <div className="box">
          <h2 className="subtitle is-5">
            工事No: {project.project_no} | {project.project_name} | {project.product_name}
          </h2>

          <table className="table is-bordered is-striped is-hoverable is-fullwidth" style={{ backgroundColor: "#121212", color: "#eee" }}>
            <thead>
              <tr>
                <th>品名</th>
                <th>数量</th>
                <th>単位</th>
                <th>単価</th>
                <th>合計金額</th>
                <th>作業者</th>
                <th>作業内容</th>
                <th>時間</th>
                <th>特記事項</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => {
                const reports = dailyReports[po.id] || [];
                return (
                  <>
                    <tr className="has-background-dark has-text-weight-bold" key={po.id}>
                      <td>{po.item_name}</td>
                      <td>{po.quantity}</td>
                      <td>{po.unit}</td>
                      <td>{po.unit_price}</td>
                      <td>{po.total_price}</td>
                      <td colSpan={4}></td>
                    </tr>
                    {reports.map((r) => (
                      <tr key={r.id}>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>{r.user_name}</td>
                        <td>{r.task_description}</td>
                        <td>{r.work_hours}</td>
                        <td>{r.note}</td>
                      </tr>
                    ))}
                    {reports.map(
                      (r) =>
                        r.overtime_hours && r.overtime_hours > 0 && (
                          <tr key={`ot-${r.id}`} className="has-text-danger is-italic">
                            <td colSpan={5}></td>
                            <td>{r.user_name}</td>
                            <td>残業</td>
                            <td>{r.overtime_hours}</td>
                            <td>残業</td>
                          </tr>
                        )
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
