export default function SummaryCards({ totalHours, overtimeHours, days }: {
  totalHours: number;
  overtimeHours: number;
  days: number;
}) {
  return (
    <div className="columns is-multiline">
      <div className="column is-one-third">
        <div className="box has-text-centered">
          <p className="title is-4">{totalHours} 時間</p>
          <p className="subtitle is-6">総労働時間</p>
        </div>
      </div>
      <div className="column is-one-third">
        <div className="box has-text-centered">
          <p className="title is-4">{overtimeHours} 時間</p>
          <p className="subtitle is-6">残業時間</p>
        </div>
      </div>
      <div className="column is-one-third">
        <div className="box has-text-centered">
          <p className="title is-4">{days} 日</p>
          <p className="subtitle is-6">出勤日数</p>
        </div>
      </div>
    </div>
  );
}