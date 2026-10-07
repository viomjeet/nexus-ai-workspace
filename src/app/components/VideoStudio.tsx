"use client";

import React, { useState, useRef } from "react";

export default function VideoStudio() {
  const [ratio, setRatio] = useState("16:9");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [motionStyle, setMotionStyle] = useState("Slow Zoom");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return alert("Please enter a scene prompt.");

    setIsVideoLoading(true);
    setVideoUrl(null);
    setRenderProgress(10);

    try {
      // 1. Fetch through local server proxy
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

      // 2. Load into Image object locally
      const img = new Image();
      img.src = localImageUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error("Unable to decode visual buffer."));
      });

      setRenderProgress(60);

      // 3. Setup canvas & MediaRecorder
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

      const stream = canvas.captureStream(30);
      const recordedChunks: Blob[] = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
        videoBitsPerSecond: 5_000_000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      // onstop PEHLE set karo (start/stop se pehle) taaki race na ho
      const recordingDone = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () =>
          resolve(new Blob(recordedChunks, { type: "video/webm" }));
      });

      const durationMs = videoDuration * 1000;
      mediaRecorder.start();
      const startTime = performance.now();

      // Time-based loop: monitor refresh rate se duration nahi badlega
      await new Promise<void>((resolve) => {
        const renderLoop = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / durationMs, 1);

          let scale = 1.0;
          let dx = 0;
          let dy = 0;

          if (motionStyle === "Slow Zoom") {
            scale = 1.0 + progress * 0.18;
          } else if (motionStyle === "Pan Left") {
            scale = 1.1;
            dx = (progress - 0.5) * (canvas.width * 0.08);
          } else if (motionStyle === "Cinematic Crane") {
            scale = 1.05 + Math.sin(progress * Math.PI) * 0.08;
            dy = (progress - 0.5) * (canvas.height * 0.06);
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.translate(canvas.width / 2 + dx, canvas.height / 2 + dy);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
          ctx.restore();

          setRenderProgress(60 + Math.round(progress * 35));

          if (progress >= 1) {
            mediaRecorder.stop();
            resolve();
            return;
          }
          requestAnimationFrame(renderLoop);
        };

        renderLoop();
      });

      // 4. Create final video blob
      const finalBlob = await recordingDone;
      setVideoUrl(URL.createObjectURL(finalBlob));
      URL.revokeObjectURL(localImageUrl);

      setRenderProgress(100);
    } catch (err: any) {
      alert("Error generating video: " + err.message);
    } finally {
      setIsVideoLoading(false);
      setRenderProgress(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1d2537] rounded-xl p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-2xl space-y-5 sm:space-y-6">
        <div className="border-b border-slate-200 dark:border-[#1a2233] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-wide">
              AI Video & Motion Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Synthesize cinematic camera motions, pans, and video scenes from prompts.
            </p>
            <span className="text-amber-500/90 dark:text-amber-400/90 font-mono font-normal text-[11px] sm:text-xs italic block mt-0.5">
              (Core generation pipeline is currently under active development)
            </span>
          </div>
          <span className="self-start sm:self-auto text-[10px] sm:text-xs font-mono text-cyan-700 bg-cyan-50 border border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/60 dark:border-cyan-800/40 px-2.5 sm:px-3 py-1 rounded-full shrink-0">
            Proxy Engine Active
          </span>
        </div>

        {/* Prompt Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-mono">
            Video Scene Prompt
          </label>
          <textarea
            rows={4}
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="Describe your scene in detail: e.g. An Indian sound director mixing in a 1990s Mumbai analog recording studio, cassette tapes, warm sunset window light..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 dark:bg-[#090c14] dark:border-[#1b2334] dark:text-slate-100 dark:placeholder-slate-600 dark:focus:border-cyan-500/80 transition resize-none font-mono"
          />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-1 sm:pt-2">
          <div className="bg-slate-50 border border-slate-200 dark:bg-[#090c14] dark:border-[#1b2334] p-3 sm:p-3.5 rounded-lg space-y-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-700 dark:text-slate-400 block font-mono">
              Aspect Ratio
            </span>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { id: "16:9", label: "16:9 Cinema" },
                { id: "9:16", label: "9:16 Shorts" },
                { id: "1:1", label: "1:1 Square" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRatio(r.id)}
                  className={`py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-md border transition text-center truncate cursor-pointer ${
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

          <div className="bg-slate-50 border border-slate-200 dark:bg-[#090c14] dark:border-[#1b2334] p-3 sm:p-3.5 rounded-lg space-y-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-700 dark:text-slate-400 block font-mono">
              Clip Duration
            </span>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { sec: 5, label: "5s" },
                { sec: 10, label: "10s" },
                { sec: 15, label: "15s" },
              ].map((d) => (
                <button
                  key={d.sec}
                  type="button"
                  onClick={() => setVideoDuration(d.sec)}
                  className={`py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-md border transition text-center cursor-pointer ${
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

          <div className="bg-slate-50 border border-slate-200 dark:bg-[#090c14] dark:border-[#1b2334] p-3 sm:p-3.5 rounded-lg space-y-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-700 dark:text-slate-400 block font-mono">
              Camera Motion
            </span>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {["Slow Zoom", "Pan Left", "Cinematic Crane"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMotionStyle(m)}
                  className={`py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-md border transition text-center truncate cursor-pointer ${
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
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerateVideo}
            disabled={isVideoLoading}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg transition cursor-pointer text-center"
          >
            {isVideoLoading
              ? `Rendering Video Frames (${renderProgress}%)...`
              : "Generate AI Video"}
          </button>
        </div>

        {/* Video Player */}
        {videoUrl && (
          <div className="mt-8 border-t border-slate-200 dark:border-[#1a2336] pt-6 flex flex-col items-center w-full">
            <div
              className={`rounded-lg border border-slate-200 dark:border-[#232e46] overflow-hidden bg-black shadow-2xl w-full ${
                ratio === "9:16" ? "max-w-[320px]" : "max-w-2xl"
              }`}
            >
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="mt-4 flex w-full sm:w-auto justify-center">
              <a
                href={videoUrl}
                download="ai-generated-scene.webm"
                className="w-full sm:w-auto text-center px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-xs rounded-lg shadow transition cursor-pointer"
              >
                Download Master Video (.WEBM) ⬇
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}