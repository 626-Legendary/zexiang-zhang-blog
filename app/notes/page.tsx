import Link from "next/link";

type Note = {
  id: string;
  title: string;
  summary: string;
  date: string;
};

const notes: Note[] = [
  {
    id: "note-1",
    title: "React 虚拟 DOM 原理解析",
    summary: "深入解析 React 虚拟 DOM 的工作原理及性能优化技巧。",
    date: "2025-12-12",
  },
  {
    id: "note-2",
    title: "Next.js 13 App Router 实践",
    summary: "使用 Next.js 13 App Router 构建现代化博客应用的实践经验。",
    date: "2025-12-10",
  },
  // 可以替换为真实数据或 fetch API
];

export default function NotesPage() {
  return (
    <main className="min-h-screen w-full max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center">笔记</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow hover:shadow-lg transition-shadow flex flex-col gap-2"
          >
            <h2 className="text-xl font-semibold">{note.title}</h2>
            <p className="text-gray-300 text-sm">{note.summary}</p>
            <span className="text-gray-400 text-xs mt-auto">{note.date}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
