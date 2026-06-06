export default function Loading() {
  return (
    <div className="max-w-[600px] mx-auto space-y-5">
      {/* ✅ 3 skeletons de posts — style DealCity */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-3xl border border-border/40 bg-card p-5 space-y-4 animate-pulse"
        >
          {/* Header : avatar + nom + date + bouton options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-muted shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 bg-muted rounded w-24" />
                <div className="h-2 bg-muted rounded w-16" />
              </div>
            </div>
            <div className="size-7 rounded-xl bg-muted" />
          </div>

          {/* Titre produit + badge stock + prix */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded-full w-24" />
            </div>
            <div className="h-9 w-28 bg-muted rounded-2xl" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="h-2.5 bg-muted rounded w-full" />
            <div className="h-2.5 bg-muted rounded w-4/5" />
          </div>

          {/* Image produit */}
          <div className="h-56 bg-muted rounded-2xl w-full" />

          {/* Bouton WhatsApp */}
          <div className="h-12 bg-muted rounded-2xl w-full" />

          {/* Actions : like + commentaire + bookmark */}
          <div className="flex items-center justify-between pt-1 border-t border-border/30">
            <div className="flex items-center gap-5">
              <div className="h-3 bg-muted rounded w-10" />
              <div className="h-3 bg-muted rounded w-10" />
            </div>
            <div className="h-3 bg-muted rounded w-6" />
          </div>
        </div>
      ))}
    </div>
  );
}