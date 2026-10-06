import { NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

const SUPPORTED_VOICES = [
  "hi-IN-MadhurNeural",
  "hi-IN-SwaraNeural",
  "en-IN-PrabhatNeural",
  "en-IN-NeerjaNeural",
  "en-US-GuyNeural",
  "en-US-JennyNeural",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Text is required and cannot be empty." },
        { status: 400 }
      );
    }

    const selectedVoice = SUPPORTED_VOICES.includes(voice)
      ? voice
      : "hi-IN-MadhurNeural";

    let tts = new EdgeTTS(text.trim(), selectedVoice);
    let result;

    try {
      result = await tts.synthesize();
    } catch (primaryError) {
      console.warn("Primary voice synthesis failed, falling back to Madhur:", primaryError);
      // Fallback to guarantee no 500 error
      tts = new EdgeTTS(text.trim(), "hi-IN-MadhurNeural");
      result = await tts.synthesize();
    }

    if (!result || !result.audio) {
      throw new Error("TTS engine did not return valid audio.");
    }

    const arrayBuffer = await result.audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="generated-voice.mp3"',
      },
    });
  } catch (error: any) {
    console.error("TTS Synthesis Error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate audio." },
      { status: 500 }
    );
  }
}