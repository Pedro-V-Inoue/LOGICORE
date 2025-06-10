import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Dialog } from "@headlessui/react";

interface Project {
  id: number;
  project_no: number;
  company_name: string;
  project_name: string;
  product_name: string;
  sales_rep?: string;
  order_date: string;
  finish_type?: string;
  creator?: string;
  delivery_date?: string;
  drawing_staff?: string;
  exploded_view_staff?: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*").order("project_no");
    if (!error) setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openNew = () => {
    setIsEditing(false);
    setFormData({});
    setIsOpen(true);
  };

  const openEdit = (project: Project) => {
    setIsEditing(true);
    setSelected(project);
    setFormData(project);
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (isEditing && selected) {
      await supabase.from("projects").update(formData).eq("id", selected.id);
    } else {
      await supabase.from("projects").insert(formData);
    }
    setIsOpen(false);
    fetchProjects();
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">工事一覧</h2>
        <button
          onClick={openNew}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新規登録
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">工事No</th>
            <th className="border p-2">会社名</th>
            <th className="border p-2">工事名</th>
            <th className="border p-2">製品名</th>
            <th className="border p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="text-sm">
              <td className="border p-2">{project.project_no}</td>
              <td className="border p-2">{project.company_name}</td>
              <td className="border p-2">{project.project_name}</td>
              <td className="border p-2">{project.product_name}</td>
              <td className="border p-2">
                <button
                  onClick={() => openEdit(project)}
                  className="text-blue-500 hover:underline"
                >
                  編集
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* モーダル */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded p-6 w-full max-w-lg space-y-4">
            <Dialog.Title className="text-lg font-bold mb-2">
              {isEditing ? "工事編集" : "工事登録"}
            </Dialog.Title>
            {[
              "project_no",
              "company_name",
              "project_name",
              "product_name",
              "sales_rep",
              "order_date",
              "finish_type",
              "creator",
              "delivery_date",
              "drawing_staff",
              "exploded_view_staff",
            ].map((field) => (
              <input
                key={field}
                name={field}
                type={field.includes("date") ? "date" : "text"}
                placeholder={field}
                value={(formData as any)[field] || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            ))}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {isEditing ? "更新" : "登録"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
