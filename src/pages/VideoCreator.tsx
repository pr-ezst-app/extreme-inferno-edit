import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const GENERATE_URL = "https://functions.poehali.dev/5ae25fd1-f1c2-4ba9-805a-fa9583856929";
const STATUS_URL = "https://functions.poehali.dev/e95d9c1e-f6ac-447d-b49f-f018edb800b5";

const PRESETS = [
  {
    label: "Techno meurt",
    icon: "💀",
    prompt:
      "EXTREME anime edit style, massive destroyed combat arena after an intense battle, Techno the young male inventor collapses to the ground dead, broken futuristic gadgets and burning machines scattered everywhere, emotional atmosphere, young MALE fire mage with short spiky red hair frozen in shock, cinematic anime lighting, dynamic camera movement, smoke, sparks, dramatic zooms, motion blur, impact frames, Jujutsu Kaisen style animation, dark fantasy anime movie quality, ultra detailed, emotional close-up, TikTok AMV energy, 4K",
  },
  {
    label: "La rage commence",
    icon: "🔥",
    prompt:
      "EXTREME anime edit style, young MALE fire mage with short spiky red hair screaming in emotional rage, masculine anime face, athletic male body, flames slowly escaping from his skin, glowing red eyes, fiery aura growing out of control, combat arena floor cracking from extreme heat, dramatic anime shadows, shaky camera, motion blur, impact frames, fast zooms, Demon Slayer fire effects, high energy TikTok anime edit, ultra detailed, cinematic atmosphere, 4K",
  },
  {
    label: "Transformation",
    icon: "⚡",
    prompt:
      "EPIC anime transformation edit, young MALE fire mage with short spiky red hair transforms into THE INFERNO, magma cracks spreading across his body, gigantic explosion of flames erupting everywhere, fiery energy wings forming behind him, uncontrollable fire storm destroying the arena, glowing orange and red aura, intense emotional rage, dynamic spinning camera, anime impact frames, velocity effect, motion blur, cinematic destruction, Solo Leveling style animation, dark fantasy anime atmosphere, ultra detailed 4K",
  },
  {
    label: "Forme finale",
    icon: "👁️",
    prompt:
      "THE INFERNO standing in the destroyed arena surrounded by oceans of fire, young MALE fire mage with short spiky red hair fully transformed, masculine anime warrior appearance, glowing fiery eyes filled with rage and sadness, flames constantly leaking from his body, burning debris floating in the air, overpowering fiery aura shaking the environment, cinematic close-up, dramatic slow motion, dark red atmosphere, powerful anime villain energy, intense emotional ending shot, motion blur, anime edit style, 4K",
  },
];

const MODELS = [
  { value: "kling-v1", label: "Kling v1", desc: "Standard quality" },
  { value: "kling-v1-5", label: "Kling v1.5", desc: "Enhanced quality" },
  { value: "kling-v2-master", label: "Kling v2 Master", desc: "Best quality" },
];

const RATIOS = ["16:9", "9:16", "1:1"];
const DURATIONS = [5, 10];

type JobStatus = "idle" | "submitting" | "processing" | "done" | "error";

interface VideoJob {
  id: string;
  task_id: string;
  prompt: string;
  status: JobStatus;
  video_url?: string;
  error?: string;
  created_at: number;
  progress: number;
}

function ProgressRing({ progress, size = 48 }: { progress: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2520" strokeWidth={3} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--fire-orange)" strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

export default function VideoCreator() {
  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [model, setModel] = useState("kling-v1");
  const [ratio, setRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const updateJob = (id: string, patch: Partial<VideoJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  };

  const pollStatus = (job: VideoJob) => {
    let elapsed = 0;
    const maxWait = duration === 10 ? 360 : 240;

    const interval = setInterval(async () => {
      elapsed += 6;
      const progress = Math.min(90, Math.round((elapsed / maxWait) * 90));
      updateJob(job.id, { progress });

      try {
        const res = await fetch(`${STATUS_URL}?task_id=${job.task_id}`);
        const data = await res.json();

        if (data.status === "succeed" && data.video_url) {
          clearInterval(interval);
          delete pollRefs.current[job.id];
          updateJob(job.id, { status: "done", video_url: data.video_url, progress: 100 });
        } else if (data.status === "failed") {
          clearInterval(interval);
          delete pollRefs.current[job.id];
          updateJob(job.id, { status: "error", error: "Generation failed", progress: 0 });
        } else if (elapsed >= maxWait) {
          clearInterval(interval);
          delete pollRefs.current[job.id];
          updateJob(job.id, { status: "error", error: "Timeout — check back later", progress: 0 });
        }
      } catch {
        // keep polling
      }
    }, 6000);

    pollRefs.current[job.id] = interval;
  };

  const generate = async () => {
    if (!prompt.trim()) return;

    const jobId = Date.now().toString();
    const newJob: VideoJob = {
      id: jobId,
      task_id: "",
      prompt: prompt.trim(),
      status: "submitting",
      created_at: Date.now(),
      progress: 0,
    };

    setJobs((prev) => [newJob, ...prev]);
    setActiveJob(jobId);

    try {
      const res = await fetch(GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negative_prompt: negPrompt.trim(),
          model,
          duration,
          aspect_ratio: ratio,
          cfg_scale: 0.5,
          mode: "std",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        updateJob(jobId, { status: "error", error: data.error || data.detail || "API error" });
        return;
      }

      const task_id = data.task_id;
      updateJob(jobId, { task_id, status: "processing", progress: 5 });
      const updatedJob = { ...newJob, task_id, status: "processing" as JobStatus, progress: 5 };
      pollStatus(updatedJob);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      updateJob(jobId, { status: "error", error: msg });
    }
  };

  useEffect(() => {
    return () => {
      Object.values(pollRefs.current).forEach(clearInterval);
    };
  }, []);

  const statusColor: Record<JobStatus, string> = {
    idle: "#555",
    submitting: "#ffb347",
    processing: "#ff6a1a",
    done: "#22c55e",
    error: "#ef4444",
  };

  const statusLabel: Record<JobStatus, string> = {
    idle: "Idle",
    submitting: "Submitting...",
    processing: "Generating...",
    done: "Ready",
    error: "Error",
  };

  return (
    <div className="min-h-screen bg-[#080605] text-[#e8ddd0] font-crimson">

      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-[var(--fire-orange)]" />
          <div>
            <div className="text-[8px] font-cinzel tracking-[0.5em] text-[hsl(var(--muted-foreground))]">THE INFERNO</div>
            <div className="font-cinzel font-bold text-sm tracking-widest text-[#e8ddd0]">VIDEO CREATOR</div>
          </div>
        </div>
        <a
          href="/"
          className="flex items-center gap-2 text-[9px] font-cinzel tracking-widest text-[hsl(var(--muted-foreground))] hover:text-[var(--fire-orange)] transition-colors uppercase"
        >
          <Icon name="Film" size={12} />
          Film Page
        </a>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* LEFT — Generator Panel */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Preset buttons */}
          <div>
            <div className="text-[9px] font-cinzel tracking-[0.4em] text-[var(--fire-orange)] mb-3 uppercase">Quick Scenes</div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPrompt(p.prompt)}
                  className="flex items-center gap-2 border border-[hsl(var(--border))] px-3 py-2.5 text-left hover:border-[var(--fire-orange)]/50 hover:bg-[var(--fire-orange)]/5 transition-all duration-200 group"
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="font-cinzel text-[10px] tracking-wider text-[hsl(var(--muted-foreground))] group-hover:text-[#e8ddd0] transition-colors leading-tight">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <div className="text-[9px] font-cinzel tracking-[0.4em] text-[var(--fire-orange)] mb-2 uppercase">Prompt</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your animated scene in detail — style, characters, action, atmosphere..."
              rows={6}
              className="w-full bg-[#0d0a08] border border-[hsl(var(--border))] text-[#e8ddd0] font-crimson text-sm px-4 py-3 resize-none outline-none focus:border-[var(--fire-orange)]/50 transition-colors placeholder:text-[hsl(var(--muted-foreground))] leading-relaxed"
            />
            <div className="flex justify-end mt-1">
              <span className="text-[9px] font-cinzel text-[hsl(var(--muted-foreground))]">{prompt.length} chars</span>
            </div>
          </div>

          {/* Negative prompt */}
          <div>
            <div className="text-[9px] font-cinzel tracking-[0.4em] text-[hsl(var(--muted-foreground))] mb-2 uppercase">Negative Prompt <span className="opacity-50">(optional)</span></div>
            <textarea
              value={negPrompt}
              onChange={(e) => setNegPrompt(e.target.value)}
              placeholder="What to avoid: blurry, low quality, watermark..."
              rows={2}
              className="w-full bg-[#0d0a08] border border-[hsl(var(--border))] text-[#e8ddd0] font-crimson text-sm px-4 py-3 resize-none outline-none focus:border-[var(--fire-orange)]/30 transition-colors placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>

          {/* Settings row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Model */}
            <div>
              <div className="text-[9px] font-cinzel tracking-[0.3em] text-[hsl(var(--muted-foreground))] mb-2 uppercase">Model</div>
              <div className="flex flex-col gap-1">
                {MODELS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setModel(m.value)}
                    className="flex flex-col px-2 py-1.5 border transition-all duration-200 text-left"
                    style={{
                      borderColor: model === m.value ? "var(--fire-orange)" : "hsl(var(--border))",
                      background: model === m.value ? "rgba(255,106,26,0.08)" : "transparent",
                    }}
                  >
                    <span
                      className="font-cinzel text-[9px] tracking-wider"
                      style={{ color: model === m.value ? "var(--fire-orange)" : "#e8ddd0" }}
                    >
                      {m.label}
                    </span>
                    <span className="text-[8px] text-[hsl(var(--muted-foreground))]">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ratio */}
            <div>
              <div className="text-[9px] font-cinzel tracking-[0.3em] text-[hsl(var(--muted-foreground))] mb-2 uppercase">Ratio</div>
              <div className="flex flex-col gap-1">
                {RATIOS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatio(r)}
                    className="px-2 py-2 border font-cinzel text-[10px] tracking-wider transition-all duration-200"
                    style={{
                      borderColor: ratio === r ? "var(--fire-orange)" : "hsl(var(--border))",
                      color: ratio === r ? "var(--fire-orange)" : "hsl(var(--muted-foreground))",
                      background: ratio === r ? "rgba(255,106,26,0.08)" : "transparent",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="text-[9px] font-cinzel tracking-[0.3em] text-[hsl(var(--muted-foreground))] mb-2 uppercase">Duration</div>
              <div className="flex flex-col gap-1">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className="px-2 py-2 border font-cinzel text-[10px] tracking-wider transition-all duration-200"
                    style={{
                      borderColor: duration === d ? "var(--fire-orange)" : "hsl(var(--border))",
                      color: duration === d ? "var(--fire-orange)" : "hsl(var(--muted-foreground))",
                      background: duration === d ? "rgba(255,106,26,0.08)" : "transparent",
                    }}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!prompt.trim()}
            className="w-full flex items-center justify-center gap-3 py-4 font-cinzel text-sm tracking-widest uppercase font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed animate-pulse-glow"
            style={{
              background: "linear-gradient(135deg, var(--fire-red), var(--fire-orange))",
              color: "#080605",
            }}
          >
            <Icon name="Zap" size={16} className="fill-current" />
            Generate Video
          </button>
        </div>

        {/* RIGHT — Preview + Queue */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Active preview */}
          {(() => {
            const job = jobs.find((j) => j.id === activeJob);
            if (!job) {
              return (
                <div className="aspect-video bg-[#0d0a08] border border-[hsl(var(--border))] flex flex-col items-center justify-center gap-4 text-center px-8">
                  <Icon name="Video" size={40} className="opacity-20" />
                  <div className="font-cinzel text-xs tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
                    Your generated video will appear here
                  </div>
                  <div className="font-crimson italic text-sm text-[hsl(var(--muted-foreground))] opacity-60">
                    Choose a preset or write your own prompt, then hit Generate
                  </div>
                </div>
              );
            }

            if (job.status === "done" && job.video_url) {
              return (
                <div className="relative">
                  <video
                    src={job.video_url}
                    controls
                    autoPlay
                    loop
                    className="w-full aspect-video bg-black object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <a
                      href={job.video_url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 bg-black/80 backdrop-blur-sm border border-[var(--fire-orange)]/40 text-[var(--fire-orange)] px-3 py-1.5 font-cinzel text-[9px] tracking-widest uppercase hover:bg-[var(--fire-orange)]/20 transition-all"
                    >
                      <Icon name="Download" size={11} />
                      Download
                    </a>
                  </div>
                </div>
              );
            }

            if (job.status === "error") {
              return (
                <div className="aspect-video bg-[#0d0a08] border border-red-900/40 flex flex-col items-center justify-center gap-3">
                  <Icon name="AlertTriangle" size={32} className="text-red-500" />
                  <div className="font-cinzel text-xs tracking-widest text-red-400 uppercase">{job.error}</div>
                  <div className="font-crimson italic text-sm text-[hsl(var(--muted-foreground))]">
                    Check your API key or try again
                  </div>
                </div>
              );
            }

            return (
              <div className="aspect-video bg-[#0d0a08] border border-[hsl(var(--border))] flex flex-col items-center justify-center gap-5">
                <ProgressRing progress={job.progress} size={64} />
                <div className="text-center">
                  <div className="font-cinzel text-xs tracking-widest text-[var(--fire-orange)] uppercase mb-1">
                    {job.status === "submitting" ? "Submitting to Kling AI..." : "Generating your video..."}
                  </div>
                  <div className="font-crimson italic text-sm text-[hsl(var(--muted-foreground))]">
                    This takes 1–4 minutes · Don't close this tab
                  </div>
                  <div className="mt-2 font-cinzel text-[10px] text-[hsl(var(--muted-foreground))]">
                    {job.progress}% complete
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Job queue */}
          {jobs.length > 0 && (
            <div>
              <div className="text-[9px] font-cinzel tracking-[0.4em] text-[var(--fire-orange)] mb-3 uppercase">
                Generation Queue ({jobs.length})
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setActiveJob(job.id)}
                    className="flex items-center gap-3 border px-4 py-3 text-left transition-all duration-200 hover:border-[var(--fire-orange)]/30 group"
                    style={{
                      borderColor: activeJob === job.id ? "var(--fire-orange)" : "hsl(var(--border))",
                      background: activeJob === job.id ? "rgba(255,106,26,0.05)" : "transparent",
                    }}
                  >
                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      {job.status === "processing" || job.status === "submitting" ? (
                        <ProgressRing progress={job.progress} size={32} />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: statusColor[job.status] }}
                        >
                          {job.status === "done" && <Icon name="Check" size={12} className="text-green-500" />}
                          {job.status === "error" && <Icon name="X" size={12} className="text-red-500" />}
                          {job.status === "idle" && <Icon name="Clock" size={12} className="opacity-40" />}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[8px] font-cinzel tracking-widest uppercase"
                          style={{ color: statusColor[job.status] }}
                        >
                          {statusLabel[job.status]}
                        </span>
                        {job.task_id && (
                          <span className="text-[8px] font-cinzel text-[hsl(var(--muted-foreground))] opacity-50 truncate">
                            #{job.task_id.slice(-8)}
                          </span>
                        )}
                      </div>
                      <div className="font-crimson text-xs text-[hsl(var(--muted-foreground))] line-clamp-1 leading-tight">
                        {job.prompt}
                      </div>
                    </div>

                    {/* Video thumb if done */}
                    {job.status === "done" && job.video_url && (
                      <video
                        src={job.video_url}
                        muted
                        loop
                        autoPlay
                        className="w-14 h-10 object-cover flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
