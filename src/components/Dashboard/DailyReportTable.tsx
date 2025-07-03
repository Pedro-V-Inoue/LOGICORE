import { isHoliday } from "../../utils/holidays";

export default function DailyReportTable({
  reports,
}: {
  reports: { report_date: string; work_hours: number | null; overtime_hours: number | null }[];
}) {
  // 日付ごとに通常勤務・残業・合計を集計
  const aggregated = reports.reduce((acc, report) => {
    const date = report.report_date;
    if (!acc[date]) {
      acc[date] = { work: 0, overtime: 0 };
    }
    acc[date].work += (report.work_hours ?? 0) ; // 通常勤務 = 合計 - 残業
    acc[date].overtime += report.overtime_hours ?? 0;
    return acc;
  }, {} as Record<string, { work: number; overtime: number }>);

  const sortedDates = Object.keys(aggregated).sort();

  return (
    <div className="box">
      <h2 className="title is-5">📅 日別勤務表（今月）</h2>
      <table className="table is-striped is-fullwidth bordered-table">
        <thead>
          <tr>
            <th className="has-text-centered">日付</th>
            <th className="has-text-centered">通常時間</th>
            <th className="has-text-centered">残業</th>
            <th className="has-text-centered">合計労働時間</th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((date) => {
            const jsDate = new Date(date);
            const day = jsDate.getDay();
            const isSun = day === 0;
            const isSat = day === 6;
            const isHol = isHoliday(date);

            const color = isHol
              ? "#f44336" // 祝日 = 赤
              : isSun
              ? "#d9534f" // 日曜 = 赤
              : isSat
              ? "#5bc0de" // 土曜 = 青
              : undefined;

            const work = aggregated[date].work;
            const overtime = aggregated[date].overtime;
            const total = work + overtime;

            return (
              <tr key={date}>
                <td style={{ color }}>
                  {jsDate.toLocaleDateString("ja-JP", {
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td>{work.toFixed(1)} 時間</td>
                <td>{overtime.toFixed(1)} 時間</td>
                <td>{total.toFixed(1)} 時間</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .bordered-table {
            border-collapse: separate; /* セルの境界線を重ねない */
            border-spacing: 0;          /* セル間の隙間なし */
        }
        .bordered-table th,
        .bordered-table td {
            border-right: 1px solid #636363; /* 右側に縦線 */
        }
        /* 最後の列だけ右の線を消す */
        .bordered-table th:last-child,
        .bordered-table td:last-child {
            border-right: none;
        }
        `}</style>
    </div>
  );
}