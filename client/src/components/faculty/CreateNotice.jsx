import { useState } from "react";
import api from "../../services/api";

export default function CreateNotice({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetAudience: "STUDENT"
  });

  const submit = async () => {
    if (!form.title || !form.message) {
      return alert("All fields required");
    }

    await api.post("/notices", form);
    alert("Notice created");
    setForm({ title: "", message: "", targetAudience: "STUDENT" });
    if (onCreated) onCreated();
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-semibold mb-4">
        Create Notice
      </h3>

      <input
        placeholder="Title"
        className="border p-2 rounded w-full mb-3"
        value={form.title}
        onChange={e =>
          setForm({ ...form, title: e.target.value })
        }
      />

      <textarea
        placeholder="Message"
        className="border p-2 rounded w-full mb-3"
        rows={3}
        value={form.message}
        onChange={e =>
          setForm({ ...form, message: e.target.value })
        }
      />

      <select
        className="border p-2 rounded w-full mb-4"
        value={form.targetAudience}
        onChange={e =>
          setForm({ ...form, targetAudience: e.target.value })
        }
      >
        {/* <option value="ALL">All</option> */}
        <option value="FACULTY">Faculty</option>

        <option value="STUDENT">Students</option>
      </select>

      <button
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Publish Notice
      </button>
    </div>
  );
}
