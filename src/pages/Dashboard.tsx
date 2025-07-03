import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Supabaseクライアントを設定済みとして
import SummaryCards from "../components/Dashboard/SummaryCards";
import WorkTimePieChart from "../components/Dashboard/WorkTimePieChart";
import DailyReportTable from "../components/Dashboard/DailyReportTable";
import WorkTimeLineChart from "../components/Dashboard/WorkTimeLineChart.tsx";

const getDateRange = (mode: "month" | "week", offset: number) => {
  const now = new Date();
  if (mode === "month") {
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      label: `${start.getFullYear()}年${start.getMonth() + 1}月`
    };
  } else {
    const current = new Date(now);
    current.setDate(current.getDate() + offset * 7);
    const start = new Date(current);
    start.setDate(current.getDate() - current.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      label: `${start.getMonth() + 1}月${start.getDate()}日〜${end.getMonth() + 1}月${end.getDate()}日`
    };
  }
};

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [totalWorkHours, setTotalWorkHours] = useState(0);
  const [totalOvertimeHours, setTotalOvertimeHours] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [rangeMode, setRangeMode] = useState<"month" | "week">("month");
  const [offset, setOffset] = useState(0);
  const [rangeLabel, setRangeLabel] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error);
        return;
      }

      setUserId(user.id);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return;

      const { start, end, label } = getDateRange(rangeMode, offset);
      setRangeLabel(label);

      const { data, error } = await supabase
        .from("daily_reports")
        .select("report_date, work_hours, overtime_hours")
        .eq("user_id", userId)
        .gte("report_date", start)
        .lte("report_date", end);

      if (error) {
        console.error("Error fetching reports:", error);
        return;
      }

      setReports(data);

      const workTotal = data.reduce((sum, r) => sum + (r.work_hours ?? 0), 0);
      const overtimeTotal = data.reduce((sum, r) => sum + (r.overtime_hours ?? 0), 0);

      setTotalWorkHours(workTotal);
      setTotalOvertimeHours(overtimeTotal);
      setReportCount(data.length);
    };

    fetchReports();
  }, [userId, rangeMode, offset]);

  if (!userId) {
    return <div className="has-text-centered">読み込み中...</div>;
  }

  return (
    <div className="container" style={{ marginTop: "168px" }}>
      <h1 className="title is-3 has-text-centered">作業員ダッシュボード</h1>

      <div className="tabs is-centered is-toggle is-toggle-rounded">
        <ul>
          <li className={rangeMode === "month" ? "is-active" : ""}>
            <a onClick={() => { setRangeMode("month"); setOffset(0); }}>月表示</a>
          </li>
          <li className={rangeMode === "week" ? "is-active" : ""}>
            <a onClick={() => { setRangeMode("week"); setOffset(0); }}>週表示</a>
          </li>
        </ul>
      </div>

      <div className="level">
        <div className="level-left">
          <button className="button" onClick={() => setOffset(offset - 1)}>
            ← 前の{rangeMode === "month" ? "月" : "週"}
          </button>
        </div>
        <div className="level-item has-text-centered">
          <strong>{rangeLabel}</strong>
        </div>
        <div className="level-right">
          <button className="button" onClick={() => setOffset(offset + 1)}>
            次の{rangeMode === "month" ? "月" : "週"} →
          </button>
        </div>
      </div>

      <SummaryCards
        totalHours={totalWorkHours + totalOvertimeHours}
        overtimeHours={totalOvertimeHours}
        days={reportCount}
      />

      <div className="columns">
        <div className="column is-half">
          <WorkTimePieChart
            regular={totalWorkHours}
            overtime={totalOvertimeHours}
          />
        </div>
        <div className="column is-half">
          <WorkTimeLineChart reports={reports} />
        </div>
      </div>

      <DailyReportTable reports={reports} />
    </div>
  );
}