import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured, supabase, PROOF_BUCKET, PROOF_TABLE } from "@/lib/supabase";
import { cn, getInitials, type ProofType, proofTypeBg } from "@/lib/utils";
import PreviewModal from "@/screens/PreviewModal";

interface RecentProof {
  id: string;
  proof_type: ProofType;
  public_url: string;
  created_at: string;
}

const PROOF_TYPES: ProofType[] = ["before", "during", "after"];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 18) return "Good afternoon,";
  return "Good evening,";
};

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [proofType, setProofType] = useState<ProofType>("before");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [recents, setRecents] = useState<RecentProof[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const displayName: string =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "there";

  const initials = getInitials(displayName);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from(PROOF_TABLE)
          .select("id, proof_type, public_url, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(12);
        if (!cancelled && data) setRecents(data as RecentProof[]);
      } catch {
        /* table may not exist yet — silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) return null;
  if (!loading && !user && isSupabaseConfigured) return <Navigate to="/auth" replace />;

  const onFile = (f: File | null) => {
    if (f) setPendingFile(f);
  };

  const handleUploaded = (proof: RecentProof) => {
    setRecents((r) => [proof, ...r].slice(0, 12));
    setPendingFile(null);
  };

  return (
    <main className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="pt-safe px-5 pt-4 pb-2 flex items-start justify-between">
        <div>
          <p className="font-sans text-[13px] text-secondary-foreground">{greeting()}</p>
          <h1 className="font-display text-[20px] leading-tight text-foreground mt-0.5 capitalize">
            {displayName}
          </h1>
        </div>
        <button
          aria-label="Account"
          onClick={() => setSheetOpen(true)}
          className="h-10 w-10 rounded-full bg-elevated border border-accent/30 flex items-center justify-center text-accent font-mono-brand text-sm"
        >
          {initials}
        </button>
      </header>

      {/* Capture hero card */}
      <section className="px-5 mt-4">
        <div className="bg-surface border border-accent/15 rounded-[20px] p-6">
          <p className="font-mono-brand text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
            Proof Capture
          </p>
          <h2 className="font-display text-[22px] text-foreground mt-2">Log your proof</h2>
          <p className="font-sans text-sm text-secondary-foreground mt-1.5">
            Capture a before, during, or after photo to document your work.
          </p>

          {/* Pills */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {PROOF_TYPES.map((t) => {
              const selected = t === proofType;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setProofType(t)}
                  className={cn(
                    "h-10 rounded-full font-mono-brand text-[11px] uppercase tracking-[0.14em] border transition",
                    selected
                      ? "accent-wash text-accent border-accent glow-accent"
                      : "bg-elevated text-muted-foreground border-accent/15",
                  )}
                  aria-pressed={selected}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Camera button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="mt-5 w-full h-14 rounded-xl bg-accent text-accent-foreground font-medium text-base flex items-center justify-center gap-2.5 active:opacity-90 transition"
          >
            <Camera size={20} strokeWidth={2.2} />
            Capture Proof Photo
          </button>

          <button
            type="button"
            onClick={() => libraryInputRef.current?.click()}
            className="mt-3 w-full text-center text-[13px] text-muted-foreground underline underline-offset-4 active:text-accent"
          >
            Choose from library
          </button>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={libraryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </section>

      {/* Recent uploads */}
      <section className="px-5 mt-8 pb-safe pb-6 flex-1">
        <p className="font-mono-brand text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
          Recent uploads
        </p>
        {recents.length === 0 ? (
          <p className="text-center text-[13px] text-muted-foreground mt-6">
            Your proof photos will appear here.
          </p>
        ) : (
          <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
            {recents.map((r) => (
              <div
                key={r.id}
                className="relative shrink-0 h-20 w-20 rounded-[10px] overflow-hidden bg-elevated border border-accent/10"
              >
                <img
                  src={r.public_url}
                  alt={`${r.proof_type} proof`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span
                  className={cn(
                    "absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md font-mono-brand text-[9px] uppercase tracking-wide",
                    proofTypeBg[r.proof_type],
                  )}
                >
                  {r.proof_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Preview modal (when a file is captured) */}
      {pendingFile && user && (
        <PreviewModal
          file={pendingFile}
          proofType={proofType}
          user={user}
          displayName={displayName}
          onCancel={() => setPendingFile(null)}
          onUploaded={handleUploaded}
        />
      )}

      {/* Account sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end animate-fade-in"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="w-full bg-surface rounded-t-[28px] p-6 pb-safe pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30 mb-5" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-mono-brand text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Signed in as
                </p>
                <p className="font-sans text-foreground mt-1">{user?.email ?? displayName}</p>
              </div>
              <button onClick={() => setSheetOpen(false)} className="p-2 text-muted-foreground" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <button
              onClick={async () => {
                setSheetOpen(false);
                await signOut();
              }}
              className="w-full h-14 rounded-xl bg-elevated border border-accent/20 text-foreground font-medium active:opacity-90"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
