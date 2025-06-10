import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Report } from "../types";

export default function ReportModal({
  onClose,
  report,
  userId,
}: {
  onClose: () => void;
  report: Report | null;
  userId: string | null;
}) {
  const [reportDate, setReportDate] = useState(report?.report_date || "");
  const [projectId, setProjectId] = useState(report?.project_id || 1);
  const [task, setTask] = useState(report?.task_description || "");
  const [workHours, setWorkHours] = useState(report?.work_hours || 0);
  const [overtime, setOvertime] = useState(report?.overtime_hours || 0);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from("projects").select("project_no, project_name");
      if (error) {
        console.error("プロジェクト取得エラー:", error.message);
      } else {
        setProjects((data || []).map((p: any) => ({ id: p.project_no, name: p.project_name })));
      }
    };

    fetchProjects();
  }, []);

  const handleSave = async () => {
    if (!userId) return alert("ユーザー情報が不足しています");

    const payload = {
      report_date: reportDate,
      project_id: projectId,
      task_description: task,
      work_hours: workHours,
      overtime_hours: overtime,
      user_id: userId,
    };

    if (report) {
      const { error } = await supabase
        .from("daily_reports")
        .update(payload)
        .eq("id", report.id);

      if (error) {
        alert("更新エラー: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("daily_reports").insert(payload);
      if (error) {
        alert("登録エラー: " + error.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>

      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{report ? "日報を編集" : "新規日報作成"}</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>

        <section className="modal-card-body">
          <div className="field">
            <label className="label">日付</label>
            <div className="control">
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="field">
            <label className="label">工事選択</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(Number(e.target.value))}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      （工事No: {p.id}）{p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label">作業内容</label>
            <div className="control">
              <input
                type="text"
                placeholder="作業内容"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="field">
            <label className="label">作業時間</label>
            <div className="control">
              <input
                type="number"
                step="0.5"
                placeholder="作業時間"
                value={workHours}
                onChange={(e) => setWorkHours(Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          <div className="field">
            <label className="label">残業時間</label>
            <div className="control">
              <input
                type="number"
                step="0.5"
                placeholder="残業時間"
                value={overtime}
                onChange={(e) => setOvertime(Number(e.target.value))}
                className="input"
              />
            </div>
          </div>
        </section>

        <footer className="modal-card-foot">
          <button className="button" onClick={onClose}>キャンセル</button>
          <button className="button is-success" onClick={handleSave}>保存</button>
        </footer>
      </div>
    </div>
  );
}
