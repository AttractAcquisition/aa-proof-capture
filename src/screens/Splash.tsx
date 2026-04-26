const Splash = () => {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background pt-safe pb-safe animate-fade-in">
      <h1 className="font-display text-[48px] leading-none text-accent">AA</h1>
      <p className="font-display text-[28px] leading-none text-foreground mt-1">Proof</p>
      <div className="mt-5 h-px w-[60px] bg-accent/60" />
      <p className="font-mono-brand text-[11px] text-muted-foreground uppercase mt-4 tracking-[0.15em]">
        Attract Acquisition
      </p>
    </main>
  );
};

export default Splash;
