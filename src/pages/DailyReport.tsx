import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ReportModal from "./ReportModal";
import type { Report } from "../types";

export default function DailyReportList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Report | null>(null);

  const fetchReports = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("ログインが必要です");
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      alert("プロフィール取得に失敗しました");
      setLoading(false);
      return;
    }

    setRole(profile.role);

    // レポート取得
    let query = supabase
      .from("daily_reports")
      .select(
        `
        id, report_date, task_description, work_hours, overtime_hours, manpower, project_id, user_id,
        profiles(name)
      `
      )
      .order("report_date", { ascending: false });

    if (profile.role !== "staff") {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      alert("レポート取得エラー: " + error.message);
    } else {
      setReports(
        (data as any[]).map((item) => ({
          ...item,
          profiles: item.profiles && Array.isArray(item.profiles)
            ? item.profiles[0]
            : item.profiles,
        }))
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openModal = (report: Report | null = null) => {
    setEditTarget(report);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    fetchReports(); // モーダルを閉じたあと再読み込み
  };

  return (
    <div className="container p-4" style={{ backgroundColor: "#111",  }}>
      <h2 className="title is-4 mb-4">日報一覧</h2>
      <button
        className="button is-primary is-rounded mb-4"
        onClick={() => openModal()}
      >
        + 新規日報
      </button>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <table className="table is-bordered is-fullwidth">
          <thead className="has-background-dark">
            <tr>
              <th>日付</th>
              <th>氏名</th>
              <th>工事No</th>
              <th>作業内容</th>
              <th>時間</th>
              <th>残業</th>
              <th>人工</th>
              <th>編集者</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.report_date ? new Date(r.report_date).toLocaleDateString() : "-"}</td>
                <td>{r.profiles?.name || "-"}</td>
                <td>{r.project_id ?? "-"}</td>
                <td>{r.task_description ?? "-"}</td>
                <td>{r.work_hours ?? 0}h</td>
                <td>{r.overtime_hours ?? 0}h</td>
                <td>{r.manpower != null ? r.manpower.toFixed(2) : "-"}</td>
                <td>
                  {(userId === r.user_id || role === "staff") && (
                    <button
                      className="button is-text has-text-link has-text-underlined"
                      onClick={() => openModal(r)}
                    >
                      編集
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <ReportModal onClose={closeModal} report={editTarget} userId={userId} />
      )}
    </div>
  );
}
