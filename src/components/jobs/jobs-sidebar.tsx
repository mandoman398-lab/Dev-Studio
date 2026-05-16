import { Plus, Briefcase } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { ListPagination } from "@/components/ui/list-pagination";
import type { SavedJob } from "./types";
import { STATUS_COLORS, JOB_STATUSES } from "./types";

interface Props {
  jobs: SavedJob[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const statusLabel: Record<string, string> = {
  saved: "Saved", applied: "Applied", interview: "Interview",
  offer: "Offer", rejected: "Rejected",
};

export function JobsSidebar({ jobs, activeId, onSelect, onAdd }: Props) {
  const { page, setPage, totalPages, paged, total, pageSize } = usePagination(jobs, 20);
  const grouped = JOB_STATUSES.reduce<Record<string, SavedJob[]>>((acc, s) => {
    acc[s] = paged.filter((j) => j.status === s);
    return acc;
  }, {} as any);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border/60 flex items-center shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
          Jobs ({jobs.length})
        </span>
      </div>
      <div className="overflow-y-auto p-2 space-y-3 flex-1">
        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
            <Briefcase className="size-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No jobs tracked yet.</p>
            <p className="text-[10px] text-muted-foreground/60">Browse live jobs or add one manually.</p>
          </div>
        )}
        {JOB_STATUSES.map((status) => {
          const items = grouped[status];
          if (!items || items.length === 0) return null;
          return (
            <div key={status}>
              <p className="px-2 mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                {statusLabel[status]} ({items.length})
              </p>
              <ul className="space-y-0.5">
                {items.map((job) => (
                  <li key={job.id}>
                    <button
                      onClick={() => onSelect(job.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
                        activeId === job.id
                          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <p className="text-xs font-medium truncate leading-snug">{job.title}</p>
                      {job.company && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{job.company}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-lg border font-medium ${STATUS_COLORS[job.status] ?? ""}`}>
                          {statusLabel[job.status] ?? job.status}
                        </span>
                        {job.platform && (
                          <span className="text-[9px] text-muted-foreground truncate">{job.platform}</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <ListPagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      <div className="p-2 pt-0 shrink-0">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 text-xs font-semibold transition-colors border border-primary/20"
        >
          <Plus className="size-3.5" /> Add Job
        </button>
      </div>
    </div>
  );
}
