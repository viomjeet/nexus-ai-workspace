"use client";

import { useState } from "react";

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState("");
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const [stylePreset, setStylePreset] = useState("photorealistic");

    // API Call States
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const aspectRatios = [
        { id: "1:1", label: "1:1 Square" },
        { id: "16:9", label: "16:9 Landscape" },
        { id: "9:16", label: "9:16 Portrait" },
        { id: "4:3", label: "4:3 Classic" },
    ];

    const artStyles = [
        { id: "photorealistic", label: "Photorealistic" },
        { id: "cyberpunk", label: "Cyberpunk Neon" },
        { id: "anime", label: "Anime / Manga" },
        { id: "digital-art", label: "3D Render" },
    ];

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, aspectRatio, stylePreset }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generation error");

            setImageUrl(data.imageUrl);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1d2537] rounded-xl p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-2xl space-y-5 sm:space-y-6">

                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1d2537] pb-4 sm:pb-6">
                    <div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Neural Image Studio
                            </h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                VISION ENGINE
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                            Synthesize high-fidelity visuals using open-source generative diffusion models.
                        </p>
                    </div>

                    <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 dark:bg-[#0d2229] border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 shrink-0">
                        Open-Diffusion v1
                    </span>
                </div>

                {/* Input & Output Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Controls Column */}
                    <div className="lg:col-span-7 space-y-5">
                        {/* Prompt Box */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                                <span>Text Prompt</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Free Synthesis</span>
                            </label>
                            <textarea
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe here..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 dark:bg-[#090c14] dark:border-[#1b2334] dark:text-slate-100 dark:placeholder-slate-600 transition leading-relaxed resize-none font-mono"
                            />
                        </div>

                        {/* Aspect Ratio */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                Aspect Ratio
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {aspectRatios.map((ratio) => (
                                    <button
                                        key={ratio.id}
                                        type="button"
                                        onClick={() => setAspectRatio(ratio.id)}
                                        className={`py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-md border transition text-center truncate cursor-pointer ${aspectRatio === ratio.id
                                            ? "bg-cyan-600 border-cyan-400 text-white"
                                            : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#111726] dark:border-[#1e273a] dark:text-slate-400 dark:hover:text-white"
                                            }`}
                                        title={ratio.label}
                                    >
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Art Style */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                Style Preset
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {artStyles.map((style) => (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => setStylePreset(style.id)}

                                        className={`py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-md border transition text-center truncate cursor-pointer ${stylePreset === style.id
                                            ? "bg-cyan-600 border-cyan-400 text-white"
                                            : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#111726] dark:border-[#1e273a] dark:text-slate-400 dark:hover:text-white"
                                            }`}
                                        title={style.label}
                                    >
                                        {style.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-rose-500 font-mono bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                                {error}
                            </p>
                        )}

                        {/* Generate Button */}
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
                            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-98 text-white text-xs font-bold font-mono tracking-wider uppercase rounded-xl shadow-md shadow-cyan-900/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Synthesizing Neural Art...
                                </>
                            ) : (
                                <>
                                    <span>🎨</span> Generate Free Visual
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column: Output / Preview Canvas */}
                    <div className="lg:col-span-5 flex flex-col">
                        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                            Canvas Output
                        </label>
                        <div className="flex-1 min-h-[300px] sm:min-h-[340px] border border-slate-200 dark:border-[#1d2537] rounded-xl bg-slate-50/50 dark:bg-[#070a12]/50 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
                            {loading ? (
                                <div className="space-y-3">
                                    <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                                    <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold animate-pulse">
                                        Synthesizing latent diffusion...
                                    </p>
                                </div>
                            ) : imageUrl ? (
                                <div className="w-full flex flex-col items-center gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imageUrl}
                                        alt={prompt}
                                        className="max-h-[360px] w-full object-contain rounded-lg shadow-lg border border-[#1d2537]"
                                    />
                                    <div className="flex w-full sm:w-auto justify-center">
                                        <a
                                            href={imageUrl}
                                            download={`nexus-${Date.now()}.jpg`}
                                            className="w-full sm:w-auto text-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-lg text-xs font-mono font-bold shadow-md hover:opacity-90 transition cursor-pointer"
                                        >
                                            Download Visual ⤓
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#121927] border border-slate-200 dark:border-[#232e47] text-cyan-600 dark:text-cyan-400 text-2xl flex items-center justify-center mb-3 shadow-inner">
                                        ✨
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                                        No Visual Rendered Yet
                                    </p>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 max-w-xs">
                                        Enter your prompt and trigger the generative synthesis engine.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}