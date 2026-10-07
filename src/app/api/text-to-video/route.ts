import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

export async function POST(req: Request) {
  try {
    const { prompt, ratio } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN?.trim();
    if (!hfToken) {
      return NextResponse.json(
        { error: "HF_TOKEN missing in environment variables" },
        { status: 500 }
      );
    }

    const hf = new HfInference(hfToken);

    let width = 1024;
    let height = 576; // 16:9 cinema default

    if (ratio === "9:16") {
      width = 576;
      height = 1024;
    } else if (ratio === "1:1") {
      width = 1024;
      height = 1024;
    }

    const enhancedPrompt = `${prompt}, cinematic video keyframe, 8k resolution, photorealistic, sharp focus, filmic lighting`;

    const response = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: enhancedPrompt,
      parameters: { width, height },
    });

    let buffer: Buffer;

    if (typeof response === "string") {
      const base64Data = response.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    } else {
      const blob = response as Blob;
      const arrayBuffer = await blob.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Uint8Array satisfies Web API BodyInit
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Frame synthesis error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate video frame" },
      { status: 500 }
    );
  }
}