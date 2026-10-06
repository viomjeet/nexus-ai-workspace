import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { prompt, ratio } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "Prompt is required to synthesize video frames." },
        { status: 400 }
      );
    }

    let width = 1280;
    let height = 720;
    if (ratio === "9:16") {
      width = 720;
      height = 1280;
    } else if (ratio === "1:1") {
      width = 1024;
      height = 1024;
    }

    const cleanPrompt = encodeURIComponent(
      `${prompt.trim()}, cinematic film still, detailed studio setting, 8k resolution, photorealistic`
    );
    const seed = Math.floor(Math.random() * 900000) + 100000;
    const params = `width=${width}&height=${height}&seed=${seed}&nologo=true`;

    // Key hai to new unified API, warna legacy anonymous endpoint (throttled)
    const apiKey = process.env.POLLINATIONS_API_KEY;
    const targetUrl = apiKey
      ? `https://gen.pollinations.ai/image/${cleanPrompt}?${params}&key=${apiKey}`
      : `https://image.pollinations.ai/prompt/${cleanPrompt}?${params}`;

    const imageRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(55000),
    });

    const contentType = imageRes.headers.get("content-type") || "";

    // Status OK ho ya na ho, image na aaye to asli error dikhao
    if (!imageRes.ok || !contentType.startsWith("image/")) {
      const detail = await imageRes.text().catch(() => "");
      throw new Error(`Upstream ${imageRes.status}: ${detail.slice(0, 200)}`);
    }

    const buffer = Buffer.from(await imageRes.arrayBuffer());

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Video Server Proxy Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate video sequence." },
      { status: 500 }
    );
  }
}