import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const SCENES = [
  {
    id: 1,
    time: "0–5 sec",
    code: "SCÈNE 01",
    title: "Techno meurt",
    subtitle: "THE DEATH",
    description:
      "The arena lies in ruins. Machines burn. Gadgets shatter. Techno — the brilliant young inventor — collapses. His last breath leaves him standing still in the air for a fraction of a second... then everything falls.",
    image: "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/4c6113d7-1090-424e-8a3a-56a89e9e3ef2.jpg",
    accent: "#1a6aff",
    label: "DEATH",
    labelColor: "#4a9eff",
  },
  {
    id: 2,
    time: "5–10 sec",
    code: "SCÈNE 02",
    title: "La rage commence",
    subtitle: "THE RAGE",
    description:
      "He screams. The fire won't stay inside anymore. His short red hair whips in the heatwave. The arena floor cracks beneath his feet. Every emotion transforms to flame — uncontrolled, violent, alive.",
    image: "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/c6ab3d09-75b9-46c2-ad45-5dadf9f3dd6b.jpg",
    accent: "#ff6a1a",
    label: "RAGE",
    labelColor: "#ff9a4a",
  },
  {
    id: 3,
    time: "10–15 sec",
    code: "SCÈNE 03",
    title: "Transformation",
    subtitle: "THE INFERNO RISES",
    description:
      "Magma fractures his skin. Wings of pure fire erupt from his back. The arena implodes outward. This is not power — this is grief given a body. The transformation is complete. THE INFERNO exists.",
    image: "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/12b67cb3-b19c-4b4d-9ecd-5076679007ed.jpg",
    accent: "#ff3300",
    label: "TRANSFORM",
    labelColor: "#ff6633",
  },
  {
    id: 4,
    time: "15–20 sec",
    code: "SCÈNE 04",
    title: "Forme finale",
    subtitle: "THE INFERNO",
    description:
      "He stands alone. Oceans of fire. Floating debris. Eyes that carry rage and sadness at once. The world around him burns not from hate — but from love that lost its anchor. This is the end. And the beginning.",
    image: "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/8523b0fb-fb61-464f-86aa-0ae955edf987.jpg",
    accent: "#cc0000",
    label: "FINAL FORM",
    labelColor: "#ff2200",
  },
];

function EmberParticles({ count = 20 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="ember"
          style={{
            left: `${(i * 5.3) % 100}%`,
            bottom: `${(i * 7.1) % 40}%`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            "--duration": `${2.5 + (i % 3)}s`,
            "--delay": `${(i * 0.27) % 4}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function ImpactFlash({ trigger }: { trigger: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 120);
    return () => clearTimeout(t);
  }, [trigger]);
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ background: "rgba(255,106,26,0.18)", mixBlendMode: "screen" }}
    />
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scene = SCENES[active];

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setFlash((f) => f + 1);
  }, []);

  useEffect(() => {
    if (autoplay) {
      intervalRef.current = setInterval(() => {
        setActive((p) => {
          const next = (p + 1) % SCENES.length;
          setFlash((f) => f + 1);
          return next;
        });
      }, 5000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoplay]);

  return (
    <div className="min-h-screen bg-[#080605] text-[#e8ddd0] font-crimson overflow-x-hidden">
      <ImpactFlash trigger={flash} />

      {/* HERO FULLSCREEN */}
      <section className="relative h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            key={`bg-${active}`}
            src={scene.image}
            alt=""
            className="w-full h-full object-cover animate-scene-reveal"
            style={{ filter: "brightness(0.28) saturate(1.4) contrast(1.1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080605] via-[#080605]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080605]/80 to-transparent" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
            }}
          />
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{ background: `radial-gradient(ellipse at 70% 40%, ${scene.accent}18, transparent 65%)` }}
          />
        </div>

        <EmberParticles count={25} />

        {/* Top bar */}
        <div className="relative z-20 flex items-center justify-between px-6 md:px-14 pt-10">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-8 animate-flicker"
              style={{ background: `linear-gradient(to bottom, ${scene.accent}, transparent)` }}
            />
            <div>
              <div className="text-[8px] font-cinzel tracking-[0.5em] text-[hsl(var(--muted-foreground))]">ORIGINAL SERIES</div>
              <div className="text-[10px] font-cinzel tracking-[0.3em] text-[#e8ddd0] mt-0.5">THE INFERNO</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-cinzel tracking-[0.4em] text-[hsl(var(--muted-foreground))]">
            <span>EP.01</span>
            <div className="w-px h-3 bg-current opacity-30" />
            <span
              className="px-2 py-0.5 border text-[8px]"
              style={{ borderColor: `${scene.accent}60`, color: scene.labelColor }}
            >
              {scene.label}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-20 flex-1 flex flex-col justify-end px-6 md:px-14 pb-12 md:pb-20">
          <div className={`mb-4 transition-all duration-500 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
            <div className="flex items-center gap-3">
              <div className="h-px w-6" style={{ background: scene.accent }} />
              <span className="text-[9px] font-cinzel tracking-[0.5em]" style={{ color: scene.labelColor }}>
                {scene.code} · {scene.time}
              </span>
            </div>
          </div>

          <div className={`transition-all duration-700 delay-100 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div
              key={`sub-${active}`}
              className="font-cinzel text-[10px] md:text-xs tracking-[0.6em] mb-1 animate-text-burn"
              style={{ color: scene.accent }}
            >
              {scene.subtitle}
            </div>
            <h1
              key={`title-${active}`}
              className="font-cinzel font-black leading-none tracking-tight animate-text-burn"
              style={{
                fontSize: "clamp(3rem,11vw,9rem)",
                color: "#e8ddd0",
                textShadow: `0 0 80px ${scene.accent}40`,
              }}
            >
              {scene.title}
            </h1>
          </div>

          <p
            key={`desc-${active}`}
            className="mt-5 font-crimson italic text-base md:text-lg text-[hsl(var(--muted-foreground))] max-w-lg leading-relaxed animate-float-up"
            style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
          >
            {scene.description}
          </p>

          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <button
              className="flex items-center gap-2.5 px-6 py-3 font-cinzel text-xs tracking-widest uppercase font-bold transition-all duration-300 hover:opacity-90 animate-pulse-glow"
              style={{
                background: `linear-gradient(135deg, ${scene.accent}, ${scene.labelColor})`,
                color: "#080605",
              }}
              onClick={() => setAutoplay((p) => !p)}
            >
              <Icon name={autoplay ? "Pause" : "Play"} size={14} className="fill-current" />
              {autoplay ? "Pause" : "Play AMV"}
            </button>
            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-2 border border-[var(--fire-orange)]/40 text-[var(--fire-orange)] px-5 py-3 font-cinzel text-xs tracking-widest uppercase hover:bg-[var(--fire-orange)]/10 transition-all duration-300"
            >
              <Icon name="Zap" size={13} />
              Create Video
            </button>
            <div className="flex items-center gap-1">
              {SCENES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === active ? "28px" : "8px",
                    height: "8px",
                    background: i === active ? scene.accent : "#2a2520",
                    border: `1px solid ${i === active ? scene.accent : "#3a3530"}`,
                  }}
                />
              ))}
            </div>
            <div className="ml-auto text-[9px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))]">
              {scene.time} · 20s TOTAL
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 z-20 flex flex-col items-center gap-1.5 opacity-30">
          <div className="w-px h-8 bg-[var(--fire-orange)] animate-pulse" />
          <span className="text-[7px] font-cinzel tracking-[0.4em] mt-2">SCROLL</span>
        </div>

        <div className="absolute top-0 left-0 right-0 h-[6%] bg-black z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-black z-10 pointer-events-none" />
      </section>

      {/* SCENE STRIP */}
      <section className="relative bg-[#0d0a08] border-t border-[hsl(var(--border))]">
        <div className="flex flex-col md:flex-row">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className="relative overflow-hidden transition-all duration-500 group text-left flex-1"
              style={{
                minHeight: "200px",
                flexGrow: i === active ? 1.6 : 1,
              }}
            >
              <img
                src={s.image}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                style={{
                  filter: i === active
                    ? "brightness(0.55) saturate(1.3)"
                    : "brightness(0.25) saturate(0.5) grayscale(0.4)",
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(to top, ${s.accent}99, transparent)`,
                  opacity: i === active ? 0.7 : 0.3,
                }}
              />
              <div className="relative z-10 p-5 h-full flex flex-col justify-end">
                <div
                  className="text-[8px] font-cinzel tracking-[0.4em] mb-1 transition-colors duration-300"
                  style={{ color: i === active ? s.labelColor : "rgba(232,221,208,0.4)" }}
                >
                  {s.code} · {s.time}
                </div>
                <div
                  className="font-cinzel font-bold text-sm md:text-base leading-tight transition-all duration-300"
                  style={{ color: i === active ? "#e8ddd0" : "rgba(232,221,208,0.5)" }}
                >
                  {s.title}
                </div>
                {i === active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 runtime-bar" />
                )}
              </div>
              {i === active && (
                <div
                  className="absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse"
                  style={{ background: s.accent }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* SCENE DETAIL */}
      <section className="px-6 md:px-14 py-16 bg-[#080605]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3 relative overflow-hidden">
            <img
              key={`detail-${active}`}
              src={scene.image}
              alt={scene.title}
              className="w-full aspect-video object-cover animate-scene-reveal"
              style={{ filter: "brightness(0.85) saturate(1.2)" }}
            />
            <div className="absolute top-0 left-0 right-0 h-[7%] bg-black pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[7%] bg-black pointer-events-none" />
            <div
              className="absolute top-[7%] left-0 w-8 h-8 border-t-2 border-l-2 pointer-events-none"
              style={{ borderColor: scene.accent }}
            />
            <div
              className="absolute bottom-[7%] right-0 w-8 h-8 border-b-2 border-r-2 pointer-events-none"
              style={{ borderColor: scene.accent }}
            />
            <div
              className="absolute bottom-[7%] left-3 font-cinzel text-xs tracking-widest px-2 py-0.5 bg-black/80"
              style={{ color: scene.labelColor }}
            >
              {scene.time}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="text-[8px] font-cinzel tracking-[0.5em] mb-3" style={{ color: scene.labelColor }}>
              {scene.code} · {scene.label}
            </div>
            <h2
              key={`dh-${active}`}
              className="font-cinzel font-black text-2xl md:text-3xl leading-tight mb-2 animate-text-burn"
              style={{ color: "#e8ddd0", textShadow: `0 0 40px ${scene.accent}50` }}
            >
              {scene.title}
            </h2>
            <div
              className="h-px mb-5 w-full"
              style={{ background: `linear-gradient(to right, ${scene.accent}, transparent)` }}
            />
            <p
              key={`dp-${active}`}
              className="font-crimson text-base md:text-lg leading-relaxed text-[hsl(var(--muted-foreground))] mb-6 animate-float-up"
              style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}
            >
              {scene.description}
            </p>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => goTo(Math.max(0, active - 1))}
                disabled={active === 0}
                className="flex items-center gap-2 border px-4 py-2.5 font-cinzel text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
              >
                <Icon name="ChevronLeft" size={12} />
                Prev
              </button>
              <button
                onClick={() => goTo(Math.min(SCENES.length - 1, active + 1))}
                disabled={active === SCENES.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 font-cinzel text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed font-bold"
                style={{
                  background: `linear-gradient(135deg, ${scene.accent}, ${scene.labelColor})`,
                  color: "#080605",
                }}
              >
                Next Scene
                <Icon name="ChevronRight" size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="px-6 md:px-14 py-10 bg-[#0d0a08] border-t border-[hsl(var(--border))]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[8px] font-cinzel tracking-[0.5em] text-[var(--fire-orange)] uppercase">AMV Timeline</span>
            <span className="text-[8px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))]">0–20 seconds</span>
          </div>
          <div className="relative h-1 bg-[hsl(var(--border))] mb-5">
            <div
              className="absolute left-0 top-0 h-full transition-all duration-700 runtime-bar"
              style={{ width: `${((active + 1) / SCENES.length) * 100}%` }}
            />
            {SCENES.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
                style={{ left: `${(i / (SCENES.length - 1)) * 100}%` }}
              >
                <div
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === active ? "14px" : "8px",
                    height: i === active ? "14px" : "8px",
                    background: i <= active ? s.accent : "#2a2520",
                    border: `2px solid ${i <= active ? s.accent : "#3a3530"}`,
                    boxShadow: i === active ? `0 0 12px ${s.accent}` : "none",
                  }}
                />
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {SCENES.map((s, i) => (
              <button key={i} onClick={() => goTo(i)} className="text-left transition-all duration-300">
                <div
                  className="text-[9px] font-cinzel tracking-wider mb-0.5 transition-colors"
                  style={{ color: i === active ? s.labelColor : "hsl(var(--muted-foreground))" }}
                >
                  {s.time}
                </div>
                <div
                  className="text-[10px] font-cinzel font-semibold transition-colors leading-tight"
                  style={{ color: i === active ? "#e8ddd0" : "rgba(232,221,208,0.35)" }}
                >
                  {s.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-14 py-8 border-t border-[hsl(var(--border))] bg-[#080605]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="font-cinzel text-[9px] tracking-[0.4em] text-[hsl(var(--muted-foreground))]">
            THE INFERNO · EP.01 · PILOT
          </div>
          <div className="font-crimson italic text-sm text-[hsl(var(--muted-foreground))]">
            "Some fires cannot be extinguished. Only endured."
          </div>
          <div className="flex items-center gap-2 text-[9px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))]">
            <span>ANIME</span>
            <span className="opacity-30">·</span>
            <span>SHORT FILM</span>
            <span className="opacity-30">·</span>
            <span>20 SEC AMV</span>
          </div>
        </div>
      </footer>
    </div>
  );
}