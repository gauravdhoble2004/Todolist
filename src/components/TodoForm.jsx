import React, { useState } from "react";

export default function TodoForm({ onAdd, isDark }) {
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onAdd(text);
    setValue("");
  };

  return (
    <form onSubmit={submit} className="flex">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a new task…"
        className={`flex-1 px-4 py-2 rounded-l-xl outline-none border transition ${
          isDark
            ? "bg-white/10 border-white/15 placeholder-white/60 text-white"
            : "bg-white border-slate-200 placeholder-slate-400 text-slate-800"
        }`}
      />
      <button
        type="submit"
        className="rounded-r-xl px-4 py-2 bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
      >
        Add
      </button>
    </form>
  );
}
