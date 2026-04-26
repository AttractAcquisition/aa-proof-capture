import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && session) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Sign-in is not yet configured. Please contact your account manager.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden pt-safe">
      {/* Top brand section */}
      <section className="relative flex flex-col items-center justify-center radial-glow pt-10 pb-8 min-h-[34vh]">
        <h1 className="font-display text-[64px] leading-none text-accent">AA</h1>
        <p className="font-display text-[22px] leading-none text-foreground mt-3">Proof Capture</p>
        <p className="font-mono-brand text-[10px] text-muted-foreground uppercase mt-4 tracking-[0.18em]">
          Attract Acquisition
        </p>
      </section>

      {/* Bottom card */}
      <section className="flex-1 flex flex-col justify-center bg-surface rounded-t-[32px] px-6 pt-10 pb-10 pb-safe shadow-[0_-8px_40px_rgba(0,0,0,0.4)]">
        <div className="pb-6">
          <h2 className="font-display text-2xl text-foreground">Welcome back</h2>
          <p className="font-sans text-sm text-secondary-foreground mt-1">
            Sign in to your proof dashboard
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-14 px-4 rounded-xl bg-elevated text-foreground placeholder:text-muted-foreground border border-border/15 focus:border-accent focus:outline-none focus:glow-accent text-base transition"
          />

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pl-4 pr-12 rounded-xl bg-elevated text-foreground placeholder:text-muted-foreground border border-border/15 focus:border-accent focus:outline-none focus:glow-accent text-base transition"
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-accent"
            >
              {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-danger text-sm font-sans" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-xl bg-accent text-accent-foreground font-medium text-base flex items-center justify-center gap-2 active:opacity-90 disabled:opacity-60 transition"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-[13px] text-muted-foreground pt-2">
            Having trouble? Contact your account manager.
          </p>
        </form>
      </section>
    </main>
  );
};

export default Auth;
