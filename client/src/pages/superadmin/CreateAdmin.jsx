import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function CreateAdmin() {
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    institutionId: ""
  });

  useEffect(() => {
    API.get("/institutions").then(res =>
      setInstitutions(res.data.institutions)
    );
  }, []);

  const submit = async () => {
    if (!form.institutionId || !form.name || !form.email || !form.password) {
      return toast.error("Please fill all fields");
    }
    try {
      await API.post("/super-admin/create-admin", form);
      toast.success("Admin created successfully");
      setForm({ ...form, name: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create Admin");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Create Institution Admin
      </h3>

      <select
        className="border dark:border-slate-700 bg-transparent dark:text-white dark:bg-slate-800 p-2 w-full mb-3 rounded outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) =>
          setForm({ ...form, institutionId: e.target.value })
        }
      >
        <option value="">Select Institution</option>
        {institutions.map(i => (
          <option key={i._id} value={i._id}>
            {i.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Name"
        className="border dark:border-slate-700 bg-transparent dark:text-white p-2 w-full mb-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Email"
        className="border dark:border-slate-700 bg-transparent dark:text-white p-2 w-full mb-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Password"
        type="password"
        className="border dark:border-slate-700 bg-transparent dark:text-white p-2 w-full mb-4 rounded outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button
        onClick={submit}
        className="bg-green-300 text-white px-4 py-2 rounded"
      >
        Create Admin
      </button>
    </div>
  );
}
