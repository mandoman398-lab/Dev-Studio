import { FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { CVProfile } from "@/types/cv";
import { FOCUS_COLORS, FOCUS_LABELS } from "@/types/cv";

interface CVSidebarProps {
  cvProfiles: CVProfile[];
  activeCVId: string | null;
  onSelectCV: (id: string) => void;
  onNewCV: () => void;
  onDeleteCV: (id: string) => void;
}

export function CVSidebar({ cvProfiles, activeCVId, onSelectCV, onNewCV, onDeleteCV }: CVSidebarProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2.5 border-b border-border/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
            <FileText className="size-3.5" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
            CV Profiles ({cvProfiles.length})
          </span>
        </div>
      </div>

      <nav className="overflow-y-auto p-2 space-y-0.5 scrollbar-thin flex-1">
        {cvProfiles.length > 0 ? (
          cvProfiles.map((cv) => (
            <div
              key={cv.id}
              className={`group relative w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                activeCVId === cv.id
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
              onClick={() => onSelectCV(cv.id)}
            >
              <div className="pr-6">
                <div className={`truncate leading-snug text-xs font-medium ${activeCVId === cv.id ? "text-foreground" : ""}`}>
                  {cv.title || "Untitled CV"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-lg border font-medium ${FOCUS_COLORS[cv.focus]}`}>
                    {FOCUS_LABELS[cv.focus]}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60">
                    {new Date(cv.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(cv.id); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="px-3 py-10 text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl text-center flex flex-col items-center gap-2 m-2">
            <div className="size-8 rounded-xl bg-muted/30 grid place-items-center">
              <Plus className="size-4 opacity-50" />
            </div>
            No CVs yet — create your first one
          </div>
        )}
      </nav>

      <div className="p-2 pt-0 shrink-0">
        <button
          onClick={onNewCV}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 text-xs font-semibold transition-colors border border-primary/20"
        >
          <Plus className="size-3.5" /> New CV Profile
        </button>
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
        title="Delete CV?"
        description="This CV profile will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDeleteId) onDeleteCV(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
