import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#00d1b2", "#ff3860"]; // Bulma色：緑、赤

export default function WorkTimePieChart({
  regular,
  overtime,
}: {
  regular: number;
  overtime: number;
}) {
  const data = [
    { name: "通常勤務", value: regular },
    { name: "残業", value: overtime },
  ];

  return (
    <div className="box has-text-centered">
      <p className="subtitle is-5">労働時間の内訳</p>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="40%"  // 少し上にして凡例スペース確保
              outerRadius={80}
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}