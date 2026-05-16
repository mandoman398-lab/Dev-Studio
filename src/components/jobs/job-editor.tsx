import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Bookmark, Loader2, Search, RefreshCw, Trash2 } from "lucide-react";
import type { SavedJob, RemoteJob } from "./types";
import { JOB_STATUSES, JOB_PLATFORMS, STATUS_COLORS } from "./types";
import { toast } from "sonner";

interface Props {
  job: SavedJob | null;
  isNew: boolean;
  onSave: (job: Partial<SavedJob>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSaveRemote: (job: Partial<SavedJob>) => Promise<void>;
  onBack: () => void;
}

const EMPTY: Partial<SavedJob> = {
  title: "", company: "", location: "", url: "",
  platform: "LinkedIn", status: "saved", salary: "",
  remote: false, tags: [], notes: "",
};

export function JobEditor({ job, isNew, onSave, onDelete, onSaveRemote, onBack }: Props) {
  const [form, setForm] = useState<Partial<SavedJob>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [liveJobs, setLiveJobs] = useState<RemoteJob[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveSearch, setLiveSearch] = useState("");
  const [liveFetched, setLiveFetched] = useState(false);
  const [savingRemote, setSavingRemote] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setForm({ ...job });
      setTagInput("");
    } else if (isNew) {
      setForm({ ...EMPTY });
      setTagInput("");
    }
  }, [job, isNew]);

  const fetchLive = async (tag = "") => {
    setLiveLoading(true);
    setLiveFetched(true);
    try {
      const url = tag ? `/api/jobs/remote?tag=${encodeURIComponent(tag)}` : "/api/jobs/remote";
      const r = await fetch(url);
      if (!r.ok) throw new Error("fetch failed");
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setLiveJobs(data);
    } catch {
      toast.error("Could not load live jobs. Try again.");
    } finally {
      setLiveLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error("Title is required."); return; }
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!job) return;
    if (!confirm("Delete this job?")) return;
    setDeleting(true);
    try { await onDelete(job.id); } finally { setDeleting(false); }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) {
      setForm((p) => ({ ...p, tags: [...(p.tags ?? []), t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((p) => ({ ...p, tags: (p.tags ?? []).filter((x) => x !== tag) }));
  };

  const handleSaveRemote = async (rj: RemoteJob) => {
    setSavingRemote(rj.id);
    try {
      await onSaveRemote({
        title: rj.title,
        company: rj.company,
        location: rj.location,
        url: rj.url,
        platform: "RemoteOK",
        status: "saved",
        remote: true,
        tags: rj.tags ?? [],
        salary: rj.salary_min ? `$${rj.salary_min.toLocaleString()} – $${rj.salary_max?.toLocaleString() ?? "?"}` : "",
      });
      toast.success("Job saved!");
    } finally {
      setSavingRemote(null);
    }
  };

  if (!job && !isNew) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border shrink-0 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Browse Live Remote Jobs</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={liveSearch}
                onChange={(e) => setLiveSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLive(liveSearch)}
                placeholder="Tag: react, python…"
                className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring w-44"
              />
            </div>
            <button
              onClick={() => fetchLive(liveSearch)}
              disabled={liveLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {liveLoading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              {liveFetched ? "Refresh" : "Load Jobs"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!liveFetched && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="size-12 rounded-full bg-primary/10 grid place-items-center">
                <Search className="size-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Live Remote Jobs</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Fetch real remote jobs from RemoteOK. Filter by tag (react, python, node, etc.) or load all.
              </p>
              <button
                onClick={() => fetchLive("")}
                className="mt-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Load Latest Jobs
              </button>
            </div>
          )}
          {liveLoading && (
            <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" /> Fetching jobs…
            </div>
          )}
          {!liveLoading && liveFetched && liveJobs.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No results found. Try a different tag.</p>
          )}
          {!liveLoading && liveJobs.length > 0 && (
            <div className="space-y-3">
              {liveJobs.map((rj) => (
                <div key={rj.id} className="rounded-lg border border-border bg-card p-4 hover:border-ring/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {rj.company_logo && (
                      <img src={rj.company_logo} alt={rj.company} className="size-9 rounded-md object-contain shrink-0 bg-muted border border-border" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug truncate">{rj.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{rj.company}{rj.location ? ` · ${rj.location}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a href={rj.url} target="_blank" rel="noopener noreferrer"
                            className="size-7 grid place-items-center rounded-md border border-border hover:bg-sidebar-accent/40 text-muted-foreground hover:text-foreground transition-colors"
                            title="Open job"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                          <button
                            onClick={() => handleSaveRemote(rj)}
                            disabled={savingRemote === rj.id}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
                          >
                            {savingRemote === rj.id ? <Loader2 className="size-3 animate-spin" /> : <Bookmark className="size-3" />}
                            Save
                          </button>
                        </div>
                      </div>
                      {rj.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rj.tags.slice(0, 6).map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                          ))}
                        </div>
                      )}
                      {(rj.salary_min || rj.salary_max) && (
                        <p className="text-[11px] text-green-400 mt-1.5 font-medium">
                          ${rj.salary_min?.toLocaleString()} – ${rj.salary_max?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border shrink-0 flex items-center gap-3">
        <button onClick={onBack} className="size-7 grid place-items-center rounded-md hover:bg-sidebar-accent/60 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
        </button>
        <h2 className="text-sm font-semibold flex-1 truncate">{job ? `Edit: ${job.title}` : "Add Job"}</h2>
        {job && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="size-7 grid place-items-center rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete job"
          >
            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-xl space-y-4">
          <Field label="Job Title *">
            <input className={inputCls} value={form.title ?? ""} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Senior Frontend Developer" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input className={inputCls} value={form.company ?? ""} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Acme Corp" />
            </Field>
            <Field label="Location">
              <input className={inputCls} value={form.location ?? ""} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Remote / City" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Platform">
              <select className={inputCls} value={form.platform ?? ""} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}>
                {JOB_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status ?? "saved"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                {JOB_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary / Budget">
              <input className={inputCls} value={form.salary ?? ""} onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))} placeholder="$80k – $120k" />
            </Field>
            <Field label="Job URL">
              <input type="url" className={inputCls} value={form.url ?? ""} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://…" />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remote-toggle" checked={form.remote ?? false} onChange={(e) => setForm((p) => ({ ...p, remote: e.target.checked }))} className="rounded border-border accent-primary size-3.5" />
            <label htmlFor="remote-toggle" className="text-xs text-muted-foreground cursor-pointer">Remote position</label>
          </div>
          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {(form.tags ?? []).map((t) => (
                <span key={t} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:text-destructive transition-colors leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className={`${inputCls} flex-1`} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag…" />
              <button onClick={addTag} className="px-2.5 py-1.5 text-xs border border-border rounded-md hover:bg-sidebar-accent/40 text-muted-foreground hover:text-foreground transition-colors">Add</button>
            </div>
          </Field>
          <Field label="Notes">
            <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.notes ?? ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Interview notes, contacts, next steps…" />
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity font-medium">
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {job ? "Save Changes" : "Add Job"}
            </button>
            {job?.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-md hover:bg-sidebar-accent/40 text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink className="size-3.5" /> Open
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
