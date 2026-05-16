import { Plus, Handshake } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { ListPagination } from "@/components/ui/list-pagination";
import type { FreelanceOffer } from "./types";
import { STATUS_COLORS, PLATFORM_COLORS } from "./types";

interface Props {
  offers: FreelanceOffer[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const statusLabel: Record<string, string> = {
  new: "New", in_review: "In Review", accepted: "Accepted",
  rejected: "Rejected", completed: "Done",
};

export function OffersSidebar({ offers, activeId, onSelect, onAdd }: Props) {
  const { page, setPage, totalPages, paged, total, pageSize } = usePagination(offers, 20);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border/60 flex items-center shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
          Offers ({offers.length})
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {offers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
            <Handshake className="size-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No offers tracked yet.</p>
            <p className="text-[10px] text-muted-foreground/60">Add offers from Mostaql, Upwork, Fiverr, etc.</p>
          </div>
        )}
        <ul className="space-y-0.5">
          {paged.map((offer) => (
            <li key={offer.id}>
              <button
                onClick={() => onSelect(offer.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                  activeId === offer.id
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <p className="text-xs font-medium truncate leading-snug">{offer.title}</p>
                {offer.client && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{offer.client}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {offer.platform && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-lg font-medium ${PLATFORM_COLORS[offer.platform] ?? "bg-muted text-muted-foreground"}`}>
                      {offer.platform}
                    </span>
                  )}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-lg border font-medium ${STATUS_COLORS[offer.status] ?? ""}`}>
                    {statusLabel[offer.status] ?? offer.status}
                  </span>
                  {offer.budget && (
                    <span className="text-[9px] text-green-400 font-medium">{offer.budget} {offer.currency}</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <ListPagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      <div className="p-2 pt-0 shrink-0">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 text-xs font-semibold transition-colors border border-primary/20"
        >
          <Plus className="size-3.5" /> Add Offer
        </button>
      </div>
    </div>
  );
}
