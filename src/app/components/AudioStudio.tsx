"use client";

import React, { useState, useRef, useEffect } from "react";

export default function AudioStudio() {
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
  const playerSectionRef = useRef<HTMLDivElement | null>(null);
  const bgmInputRef = useRef<HTMLInputElement | null>(null);

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
    { id: "hi-IN-MadhurNeural", label: "Madhur (Hindi)", gender: "Male", badge: "Flagship" },
    { id: "hi-IN-SwaraNeural", label: "Swara (Hindi)", gender: "Female", badge: "Popular" },
    { id: "en-IN-PrabhatNeural", label: "Prabhat (Indian English)", gender: "Male", badge: "EN-IN" },
    { id: "en-IN-NeerjaNeural", label: "Neerja (Indian English)", gender: "Female", badge: "EN-IN" },
    { id: "en-US-GuyNeural", label: "Guy (US Global)", gender: "Male", badge: "Global" },
    { id: "en-US-JennyNeural", label: "Jenny (US Global)", gender: "Female", badge: "Global" },
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

  const toggleBgmSoloPlay = () => {
    if (!bgmRef.current || !bgmUrl) return;

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    if (isBgmSoloPlaying) {
      bgmRef.current.pause();
      setIsBgmSoloPlaying(false);
    } else {
      bgmRef.current.playbackRate = 1.0;
      bgmRef.current.play();
      setIsBgmSoloPlaying(true);
    }
  };

  const stopBgmSolo = () => {
    if (!bgmRef.current) return;
    bgmRef.current.pause();
    bgmRef.current.currentTime = 0;
    setBgmCurrentTime(0);
    setIsBgmSoloPlaying(false);
  };

  const handleBgmSeek = (e: any) => {
    const time = parseFloat(e.target.value);
    setBgmCurrentTime(time);
    if (bgmRef.current) {
      bgmRef.current.currentTime = time;
    }
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
      return alert("Please upload a valid audio file (.mp3, .wav, etc.)");
    }
    stopBgmSolo();
    setBgmBlob(file);
    const url = URL.createObjectURL(file);
    setBgmUrl(url);
    setBgmFileName(file.name);
    setBgmCurrentTime(0);
  };

  const handleBgmDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBgm(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBgmFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveBgm = () => {
    stopBgmSolo();
    setBgmBlob(null);
    setBgmUrl(null);
    setBgmFileName(null);
    setBgmCurrentTime(0);
    setBgmDuration(0);
    if (bgmInputRef.current) {
      bgmInputRef.current.value = "";
    }
  };

  const handleGenerateAudio = async () => {
    if (!text.trim()) return alert("Please enter your script before rendering.");

    stopMasterAudio();
    setIsAudioLoading(true);

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

      setTimeout(() => {
        playerSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Audio synthesis canceled.");
      } else {
        alert("Synthesis failed: " + err.message);
      }
    } finally {
      setIsAudioLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAudioLoading(false);
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
    if (!audioBlob) return alert("Please generate audio first.");

    if (!bgmBlob) {
      const anchor = document.createElement("a");
      anchor.href = audioUrl!;
      anchor.download = "master-speech-track.mp3";
      anchor.click();
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
    } catch (err: any) {
      console.error("Audio mixing error:", err);
      alert("Failed to mix tracks: " + err.message);
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
    <div className="max-w-6xl mx-auto space-y-8">
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

      {/* SCRIPT COMPOSER */}
      <div className="bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1d2537] rounded-xl p-4 sm:p-6 md:p-8 shadow-sm dark:shadow-2xl space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1a2233] pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
              Speech Script Composer
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compose, pace, and shape your voiceover sequence.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono text-cyan-700 bg-cyan-50 border border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/60 dark:border-cyan-800/40 px-3 py-1 rounded-full">
            {text.length} characters
          </span>
        </div>

        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write or paste your script here..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 dark:bg-[#090c14] dark:border-[#1b2334] dark:text-slate-100 dark:placeholder-slate-600 transition leading-relaxed resize-none font-mono"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            <span>Output Format:</span>
            <span className="font-mono text-slate-700 bg-slate-100 dark:bg-[#161d2d] dark:text-white px-2 py-0.5 rounded border border-slate-200 dark:border-[#232e47]">
              MP3 24kHz @ 48kbps
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-200 hover:border-cyan-500/50 text-slate-800 text-xs font-semibold rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 pr-8 focus:outline-none focus:border-cyan-400 dark:bg-[#141a27] dark:border-[#252f44] dark:text-slate-200 transition cursor-pointer appearance-none shadow-sm"
              >
                {voiceCatalog.map((v) => {
                  const isOptionDisabled = isHindiScript && !v.id.startsWith("hi-IN");

                  return (
                    <option
                      key={v.id}
                      value={v.id}
                      disabled={isOptionDisabled}
                      className={`bg-white dark:bg-[#0f1420] py-1.5 ${
                        isOptionDisabled ? "text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-[#0a0d14]" : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {v.label} • {v.gender} {isOptionDisabled ? "(Hindi Not Supported)" : `(${v.badge})`}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {!isAudioLoading ? (
              <button
                onClick={handleGenerateAudio}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-cyan-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>Generate Voiceover</span>
              </button>
            ) : (
              <button
                onClick={handleCancelGeneration}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-rose-600/30 animate-pulse transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>✕</span>
                <span>Abort Rendering</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DUAL DECK: AUDIO MONITORING (70%) + BGM DECK (30%) */}
      <div ref={playerSectionRef}>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* AUDIO MONITORING DECK (70%) */}
          <div
            className={`lg:col-span-7 bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1f283c] rounded-xl p-4 sm:p-6 md:p-7 shadow-sm dark:shadow-2xl space-y-4 sm:space-y-5 transition-all duration-300 ${
              audioUrl && !isAudioLoading
                ? "opacity-100 ring-1 ring-cyan-500/30"
                : "opacity-40 pointer-events-none"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1c2538] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                  Master Synthesized Console
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Audio Monitoring & Mixer Deck
                </h3>
              </div>
              <span className="self-start sm:self-auto text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200 dark:text-slate-400 dark:bg-[#161d2d] px-3 py-1 rounded-full dark:border-[#232e47]">
                {audioUrl ? "Render Complete" : "Standby"}
              </span>
            </div>

            <div className="h-20 sm:h-24 bg-slate-50 border border-slate-200 dark:bg-[#080b12] dark:border-[#1b2335] rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden">
              <div className="flex items-end gap-1 sm:gap-1.5 h-12 sm:h-14 w-full justify-center">
                {[30, 60, 25, 80, 90, 40, 65, 95, 55, 30, 70, 85, 45, 60, 75, 40, 85, 25].map(
                  (h, idx) => (
                    <div
                      key={idx}
                      style={{ height: isPlaying ? `${h}%` : "12%" }}
                      className={`w-1.5 sm:w-2 rounded-full transition-all duration-150 ${
                        isPlaying
                          ? "bg-gradient-to-t from-cyan-500 to-indigo-500 shadow-md shadow-cyan-500/30"
                          : "bg-slate-200 dark:bg-[#182030]"
                      }`}
                    />
                  )
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-full px-2">
                Stereo Output • {bgmFileName ? "Voice + BGM Synced" : "Voice Master"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>Voice Progress</span>
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.05"
                value={currentTime}
                onChange={handleMasterSeek}
                className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer h-2 bg-slate-200 dark:bg-[#1a2336] rounded-sm appearance-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 border border-slate-200 dark:bg-[#090c14] dark:border-[#1a2233] p-3 sm:p-3.5 rounded-xl">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">🎙 Voiceover Gain</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">
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
                  className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-[#1e2638] rounded-sm appearance-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">🎵 BGM Soundtrack Gain</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {bgmUrl ? `${Math.round(bgmVolume * 100)}%` : "Inactive"}
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
                  className="w-full accent-indigo-500 dark:accent-indigo-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-[#1e2638] rounded-sm appearance-none disabled:opacity-30"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <button
                  onClick={toggleMasterPlay}
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-lg sm:text-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 active:scale-95 transition cursor-pointer shrink-0"
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
                <button
                  onClick={stopMasterAudio}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 dark:bg-[#151b28] dark:hover:bg-[#20293d] dark:border-[#27334d] dark:text-slate-300 flex items-center justify-center text-xs transition cursor-pointer shrink-0"
                  title="Stop & Reset"
                >
                  ◼
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 dark:bg-[#090c14] p-1 rounded-lg dark:border-[#1c2438] overflow-x-auto max-w-full">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 px-2 uppercase shrink-0">
                  Speed
                </span>
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-md transition cursor-pointer shrink-0 ${
                      playbackSpeed === speed
                        ? "bg-cyan-500 text-black shadow"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleExportTrack}
                disabled={isExporting}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>⬇</span>
                <span>{isExporting ? "Mixing & Exporting..." : "Export Track"}</span>
              </button>
            </div>
          </div>

          {/* BACKGROUND SOUNDTRACK DECK (30%) */}
          <div className="lg:col-span-3 bg-white dark:bg-[#0f1420] border border-slate-200 dark:border-[#1f283c] rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1c2538] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Layer 2 Audio
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Background Soundtrack Deck
                  </h4>
                </div>
                {bgmFileName && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => bgmInputRef.current?.click()}
                      className="text-[10px] text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 font-mono transition cursor-pointer"
                    >
                      Re-upload
                    </button>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <button
                      onClick={handleRemoveBgm}
                      className="text-[10px] text-rose-500 hover:text-rose-400 dark:text-rose-400 dark:hover:text-rose-300 font-mono transition cursor-pointer"
                    >
                      Remove ✕
                    </button>
                  </div>
                )}
              </div>

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
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingBgm(true);
                }}
                onDragLeave={() => setIsDraggingBgm(false)}
                onDrop={handleBgmDrop}
                onClick={() => bgmInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDraggingBgm
                    ? "border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/20"
                    : bgmFileName
                    ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-[#0a121c]"
                    : "border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-[#20293a] dark:bg-[#090c14] dark:hover:border-[#2f3d57]"
                }`}
              >
                {bgmFileName ? (
                  <div className="space-y-1">
                    <span className="text-emerald-500 dark:text-emerald-400 text-xl block">🎵</span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate px-1">
                      {bgmFileName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Active track loaded • Click to replace
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 py-1">
                    <span className="text-2xl block">📂</span>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Drag & Drop audio or <span className="text-indigo-600 dark:text-indigo-400">Browse</span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      MP3, WAV, AAC files
                    </div>
                  </div>
                )}
              </div>
            </div>

            {bgmUrl ? (
              <div className="space-y-3 bg-slate-50 border border-slate-200 dark:bg-[#090c14] dark:border-[#1a2233] p-3.5 rounded-xl mt-auto">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isBgmSoloPlaying ? "bg-indigo-500 dark:bg-indigo-400 animate-pulse" : "bg-slate-400 dark:bg-slate-500"
                      }`}
                    ></span>
                    BGM Player
                  </span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {formatTime(bgmCurrentTime)} / {formatTime(bgmDuration)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={bgmDuration || 100}
                  step="0.5"
                  value={bgmCurrentTime}
                  onChange={handleBgmSeek}
                  className="w-full accent-indigo-500 dark:accent-indigo-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-[#1e2638] rounded-sm appearance-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleBgmSoloPlay}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <span>{isBgmSoloPlaying ? "❚❚" : "▶"}</span>
                      <span>{isBgmSoloPlaying ? "Pause" : "Play"}</span>
                    </button>

                    <button
                      onClick={stopBgmSolo}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 dark:bg-[#151b28] dark:hover:bg-[#20293d] dark:border-[#27334d] dark:text-slate-300 rounded-lg text-xs transition cursor-pointer"
                      title="Stop & Reset Track"
                    >
                      ◼
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    Cue Point
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 dark:bg-[#090c14] dark:border-[#1a2233] rounded-xl text-center text-[11px] text-slate-400 dark:text-slate-500">
                Upload a soundtrack to unlock independent audition & cue scrubbing.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}