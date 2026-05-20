import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

const SCENES = [
  {
    id: 1,
    act: "ACT I",
    title: "The Arena",
    subtitle: "Opening scene establishing the arena and characters",
    timestamp: "00:00",
    duration: "~3 min",
    description:
      "The camera descends through smoke into a vast underground arena. Two warriors—Techno and The Inferno—face each other for the first time. The crowd roars. The bond between them is already visible.",
    image:
      "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/b71d7878-4482-41bb-baba-1d2e9e14c9da.jpg",
    color: "#3a6186",
    mood: "ESTABLISHING",
  },
  {
    id: 2,
    act: "ACT II",
    title: "Brothers in Battle",
    subtitle: "Build tension showing the friendship and battle escalation",
    timestamp: "03:00",
    duration: "~4 min",
    description:
      "Flashbacks intercut with the present battle — their shared training, laughter, scars. Back in the arena, the fight intensifies. Neither wants to win. Both must.",
    image:
      "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/b71d7878-4482-41bb-baba-1d2e9e14c9da.jpg",
    color: "#5c3d2e",
    mood: "TENSION",
  },
  {
    id: 3,
    act: "ACT III",
    title: "The Last Breath",
    subtitle: "The tragic moment of Techno's death in combat",
    timestamp: "07:00",
    duration: "~2 min",
    description:
      "A single strike. Time slows. Techno falls — not in defeat, but in grace. His eyes find his friend's. The arena goes silent. A death that changes everything.",
    image:
      "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/391d7a27-55c4-43fd-9da6-571567d6d9e4.jpg",
    color: "#1a1a2e",
    mood: "TRAGEDY",
  },
  {
    id: 4,
    act: "ACT IV",
    title: "Born of Ash",
    subtitle: "Emotional explosion and transformation into The Inferno",
    timestamp: "09:00",
    duration: "~3 min",
    description:
      "Grief ignites fury. The warrior's body fractures with light — fire erupts from within. The transformation is painful, beautiful, and terrifying. The Inferno is born from love turned to loss.",
    image:
      "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/2027435c-6317-4553-b402-3eec5470d127.jpg",
    color: "#7b2d00",
    mood: "TRANSFORMATION",
  },
  {
    id: 5,
    act: "ACT V",
    title: "Absolute Inferno",
    subtitle: "Peak power display with destruction and chaos",
    timestamp: "12:00",
    duration: "~4 min",
    description:
      "The arena burns. Walls collapse. Every opponent falls. The Inferno moves like a god of war — unstoppable, inconsolable. Pure power without purpose. The crowd flees. The world watches.",
    image:
      "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/2027435c-6317-4553-b402-3eec5470d127.jpg",
    color: "#8b0000",
    mood: "CHAOS",
  },
  {
    id: 6,
    act: "ACT VI",
    title: "Embers",
    subtitle: "Aftermath and emotional conclusion of the scene",
    timestamp: "16:00",
    duration: "~3 min",
    description:
      "Rain falls on the ruined arena. The fire dims. The Inferno kneels where Techno fell — no enemy remains, only grief. The last ember dies. In the silence, we hear his name spoken once.",
    image:
      "https://cdn.ezst.app/projects/e2331138-62fc-44df-afee-14bb3253c6a7/files/391d7a27-55c4-43fd-9da6-571567d6d9e4.jpg",
    color: "#1c2b3a",
    mood: "RESOLUTION",
  },
];

const STATS = [
  { label: "Total Runtime", value: "~19 min" },
  { label: "Scenes", value: "6" },
  { label: "Acts", value: "6" },
  { label: "Rating", value: "R" },
];

function EmberParticles() {
  const embers = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.8) % 100}%`,
    size: `${2 + (i % 4)}px`,
    duration: `${2 + (i % 4)}s`,
    delay: `${(i * 0.3) % 5}s`,
    bottom: `${(i * 7) % 30}%`,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e) => (
        <div
          key={e.id}
          className="ember"
          style={{
            left: e.left,
            bottom: e.bottom,
            width: e.size,
            height: e.size,
            "--duration": e.duration,
            "--delay": e.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function SceneCard({
  scene,
  index,
  isActive,
  onClick,
}: {
  scene: (typeof SCENES)[0];
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`scene-card cursor-pointer group relative overflow-hidden border transition-all duration-500 ${
        isActive
          ? "border-[var(--fire-orange)] shadow-[0_0_30px_rgba(255,106,26,0.25)]"
          : "border-[hsl(var(--border))] hover:border-[var(--fire-orange)]/40"
      }`}
      style={{ animationDelay: `${index * 0.12}s` }}
      onClick={onClick}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={scene.image}
          alt={scene.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: isActive ? "none" : "grayscale(40%) brightness(0.75)" }}
        />
        <div
          className="scene-overlay absolute inset-0 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to bottom, ${scene.color}40, ${scene.color}90)`,
            opacity: isActive ? 0.3 : 0.6,
          }}
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[10px] font-cinzel tracking-widest text-[var(--ash-white)]">
          {scene.timestamp}
        </div>
        <div
          className="absolute bottom-3 left-3 text-[9px] font-cinzel tracking-[0.25em]"
          style={{ color: isActive ? "var(--fire-orange)" : "var(--ash-white)" }}
        >
          {scene.mood}
        </div>
      </div>

      <div className="p-5 bg-[var(--smoke-gray)]">
        <div className="flex items-start justify-between mb-2">
          <span
            className="scene-number text-[10px] font-cinzel tracking-[0.3em] transition-colors duration-300"
            style={{ color: isActive ? "var(--fire-orange)" : "hsl(var(--muted-foreground))" }}
          >
            {scene.act}
          </span>
          <span className="text-[10px] font-crimson italic text-[hsl(var(--muted-foreground))]">
            {scene.duration}
          </span>
        </div>
        <h3 className="font-cinzel text-base font-semibold text-[var(--ash-white)] mb-1 leading-tight">
          {scene.title}
        </h3>
        <p className="text-xs font-crimson text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-2">
          {scene.subtitle}
        </p>
      </div>

      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 runtime-bar" />
      )}
    </div>
  );
}

export default function Index() {
  const [activeScene, setActiveScene] = useState(0);
  const [titleVisible, setTitleVisible] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 400);
    const t2 = setTimeout(() => setSceneVisible(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const scene = SCENES[activeScene];

  return (
    <div className="min-h-screen bg-[var(--deep-black)] text-[var(--ash-white)] font-crimson">

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-end overflow-hidden letterbox"
      >
        <div className="absolute inset-0">
          <img
            src={SCENES[activeScene].image}
            alt=""
            className="w-full h-full object-cover transition-all duration-1000"
            style={{ filter: "brightness(0.35) saturate(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-black)] via-[var(--deep-black)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--deep-black)]/60 via-transparent to-[var(--deep-black)]/30" />
        </div>

        <EmberParticles />

        <div className="absolute top-12 left-0 right-0 px-8 md:px-16 flex items-center justify-between z-20">
          <div className="text-[10px] font-cinzel tracking-[0.4em] text-[hsl(var(--muted-foreground))] animate-flicker">
            ORIGINAL ANIMATED SERIES
          </div>
          <div className="flex items-center gap-6 text-[10px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))]">
            <span>EP. 01</span>
            <span className="w-px h-3 bg-current opacity-40" />
            <span>PILOT</span>
          </div>
        </div>

        <div className="relative z-20 px-8 md:px-16 pb-20 md:pb-28">
          <div
            className={`mb-6 transition-all duration-700 ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px flex-1 max-w-16 bg-[var(--fire-orange)]" />
              <span className="text-[9px] font-cinzel tracking-[0.5em] text-[var(--fire-orange)] uppercase">
                A Story of Fire &amp; Loss
              </span>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-300 ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h1 className="font-cinzel font-black leading-none mb-2">
              <span
                className="block text-[clamp(4rem,14vw,11rem)] tracking-tight animate-inferno"
                style={{
                  color: "var(--fire-orange)",
                  WebkitTextStroke: "1px rgba(255,179,71,0.2)",
                }}
              >
                THE
              </span>
              <span
                className="block text-[clamp(4rem,14vw,11rem)] tracking-tight -mt-4 md:-mt-6"
                style={{
                  color: "var(--ash-white)",
                  WebkitTextStroke: "1px rgba(255,106,26,0.1)",
                }}
              >
                INFERNO
              </span>
            </h1>
          </div>

          <div
            className={`mt-6 flex flex-col md:flex-row md:items-end gap-6 transition-all duration-700 delay-500 ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="font-crimson italic text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-md leading-relaxed">
              "When grief becomes fire, and fire becomes god."
            </p>
            <div className="flex items-center gap-5 md:ml-auto">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-cinzel text-lg font-bold text-[var(--fire-orange)]">
                    {s.value}
                  </div>
                  <div className="text-[9px] tracking-[0.2em] text-[hsl(var(--muted-foreground))] uppercase mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-10 flex items-center gap-4 transition-all duration-700 delay-700 ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <button className="group flex items-center gap-3 bg-[var(--fire-orange)] text-[var(--deep-black)] px-7 py-3.5 font-cinzel text-sm tracking-widest font-semibold uppercase hover:bg-[var(--ember-gold)] transition-all duration-300 animate-pulse-glow">
              <Icon name="Play" size={16} className="fill-current" />
              Watch Episode
            </button>
            <button className="flex items-center gap-2 border border-white/20 text-[var(--ash-white)] px-6 py-3.5 font-cinzel text-xs tracking-widest uppercase hover:border-[var(--fire-orange)]/50 hover:text-[var(--fire-orange)] transition-all duration-300 backdrop-blur-sm">
              <Icon name="Info" size={14} />
              Details
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[9px] font-cinzel tracking-[0.4em]">SCROLL</span>
          <div className="w-px h-8 bg-[var(--fire-orange)] animate-pulse" />
        </div>
      </section>

      {/* SCENE NAVIGATOR */}
      <section className="relative py-20 px-8 md:px-16 bg-[var(--deep-black)]">
        <div className={`mb-12 transition-all duration-700 ${sceneVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px w-8 bg-[var(--fire-orange)]" />
            <span className="text-[9px] font-cinzel tracking-[0.5em] text-[var(--fire-orange)] uppercase">
              Episode Structure
            </span>
          </div>
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-[var(--ash-white)]">
            Six Acts. One Inferno.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENES.map((s, i) => (
            <SceneCard
              key={s.id}
              scene={s}
              index={i}
              isActive={activeScene === i}
              onClick={() => setActiveScene(i)}
            />
          ))}
        </div>
      </section>

      {/* ACTIVE SCENE DETAIL */}
      <section className="relative px-8 md:px-16 py-16 bg-[var(--smoke-gray)] border-t border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
            <div className="w-full md:w-1/2 relative overflow-hidden">
              <img
                key={activeScene}
                src={scene.image}
                alt={scene.title}
                className="w-full aspect-video object-cover animate-scene-reveal"
                style={{ filter: "brightness(0.9) saturate(1.1)" }}
              />
              <div className="absolute top-0 left-0 right-0 h-[8%] bg-black" />
              <div className="absolute bottom-0 left-0 right-0 h-[8%] bg-black" />
              <div className="absolute bottom-[8%] right-3 bg-black/80 px-2 py-0.5 font-cinzel text-xs text-[var(--fire-orange)] tracking-widest">
                {scene.timestamp}
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="text-[9px] font-cinzel tracking-[0.5em] text-[var(--fire-orange)] mb-3 uppercase">
                {scene.act} · {scene.mood}
              </div>
              <h3
                key={`title-${activeScene}`}
                className="font-cinzel text-3xl md:text-4xl font-bold text-[var(--ash-white)] mb-4 leading-tight animate-text-burn"
              >
                {scene.title}
              </h3>
              <div className="h-px bg-gradient-to-r from-[var(--fire-orange)] to-transparent mb-6" />
              <p
                key={`desc-${activeScene}`}
                className="font-crimson text-lg leading-relaxed text-[hsl(var(--muted-foreground))] mb-6 animate-float-up opacity-0-start"
                style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
              >
                {scene.description}
              </p>

              <div className="flex items-center gap-6 mt-auto">
                <div>
                  <div className="text-[9px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))] mb-0.5 uppercase">Duration</div>
                  <div className="font-cinzel text-sm text-[var(--fire-orange)]">{scene.duration}</div>
                </div>
                <div className="w-px h-8 bg-[hsl(var(--border))]" />
                <div>
                  <div className="text-[9px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))] mb-0.5 uppercase">Timestamp</div>
                  <div className="font-cinzel text-sm text-[var(--fire-orange)]">{scene.timestamp}</div>
                </div>
                <div className="w-px h-8 bg-[hsl(var(--border))]" />
                <div>
                  <div className="text-[9px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))] mb-0.5 uppercase">Scene</div>
                  <div className="font-cinzel text-sm text-[var(--fire-orange)]">{scene.id} of {SCENES.length}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-8">
                <button
                  onClick={() => setActiveScene((p) => Math.max(0, p - 1))}
                  disabled={activeScene === 0}
                  className="flex items-center gap-2 border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] px-4 py-2 font-cinzel text-xs tracking-widest uppercase hover:border-[var(--fire-orange)]/50 hover:text-[var(--fire-orange)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Icon name="ChevronLeft" size={14} />
                  Prev
                </button>
                <button
                  onClick={() => setActiveScene((p) => Math.min(SCENES.length - 1, p + 1))}
                  disabled={activeScene === SCENES.length - 1}
                  className="flex items-center gap-2 bg-[var(--fire-orange)]/10 border border-[var(--fire-orange)]/30 text-[var(--fire-orange)] px-4 py-2 font-cinzel text-xs tracking-widest uppercase hover:bg-[var(--fire-orange)]/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next Act
                  <Icon name="ChevronRight" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RUNTIME TIMELINE */}
      <section className="px-8 md:px-16 py-14 bg-[var(--deep-black)] border-t border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-[9px] font-cinzel tracking-[0.5em] text-[var(--fire-orange)] uppercase">
              Runtime Timeline
            </div>
            <div className="text-[9px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))]">
              Total: ~19 min
            </div>
          </div>

          <div className="relative h-1.5 bg-[hsl(var(--border))] rounded-full overflow-hidden mb-3">
            <div
              className="absolute left-0 top-0 h-full runtime-bar rounded-full transition-all duration-700"
              style={{ width: `${((activeScene + 1) / SCENES.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-between">
            {SCENES.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveScene(i)}
                className={`text-[8px] font-cinzel tracking-wider uppercase transition-colors duration-300 text-center ${
                  i === activeScene
                    ? "text-[var(--fire-orange)]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[var(--ash-white)]"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mx-auto mb-1 transition-all duration-300 ${
                    i <= activeScene ? "bg-[var(--fire-orange)]" : "bg-[hsl(var(--border))]"
                  } ${i === activeScene ? "scale-150" : ""}`}
                />
                <span className="hidden md:block">{s.timestamp}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 md:px-16 py-10 border-t border-[hsl(var(--border))] bg-[var(--deep-black)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-cinzel text-xs tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
            THE INFERNO — EPISODE 01 — PILOT
          </div>
          <div className="font-crimson italic text-sm text-[hsl(var(--muted-foreground))]">
            "Some fires cannot be extinguished. Only endured."
          </div>
          <div className="flex items-center gap-3 text-[10px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))]">
            <span>ANIMATED</span>
            <span className="opacity-40">·</span>
            <span>SHORT FILM</span>
            <span className="opacity-40">·</span>
            <span>2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
