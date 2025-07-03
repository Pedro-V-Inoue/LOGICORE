import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Report {
  report_date: string;
  work_hours: number;
  overtime_hours: number;
}

interface Props {
  reports: Report[];
}

const WorkTimeLineChart: React.FC<Props> = ({ reports }) => {
  // 日付ごとに合算
  const aggregated: Record<string, { work: number; overtime: number }> = reports.reduce((acc, report) => {
    const dateKey = report.report_date;
    if (!acc[dateKey]) {
      acc[dateKey] = { work: 0, overtime: 0 };
    }
    acc[dateKey].work += report.work_hours ?? 0;
    acc[dateKey].overtime += report.overtime_hours ?? 0;
    return acc;
  }, {} as Record<string, { work: number; overtime: number }>);

  // 日付順に並び替えてチャートデータに整形
  const chartData = Object.entries(aggregated)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, values]) => {
        const d = new Date(date);
        const dayOfWeek = d.getDay(); // 0: 日曜, 6: 土曜
        return {
        rawDate: date,
        date: d.toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" }),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        regular: parseFloat((values.work).toFixed(1)),
        overtime: parseFloat(values.overtime.toFixed(1)),
        };
    });

  return (
    <div className="box">
      <h2 className="subtitle is-5">日別勤務時間の推移</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={({ x, y, payload }) => {
                // 該当日付の生データ（YYYY-MM-DD形式）を取得
                const rawDate = chartData.find(d => d.date === payload.value)?.rawDate;
                const day = rawDate ? new Date(rawDate).getDay() : null;
                
                // 曜日で色分け（日曜=赤、土曜=青、それ以外=グレー）
                const color =
                day === 0 ? "#d9534f" : // 日曜: 赤
                day === 6 ? "#5bc0de" : // 土曜: 青
                "#666";                // 平日: グレー

                return (
                <text
                    x={x}
                    y={y + 10}
                    textAnchor="middle"
                    fill={color}
                    fontSize={12}
                >
                    {payload.value}
                </text>
                );
            }}
            />
          <YAxis unit="h" domain={[0, 12]} />
          <Tooltip formatter={(value) => `${value} 時間`} />
          <Legend />
          <Line type="monotone" dataKey="regular" stroke="#00C49F" name="通常勤務" />
          <Line type="monotone" dataKey="overtime" stroke="#FF8042" name="残業" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkTimeLineChart;