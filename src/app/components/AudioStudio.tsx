"use client";

import React, { useState, useRef, useEffect } from "react";
import { useToast } from "./Toast";

export default function AudioStudio() {
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("hi-IN-MadhurNeural");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Background Music (BGM) States
  const [bgmUrl, setBgmUrl] = useState<string | null>(null);
  const [bgmBlob, setBgmBlob] = useState<Blob | null>(null);
  const [bgmFileName, setBgmFileName] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState<number>(0.15);
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);
  const [isDraggingBgm, setIsDraggingBgm] = useState<boolean>(false);
  const [isBgmSoloPlaying, setIsBgmSoloPlaying] = useState<boolean>(false);
  const [bgmCurrentTime, setBgmCurrentTime] = useState<number>(0);
  const [bgmDuration, setBgmDuration] = useState<number>(0);

  // References
  const audioRef = useRef<any>(null);
  const bgmRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const bgmInputRef = useRef<HTMLInputElement | null>(null);
  const outputSectionRef = useRef<HTMLDivElement | null>(null);

  const isHindiScript = /[\u0900-\u097F]/.test(text);

  useEffect(() => {
    if (isHindiScript && !voice.startsWith("hi-IN")) {
      setVoice("hi-IN-MadhurNeural");
    }
  }, [isHindiScript, voice]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = speechVolume;
    }
  }, [speechVolume]);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = bgmVolume;
    }
  }, [bgmVolume]);

  const voiceCatalog = [
    { id: "hi-IN-MadhurNeural", name: "Madhur", lang: "Hindi", gender: "Male", badge: "Flagship" },
    { id: "hi-IN-SwaraNeural", name: "Swara", lang: "Hindi", gender: "Female", badge: "Popular" },
    { id: "en-IN-PrabhatNeural", name: "Prabhat", lang: "IN-English", gender: "Male", badge: "EN-IN" },
    { id: "en-IN-NeerjaNeural", name: "Neerja", lang: "IN-English", gender: "Female", badge: "EN-IN" },
    { id: "en-US-GuyNeural", name: "Guy", lang: "US-English", gender: "Male", badge: "Global" },
    { id: "en-US-JennyNeural", name: "Jenny", lang: "US-English", gender: "Female", badge: "Global" },
  ];

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const toggleMasterPlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (bgmRef.current) bgmRef.current.pause();
      setIsPlaying(false);
      setIsBgmSoloPlaying(false);
    } else {
      audioRef.current.play();
      if (bgmRef.current) {
        bgmRef.current.playbackRate = 1.0;
        bgmRef.current.play();
        setIsBgmSoloPlaying(true);
      }
      setIsPlaying(true);
    }
  };

  const stopMasterAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      setBgmCurrentTime(0);
    }
    setIsPlaying(false);
    setIsBgmSoloPlaying(false);
    setCurrentTime(0);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleMasterSeek = (e: any) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleBgmFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      showToast("Please upload a valid audio file (.mp3, .wav, etc.)", "warning");
      return;
    }
    setBgmBlob(file);
    const url = URL.createObjectURL(file);
    setBgmUrl(url);
    setBgmFileName(file.name);
    setBgmCurrentTime(0);
    showToast(`Background track loaded: ${file.name}`, "info");
  };

  const handleBgmDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBgm(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBgmFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveBgm = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
    setBgmBlob(null);
    setBgmUrl(null);
    setBgmFileName(null);
    setBgmCurrentTime(0);
    setBgmDuration(0);
    setIsBgmSoloPlaying(false);
    if (bgmInputRef.current) {
      bgmInputRef.current.value = "";
    }
    showToast("Background audio track removed.", "info");
  };

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      showToast("Please enter your script before rendering.", "warning");
      return;
    }

    stopMasterAudio();
    setIsAudioLoading(true);

    // Smooth scroll to output deck on mobile
    if (window.innerWidth < 1024 && outputSectionRef.current) {
      outputSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/text-to-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Audio synthesis failed on server.");

      const blob = await res.blob();
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      showToast("Neural voiceover synthesized successfully!", "success");

      // Auto scroll to audio master deck
      if (window.innerWidth < 1024 && outputSectionRef.current) {
        outputSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Audio synthesis canceled.");
      } else {
        showToast("Audio synthesis failed: " + err.message, "error");
      }
    } finally {
      setIsAudioLoading(false);
      abortControllerRef.current = null;
    }
  };

  const bufferToWave = (abuffer: AudioBuffer, len: number) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
      out.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      out.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (offset < len) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: "audio/wav" });
  };

  const handleExportTrack = async () => {
    if (!audioBlob) {
      showToast("Please generate audio first before exporting.", "warning");
      return;
    }

    if (!bgmBlob) {
      const anchor = document.createElement("a");
      anchor.href = audioUrl!;
      anchor.download = "master-speech-track.mp3";
      anchor.click();
      showToast("Voice track download initiated!", "info");
      return;
    }

    setIsExporting(true);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const voiceArrayBuffer = await audioBlob.arrayBuffer();
      const voiceBuffer = await audioCtx.decodeAudioData(voiceArrayBuffer);

      const bgmArrayBuffer = await bgmBlob.arrayBuffer();
      const bgmDecodedBuffer = await audioCtx.decodeAudioData(bgmArrayBuffer);

      const renderDuration = voiceBuffer.duration;
      const sampleRate = voiceBuffer.sampleRate;

      const offlineCtx = new OfflineAudioContext(2, sampleRate * renderDuration, sampleRate);

      const voiceSource = offlineCtx.createBufferSource();
      voiceSource.buffer = voiceBuffer;
      const voiceGainNode = offlineCtx.createGain();
      voiceGainNode.gain.value = speechVolume;
      voiceSource.connect(voiceGainNode);
      voiceGainNode.connect(offlineCtx.destination);

      const bgmSource = offlineCtx.createBufferSource();
      bgmSource.buffer = bgmDecodedBuffer;
      bgmSource.loop = true;
      const bgmGainNode = offlineCtx.createGain();
      bgmGainNode.gain.value = bgmVolume;
      bgmSource.connect(bgmGainNode);
      bgmGainNode.connect(offlineCtx.destination);

      voiceSource.start(0);
      bgmSource.start(0, bgmCurrentTime);

      const renderedBuffer = await offlineCtx.startRendering();
      const mixedBlob = bufferToWave(renderedBuffer, renderedBuffer.length);

      const downloadUrl = URL.createObjectURL(mixedBlob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "master-mixed-track.wav";
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
      showToast("Master multi-track mix exported successfully!", "success");
    } catch (err: any) {
      console.error("Audio mixing error:", err);
      showToast("Failed to mix tracks: " + err.message, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            if (bgmRef.current) {
              bgmRef.current.pause();
              setIsBgmSoloPlaying(false);
            }
            setCurrentTime(0);
          }}
        />
      )}

      {bgmUrl && (
        <audio
          ref={bgmRef}
          src={bgmUrl}
          loop
          onLoadedMetadata={() => {
            if (bgmRef.current) {
              setBgmDuration(bgmRef.current.duration || 0);
            }
          }}
          onTimeUpdate={() => {
            if (bgmRef.current) {
              setBgmCurrentTime(bgmRef.current.currentTime);
            }
          }}
          onEnded={() => setIsBgmSoloPlaying(false)}
        />
      )}

      <div className="bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1d2537] rounded-xl p-3.5 sm:p-6 md:p-8 shadow-sm dark:shadow-2xl space-y-5 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1d2537] pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Neural Audio & Voice Studio
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VOICE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Synthesize studio-grade neural voiceovers with synchronized multi-track scoring.
            </p>
          </div>

          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 dark:bg-[#0d2229] border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 shrink-0">
            Neural-TTS v2
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
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  {text.length > 0 ? `${text.length} Chars` : "Free Synthesis"}
                </span>
              </label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 dark:bg-[#090c14] dark:border-[#1b2334] dark:text-slate-100 dark:placeholder-slate-600 transition leading-relaxed resize-none font-mono"
              />
            </div>

            {/* Voice Actor Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Voice Persona</span>
                {isHindiScript && (
                  <span className="text-[10px] text-amber-500 dark:text-amber-400 font-mono">
                    Hindi Script Auto-locked
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {voiceCatalog.map((v) => {
                  const isOptionDisabled = isHindiScript && !v.id.startsWith("hi-IN");
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isOptionDisabled}
                      onClick={() => setVoice(v.id)}
                      className={`py-1.5 px-2 text-[11px] sm:text-xs rounded-md border transition text-center cursor-pointer min-w-0 ${
                        voice === v.id
                          ? "bg-cyan-600 border-cyan-400 text-white shadow-sm"
                          : isOptionDisabled
                          ? "opacity-30 cursor-not-allowed bg-slate-100 dark:bg-[#0a0e18] border-slate-200 dark:border-[#161f30] text-slate-400"
                          : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#111726] dark:border-[#1e273a] dark:text-slate-400 dark:hover:text-white"
                      }`}
                      title={`${v.name} (${v.lang}) - ${v.gender}`}
                    >
                      <div className="flex flex-col items-center justify-center leading-tight">
                        <span className="font-bold text-[11px] sm:text-xs truncate max-w-full">
                          {v.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] opacity-75 font-mono truncate max-w-full">
                          {v.lang} ({v.gender === "Male" ? "M" : "F"})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playback Tempo */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Playback Tempo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: 0.75, label: "0.75x" },
                  { val: 1.0, label: "1.0x" },
                  { val: 1.25, label: "1.25x" },
                  { val: 1.5, label: "1.5x" },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => handleSpeedChange(s.val)}
                    className={`py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-md border transition text-center truncate cursor-pointer ${
                      playbackSpeed === s.val
                        ? "bg-cyan-600 border-cyan-400 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#111726] dark:border-[#1e273a] dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Soundtrack (Layer 2) */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Background Track (Layer 2)</span>
                {bgmFileName && (
                  <button
                    type="button"
                    onClick={handleRemoveBgm}
                    className="text-[10px] text-rose-500 hover:text-rose-400 font-mono cursor-pointer"
                  >
                    Remove ✕
                  </button>
                )}
              </label>
              <input
                ref={bgmInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleBgmFile(e.target.files[0]);
                  }
                }}
              />
              <div
                onClick={() => bgmInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingBgm(true);
                }}
                onDragLeave={() => setIsDraggingBgm(false)}
                onDrop={handleBgmDrop}
                className={`p-2.5 rounded-lg border border-dashed cursor-pointer transition flex items-center justify-between gap-2 text-xs font-mono min-w-0 ${
                  bgmFileName
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#111726] dark:border-[#1e273a] dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <span className="shrink-0">{bgmFileName ? "🎵" : "📂"}</span>
                  <span className="truncate">
                    {bgmFileName ? bgmFileName : "Add optional background music (.mp3, .wav)..."}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 shrink-0 font-bold">
                  {bgmFileName ? "Replace" : "Browse"}
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateAudio}
              disabled={isAudioLoading || !text.trim()}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-98 text-white text-xs font-bold font-mono tracking-wider uppercase rounded-xl shadow-md shadow-cyan-900/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAudioLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synthesizing Voiceover...
                </>
              ) : (
                <>
                  <span>⚡</span> Generate Free Voiceover
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output / Audio Master Deck */}
          <div ref={outputSectionRef} className="lg:col-span-5 flex flex-col">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Canvas Output
            </label>
            <div className="flex-1 min-h-[300px] sm:min-h-[340px] border border-slate-200 dark:border-[#1d2537] rounded-xl bg-slate-50/50 dark:bg-[#070a12]/50 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
              {isAudioLoading ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold animate-pulse">
                    Synthesizing neural speech...
                  </p>
                </div>
              ) : audioUrl ? (
                <div className="w-full flex flex-col items-center gap-3">
                  {/* Visualizer Waveform */}
                  <div className="w-full h-16 bg-slate-100 dark:bg-[#080b12] border border-slate-200 dark:border-[#1b2335] rounded-lg flex items-center justify-center p-2">
                    <div className="flex items-end gap-1 h-10 w-full justify-center">
                      {[30, 60, 25, 80, 90, 40, 65, 95, 55, 30, 70, 85, 45, 60, 75, 40, 85, 25].map(
                        (h, idx) => (
                          <div
                            key={idx}
                            style={{ height: isPlaying ? `${h}%` : "15%" }}
                            className={`w-1.5 rounded-full transition-all duration-150 ${
                              isPlaying
                                ? "bg-gradient-to-t from-cyan-500 to-indigo-500 shadow-sm shadow-cyan-500/30"
                                : "bg-slate-300 dark:bg-[#182030]"
                            }`}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Scrubber */}
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span>Voice Progress</span>
                      <span>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.05"
                      value={currentTime}
                      onChange={handleMasterSeek}
                      className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-[#1a2336] rounded-sm appearance-none"
                    />
                  </div>

                  {/* Volume Mixers */}
                  <div className="w-full grid grid-cols-2 gap-2 bg-slate-100/70 dark:bg-[#090c14] border border-slate-200 dark:border-[#1a2233] p-2.5 rounded-lg text-left">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-600 dark:text-slate-400">🎙 Voice</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                          {Math.round(speechVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={speechVolume}
                        onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer h-1 bg-slate-200 dark:bg-[#1e2638] rounded-sm appearance-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-600 dark:text-slate-400">🎵 BGM</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {bgmUrl ? `${Math.round(bgmVolume * 100)}%` : "Off"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        disabled={!bgmUrl}
                        value={bgmVolume}
                        onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 dark:accent-indigo-400 cursor-pointer h-1 bg-slate-200 dark:bg-[#1e2638] rounded-sm appearance-none disabled:opacity-30"
                      />
                    </div>
                  </div>

                  {/* Play Controls & Download */}
                  <div className="w-full flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleMasterPlay}
                        className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer shrink-0"
                      >
                        {isPlaying ? "❚❚" : "▶"}
                      </button>
                      <button
                        type="button"
                        onClick={stopMasterAudio}
                        className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 dark:bg-[#151b28] dark:hover:bg-[#20293d] dark:border-[#27334d] dark:text-slate-300 flex items-center justify-center text-xs transition cursor-pointer shrink-0"
                        title="Stop"
                      >
                        ◼
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportTrack}
                      disabled={isExporting}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-bold rounded-lg shadow-md transition cursor-pointer text-center truncate"
                    >
                      {isExporting ? "Mixing..." : "Download Audio ⤓"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#121927] border border-slate-200 dark:border-[#232e47] text-cyan-600 dark:text-cyan-400 text-2xl flex items-center justify-center mb-3 shadow-inner">
                    🎙️
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                    No Audio Rendered Yet
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 max-w-xs">
                    Enter your prompt and trigger the voiceover synthesis engine.
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