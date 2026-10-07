"use client";

import React, { useState, useRef, useEffect } from "react";
import { useToast } from "./Toast";

export default function VideoStudio() {
  const { showToast } = useToast();
  const [ratio, setRatio] = useState("16:9");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [motionStyle, setMotionStyle] = useState("Slow Zoom");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentVideoUrlRef = useRef<string | null>(null);
  const outputSectionRef = useRef<HTMLDivElement | null>(null);

  // Clean up object URLs to prevent browser memory leaks
  useEffect(() => {
    return () => {
      if (currentVideoUrlRef.current) {
        URL.revokeObjectURL(currentVideoUrlRef.current);
      }
    };
  }, []);

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      showToast("Please enter a scene prompt first.", "warning");
      return;
    }

    setIsVideoLoading(true);
    setRenderProgress(10);

    // Smooth scroll to output canvas on mobile so user sees progress immediately
    if (window.innerWidth < 1024 && outputSectionRef.current) {
      outputSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    try {
      // 1. Fetch reference frame via server route
      const res = await fetch("/api/text-to-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: videoPrompt, ratio }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Frame generation failed on server.");
      }

      const blob = await res.blob();
      const localImageUrl = URL.createObjectURL(blob);
      setRenderProgress(40);

      // 2. Decode image element
      const img = new Image();
      img.src = localImageUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error("Unable to decode visual buffer."));
      });

      setRenderProgress(60);

      // 3. Setup canvas dimensions based on chosen aspect ratio
      const canvas = canvasRef.current || document.createElement("canvas");
      let w = 1280;
      let h = 720;
      if (ratio === "9:16") {
        w = 720;
        h = 1280;
      } else if (ratio === "1:1") {
        w = 1024;
        h = 1024;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context initialization failed.");

      // Calculate aspect ratio crop (object-fit: cover equivalent for canvas)
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let renderW = w;
      let renderH = h;

      if (imgRatio > targetRatio) {
        renderW = h * imgRatio;
      } else {
        renderH = w / imgRatio;
      }

      // Check cross-browser supported mimeTypes
      let mimeType = "video/webm";
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
      }

      const stream = canvas.captureStream(30);
      const recordedChunks: Blob[] = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6_000_000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      const recordingDone = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () =>
          resolve(new Blob(recordedChunks, { type: mimeType }));
      });

      const durationMs = videoDuration * 1000;
      mediaRecorder.start();
      const startTime = performance.now();

      // Time-based smooth render loop with ease-in-out
      await new Promise<void>((resolve) => {
        const renderLoop = () => {
          const elapsed = performance.now() - startTime;
          const rawProgress = Math.min(elapsed / durationMs, 1);

          // Ease-in-out easing function for cinematic acceleration
          const easeProgress =
            rawProgress < 0.5
              ? 2 * rawProgress * rawProgress
              : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

          let scale = 1.0;
          let dx = 0;
          let dy = 0;

          if (motionStyle === "Slow Zoom") {
            scale = 1.0 + easeProgress * 0.18;
          } else if (motionStyle === "Pan Left") {
            scale = 1.15;
            dx = (easeProgress - 0.5) * (w * 0.1);
          } else if (motionStyle === "Cinematic Crane") {
            scale = 1.08 + Math.sin(easeProgress * Math.PI) * 0.07;
            dy = (easeProgress - 0.5) * (h * 0.08);
          }

          ctx.clearRect(0, 0, w, h);
          ctx.save();
          ctx.translate(w / 2 + dx, h / 2 + dy);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
          ctx.restore();

          setRenderProgress(60 + Math.round(rawProgress * 35));

          if (rawProgress >= 1) {
            mediaRecorder.stop();
            resolve();
            return;
          }
          requestAnimationFrame(renderLoop);
        };

        renderLoop();
      });

      // 4. Finalize video blob
      const finalBlob = await recordingDone;
      URL.revokeObjectURL(localImageUrl);

      if (currentVideoUrlRef.current) {
        URL.revokeObjectURL(currentVideoUrlRef.current);
      }

      const generatedUrl = URL.createObjectURL(finalBlob);
      currentVideoUrlRef.current = generatedUrl;
      setVideoUrl(generatedUrl);
      setRenderProgress(100);
      showToast("Cinematic motion video rendered successfully!", "success");

      // Scroll to video output on mobile
      if (window.innerWidth < 1024 && outputSectionRef.current) {
        outputSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } catch (err: any) {
      showToast("Failed to render video: " + err.message, "error");
    } finally {
      setIsVideoLoading(false);
      setRenderProgress(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1d2537] rounded-xl p-3.5 sm:p-6 md:p-8 shadow-sm dark:shadow-2xl space-y-5 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1d2537] pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                AI Video & Motion Studio
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MOTION ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Synthesize cinematic camera motions, pans, and video scenes from prompts.
            </p>
          </div>

          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 dark:bg-[#0d2229] border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 shrink-0">
            Motion-Diffusion v1
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
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 dark:bg-[#090c14] dark:border-[#1b2334] dark:text-slate-100 dark:placeholder-slate-600 transition leading-relaxed resize-none font-mono"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "16:9", label: "16:9 Cinema" },
                  { id: "9:16", label: "9:16 Shorts" },
                  { id: "1:1", label: "1:1 Square" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRatio(r.id)}
                    className={`py-1.5 px-1 text-[10px] sm:text-xs font-bold rounded-md border transition text-center truncate cursor-pointer ${
                      ratio === r.id
                        ? "bg-cyan-600 border-cyan-400 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#111726] dark:border-[#1e273a] dark:text-slate-400 dark:hover:text-white"
                    }`}
                    title={r.label}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clip Duration */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Clip Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 5, label: "5s" },
                  { sec: 10, label: "10s" },
                  { sec: 15, label: "15s" },
                ].map((d) => (
                  <button
                    key={d.sec}
                    type="button"
                    onClick={() => setVideoDuration(d.sec)}
                    className={`py-1.5 px-1 text-[10px] sm:text-xs font-bold rounded-md border transition text-center cursor-pointer ${
                      videoDuration === d.sec
                        ? "bg-cyan-600 border-cyan-400 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#111726] dark:border-[#1e273a] dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Motion */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Camera Motion
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Slow Zoom", "Pan Left", "Cinematic Crane"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMotionStyle(m)}
                    className={`py-1.5 px-1 text-[10px] sm:text-xs font-bold rounded-md border transition text-center truncate cursor-pointer ${
                      motionStyle === m
                        ? "bg-cyan-600 border-cyan-400 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#111726] dark:border-[#1e273a] dark:text-slate-400 dark:hover:text-white"
                    }`}
                    title={m}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateVideo}
              disabled={isVideoLoading || !videoPrompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-98 text-white text-xs font-bold font-mono tracking-wider uppercase rounded-xl shadow-md shadow-cyan-900/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVideoLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Rendering Video Frames ({renderProgress}%)...
                </>
              ) : (
                <>
                  <span>🎬</span> Generate Free Video
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output / Video Monitor */}
          <div ref={outputSectionRef} className="lg:col-span-5 flex flex-col">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Canvas Output
            </label>
            <div className="flex-1 min-h-[300px] sm:min-h-[340px] border border-slate-200 dark:border-[#1d2537] rounded-xl bg-slate-50/50 dark:bg-[#070a12]/50 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
              {isVideoLoading ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold animate-pulse">
                    Synthesizing cinematic frames ({renderProgress}%)...
                  </p>
                </div>
              ) : videoUrl ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="rounded-lg border border-slate-200 dark:border-[#232e46] overflow-hidden bg-black shadow-lg w-full max-h-[360px] flex items-center justify-center">
                    <video
                      key={videoUrl}
                      src={videoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="max-h-[360px] w-full object-contain"
                    />
                  </div>
                  <div className="flex w-full sm:w-auto justify-center">
                    <a
                      href={videoUrl}
                      download={`nexus-motion-${ratio.replace(":", "-")}.webm`}
                      onClick={() => showToast("Downloading motion video...", "info")}
                      className="w-full sm:w-auto text-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-lg text-xs font-mono font-bold shadow-md hover:opacity-90 transition cursor-pointer"
                    >
                      Download Video ⤓
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#121927] border border-slate-200 dark:border-[#232e47] text-cyan-600 dark:text-cyan-400 text-2xl flex items-center justify-center mb-3 shadow-inner">
                    🎬
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                    No Video Rendered Yet
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 max-w-xs">
                    Enter your prompt and trigger the motion synthesis engine.
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