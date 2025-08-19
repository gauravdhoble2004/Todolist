import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import toast, { Toaster } from "react-hot-toast";
import TodoForm from "./components/TodoForm";
import EmptyState from "./components/EmptyState";

export default function App() {
  const { width, height } = useWindowSize();

  const [todos, setTodos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("todos") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      localStorage.removeItem("todos");
      return [];
    }
  });

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [showConfetti, setShowConfetti] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [filter, setFilter] = useState("all");

  React.useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  React.useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const allCompleted = useMemo(
    () => todos.length > 0 && todos.every((t) => t.completed),
    [todos]
  );
  const activeCount = todos.filter((t) => !t.completed).length;
  const isDark = theme === "dark";

  const pageBg = isDark
    ? "bg-gradient-to-br from-slate-900 to-indigo-900"
    : "bg-gradient-to-br from-indigo-100 to-white";
  const cardBg = isDark ? "bg-[#0f172a] text-white" : "bg-white text-slate-800";
  const itemBg = isDark ? "bg-[#1e293b]" : "bg-slate-100";

  const addTodo = (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Cannot add empty task!");
      return;
    }
    setTodos((prev) => [...prev, { id: Date.now(), text: trimmed, completed: false }]);
    toast.success("Todo added!");
  };

  const toggleComplete = (id) => {
    setTodos((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );

      const updated = next.find((t) => t.id === id);
      if (updated.completed) toast.success("Task completed!");
      if (next.length > 0 && next.every((t) => t.completed)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        toast.success("All tasks completed! 🎉");
      }

      return next;
    });
  };

  const deleteTodo = (id) => {
    if (editingId === id) {
      setEditingId(null);
      setEditValue("");
    }
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast.success("Todo deleted!");
  };

  const clearCompleted = () => {
    const completedCount = todos.filter((t) => t.completed).length;
    if (completedCount === 0) return;
    setTodos((prev) => prev.filter((t) => !t.completed));
    toast.success(`${completedCount} completed task(s) cleared!`);
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditValue(text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = () => {
    const text = editValue.trim();
    if (!text) {
      toast.error("Task cannot be empty!");
      return;
    }
    setTodos((prev) => prev.map((t) => (t.id === editingId ? { ...t, text } : t)));
    setEditingId(null);
    setEditValue("");
    toast.success("Task updated!");
  };

  const handleEditKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className={`min-h-screen ${pageBg} p-6 transition-colors`}>

      <Toaster position="top-right" reverseOrder={false} />
      {showConfetti && <ReactConfetti width={width} height={height} />}

      <div className="w-full max-w-xl mx-auto">

        <div className={`${cardBg} rounded-2xl p-6 shadow-xl border border-white/10`}>
          <div className="flex items-center justify-between mb-6 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
                My Todos
              </span>
            </h1>
            <motion.button
              whileTap={{ rotate: 180, scale: 0.9 }}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition"
              title="Toggle theme"
            >
              {isDark ? "🌙" : "☀️"}
            </motion.button>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="opacity-80 w-full md:w-auto">
              {activeCount === 0
                ? "Nothing pending. Great job!"
                : `${activeCount} task${activeCount > 1 ? "s" : ""} pending`}
            </p>
            <motion.div
              key={todos.length}
              initial={{ scale: 0.85 }}
              animate={{ scale: [1.25, 1] }}
              transition={{ duration: 0.35 }}
              className={`w-12 h-12 flex items-center justify-center rounded-full font-bold shadow-lg ${
                allCompleted && todos.length > 0
                  ? "bg-emerald-400 text-emerald-900"
                  : "bg-indigo-400 text-indigo-900"
              }`}
              title="Total todos"
            >
              {todos.length}
            </motion.div>
          </div>


          <div className="mt-6">
            <TodoForm onAdd={addTodo} isDark={isDark} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm flex-wrap">
            <span className="opacity-70">{todos.filter((t) => t.completed).length} completed</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={clearCompleted}
                className="px-3 py-1 rounded-md bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40"
                disabled={!todos.some((t) => t.completed)}
              >
                Clear completed
              </button>

              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md ${
                    filter === f
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>


        <div className="mt-6 space-y-3">
          <AnimatePresence>
            {filteredTodos.length === 0 ? (
              <EmptyState key="empty" isDark={isDark} />
            ) : (
              filteredTodos.map((todo) => {
                const isEditing = editingId === todo.id;
                return (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      x: todo.completed ? [0, -4, 4, -3, 3, 0] : 0,
                    }}
                    exit={{ opacity: 0, x: 60 }}
                    transition={{ duration: 0.35 }}
                    className={`flex flex-col md:flex-row items-center justify-between px-4 py-3 rounded-xl shadow border border-white/10 ${itemBg} gap-3`}
                  >
                    <div className="flex-1 flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => toggleComplete(todo.id)}
                        className={`inline-flex w-5 h-5 items-center justify-center rounded-full border transition ${
                          todo.completed ? "bg-emerald-500 border-emerald-500" : "border-white/30"
                        }`}
                        title="Toggle complete"
                      >
                        {todo.completed ? "✓" : ""}
                      </button>

                      {!isEditing ? (
                        <span className={`text-base break-words ${todo.completed ? "line-through opacity-60" : "opacity-95"}`}>
                          {todo.text}
                        </span>
                      ) : (
                        <motion.input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleEditKey}
                          className={`flex-1 px-3 py-1.5 rounded-md outline-none border break-words ${
                            isDark
                              ? "bg-white/10 border-white/20 text-white placeholder-white/60"
                              : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                          }`}
                          placeholder="Edit task…"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => startEdit(todo.id, todo.text)}
                            className="px-3 py-1 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 text-sm"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <motion.button
                            whileTap={{ scale: 0.85, rotate: -12 }}
                            onClick={() => deleteTodo(todo.id)}
                            className="px-2 py-1 text-rose-400 hover:text-rose-500 text-lg"
                            title="Delete"
                          >
                            ✕
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 text-sm"
                            title="Save (Enter)"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 rounded-md bg-slate-500 text-white hover:bg-slate-600 text-sm"
                            title="Cancel (Esc)"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
