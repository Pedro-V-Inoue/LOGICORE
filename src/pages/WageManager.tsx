import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  name: string;
  role: string;
};

type Wage = {
  id: number;
  user_id: string;
  hourly_wage: number;
  overtime_wage: number;
  effective_from: string;
  profile?: { name: string };
};

export default function WageManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [wages, setWages] = useState<Wage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [hourlyWage, setHourlyWage] = useState<number>(0);
  const [editingWageId, setEditingWageId] = useState<number | null>(null);
  const [editingWageValue, setEditingWageValue] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUserRole();
    fetchUsers();
    fetchWages();
  }, []);

  const fetchCurrentUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setCurrentUserRole(data.role);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role")
      .order("name");

    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchWages = async () => {
    const { data, error } = await supabase
      .from("wages")
      .select("*, profile:profiles(name)")
      .order("effective_from", { ascending: false });

    if (!error && data) {
      setWages(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || hourlyWage <= 0) return;

    const { error } = await supabase.from("wages").insert({
      user_id: selectedUserId,
      hourly_wage: hourlyWage,
    });

    if (error) {
      alert("登録に失敗しました: " + error.message);
    } else {
      alert("登録しました");
      setHourlyWage(0);
      fetchWages();
    }
  };

  const handleEdit = (id: number, currentWage: number) => {
    setEditingWageId(id);
    setEditingWageValue(currentWage);
  };

  const handleUpdate = async (id: number) => {
    if (editingWageValue === null || editingWageValue <= 0) return;

    const { error } = await supabase
      .from("wages")
      .update({ hourly_wage: editingWageValue })
      .eq("id", id);

    if (error) {
      alert("更新に失敗しました: " + error.message);
    } else {
      setEditingWageId(null);
      setEditingWageValue(null);
      fetchWages();
    }
  };

  if (currentUserRole === null) {
    return <div className="text-center mt-10">読み込み中...</div>;
  }

  if (currentUserRole !== "事務") {
    return <div className="text-center text-red-600 mt-10">アクセス権限がありません。</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">時給管理（事務員専用）</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <select
          className="w-full border p-2 rounded"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
        >
          <option value="">作業者を選択</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="時給（円）"
          className="w-full border p-2 rounded"
          value={hourlyWage}
          onChange={(e) => setHourlyWage(parseInt(e.target.value))}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          登録
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-2">登録済み時給</h3>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">作業者</th>
              <th className="border px-2 py-1">時給</th>
              <th className="border px-2 py-1">残業時給</th>
              <th className="border px-2 py-1">適用開始日</th>
              <th className="border px-2 py-1">操作</th>
            </tr>
          </thead>
          <tbody>
            {wages.map((wage) => (
              <tr key={wage.id}>
                <td className="border px-2 py-1">{wage.profile?.name ?? "不明"}</td>
                <td className="border px-2 py-1">
                  {editingWageId === wage.id ? (
                    <input
                      type="number"
                      className="border p-1 rounded w-20"
                      value={editingWageValue ?? ""}
                      onChange={(e) => setEditingWageValue(parseInt(e.target.value))}
                    />
                  ) : (
                    `${wage.hourly_wage}円`
                  )}
                </td>
                <td className="border px-2 py-1">{wage.overtime_wage}円</td>
                <td className="border px-2 py-1">{wage.effective_from}</td>
                <td className="border px-2 py-1">
                  {editingWageId === wage.id ? (
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleUpdate(wage.id)}
                    >
                      保存
                    </button>
                  ) : (
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => handleEdit(wage.id, wage.hourly_wage)}
                    >
                      編集
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
