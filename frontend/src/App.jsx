import { useRef, useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const ideas = [
  "Python backend developer with AWS experience",
  "Entry-level data analyst who enjoys working with SQL",
  "Remote product designer at a small company",
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function sendMessage(event) {
    event?.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    setMessages((items) => [...items, { role: "user", content: query }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Search failed");
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content: data.answer,
          jobs: data.jobs,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function startOver() {
    setMessages([]);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3" onClick={(event) => { event.preventDefault(); startOver(); }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-xl text-white">↗</span>
            <span>
              <span className="block text-base font-bold tracking-tight">RoleMatch</span>
              <span className="block text-xs text-slate-500">A more natural job search</span>
            </span>
          </a>
          {messages.length > 0 && <button onClick={startOver} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">New search</button>}
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl flex-col px-4 sm:px-6">
        <div className="flex-1 py-8 sm:py-12">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-3xl pt-8 sm:pt-16">
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Find work that fits</div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Tell us what you want to do next.</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">Describe your skills, interests, or ideal workplace. RoleMatch looks for meaning across a small collection of sample jobs.</p>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {ideas.map((idea) => <button key={idea} onClick={() => { setInput(idea); inputRef.current?.focus(); }} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm leading-6 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300">{idea}<span className="mt-3 block text-emerald-700">Try this ↗</span></button>)}
              </div>
              <div className="mt-8 flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />Sample roles · semantic matching</div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-8">
              {messages.map((message, index) => (
                <article key={`${message.role}-${index}`} className={message.role === "user" ? "flex justify-end" : ""}>
                  {message.role === "user" ? (
                    <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-emerald-800 px-5 py-3.5 text-sm leading-6 text-white">{message.content}</div>
                  ) : (
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">R</span>RoleMatch <span className="font-normal text-slate-400">· Job search assistant</span></div>
                      <p className="mb-4 text-sm leading-6 text-slate-600">{message.content}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {message.jobs?.map((job) => <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{job.company}</p><h2 className="mt-1 text-lg font-semibold leading-6">{job.title}</h2></div><span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">{Math.round(job.score * 100)}% match</span></div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{job.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">{job.skills.split(",").map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{skill.trim()}</span>)}</div>
                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span>{job.location}</span><span>{job.work_type}</span></div>
                        </div>)}
                      </div>
                    </div>
                  )}
                </article>
              ))}
              {loading && <div className="flex items-center gap-3 text-sm text-slate-500"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />Looking across the job list…</div>}
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#f5f6f3] py-4">
          <form onSubmit={sendMessage} className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,0.07)]">
            <div className="flex items-center gap-2">
              <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Describe the job you're looking for…" disabled={loading} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400" />
              <button disabled={loading || !input.trim()} className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-40">{loading ? "Searching" : "Search jobs"}</button>
            </div>
          </form>
          <p className="mt-3 text-center text-xs text-slate-400">Sample listings for learning and demonstration.</p>
        </div>
      </section>
    </main>
  );
}
