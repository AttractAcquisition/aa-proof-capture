import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase, PROOF_BUCKET, PROOF_TABLE } from "@/lib/supabase";
import { cn, formatProofDate, type ProofType, proofTypeBg } from "@/lib/utils";

interface PreviewModalProps {
  file: File;
  proofType: ProofType;
  user: User;
  displayName: string;
  onCancel: () => void;
  onUploaded: (proof: {
    id: string;
    proof_type: ProofType;
    public_url: string;
    created_at: string;
  }) => void;
}

type Status = "idle" | "uploading" | "success" | "error";

const PreviewModal = ({ file, proofType, user, displayName, onCancel, onUploaded }: PreviewModalProps) => {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  const createdAt = useMemo(() => new Date(), []);

  const upload = async () => {
    setErrorMsg(null);

    if (!isSupabaseConfigured) {
      setErrorMsg("Uploads are not yet configured. Please connect Supabase.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    try {
      const ts = Date.now();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${ts}-${proofType}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(PROOF_BUCKET).getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const { data: row, error: dbErr } = await supabase
        .from(PROOF_TABLE)
        .insert({
          user_id: user.id,
          proof_type: proofType,
          storage_path: path,
          public_url: publicUrl,
          note: note.trim() || null,
        })
        .select("id, proof_type, public_url, created_at")
        .single();
      if (dbErr) throw dbErr;

      setStatus("success");
      setTimeout(() => {
        onUploaded({
          id: (row?.id as string) ?? `${ts}`,
          proof_type: proofType,
          public_url: publicUrl,
          created_at: (row?.created_at as string) ?? new Date().toISOString(),
        });
      }, 1200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed. Please try again.";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const disabled = status === "uploading" || status === "success";

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-slide-up">
      {/* Top bar */}
      <div className="pt-safe px-5 pt-3 pb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="font-sans text-[15px] text-accent disabled:opacity-50"
        >
          Cancel
        </button>
        <p className="font-mono-brand text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Review Proof
        </p>
        <span className="w-12" />
      </div>

      {/* Photo preview */}
      <div className="w-full bg-elevated" style={{ maxHeight: "55vh" }}>
        <img
          src={previewUrl}
          alt="Proof preview"
          className="w-full object-cover"
          style={{ maxHeight: "55vh" }}
        />
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pt-5 pb-safe pb-6 overflow-y-auto">
        <div>
          <span
            className={cn(
              "inline-block px-4 py-1 rounded-full font-mono-brand text-[13px] uppercase tracking-[0.15em]",
              proofTypeBg[proofType],
            )}
          >
            {proofType}
          </span>
        </div>

        <p className="text-[13px] text-secondary-foreground font-sans mt-3">
          {formatProofDate(createdAt)}
        </p>
        <p className="text-[13px] text-secondary-foreground font-sans">
          Uploaded by <span className="capitalize">{displayName}</span>
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add a note (optional)"
          className="mt-4 w-full bg-elevated text-foreground placeholder:text-muted-foreground rounded-xl p-4 text-[14px] border border-accent/10 focus:border-accent focus:outline-none focus:glow-accent resize-none"
        />

        {/* Action */}
        <button
          type="button"
          onClick={upload}
          disabled={disabled}
          className={cn(
            "mt-5 w-full h-14 rounded-xl font-medium text-base flex items-center justify-center gap-2 transition",
            status === "success"
              ? "bg-accent text-accent-foreground"
              : "bg-accent text-accent-foreground active:opacity-90 disabled:opacity-70",
          )}
        >
          {status === "uploading" && (
            <>
              <Loader2 size={18} className="animate-spin" /> Uploading…
            </>
          )}
          {status === "success" && (
            <>
              <Check size={20} strokeWidth={2.5} /> Uploaded
            </>
          )}
          {(status === "idle" || status === "error") && "Upload Proof"}
        </button>

        {errorMsg && (
          <p className="text-danger text-[13px] font-sans mt-3" role="alert">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default PreviewModal;
