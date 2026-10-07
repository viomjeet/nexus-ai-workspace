import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

export async function POST(req: Request) {
  try {
    const { prompt, stylePreset, aspectRatio } = await req.json();

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

    let enhancedPrompt = prompt;
    if (stylePreset === "photorealistic") {
      enhancedPrompt += ", 8k, cinematic, photorealistic, masterpiece, high details";
    } else if (stylePreset === "cyberpunk") {
      enhancedPrompt += ", cyberpunk, neon glowing lighting, unreal engine 5, octane render";
    } else if (stylePreset === "anime") {
      enhancedPrompt += ", anime aesthetic, vibrant coloring, clean artstyle";
    } else if (stylePreset === "digital-art") {
      enhancedPrompt += ", digital artwork, 3d render, trending on artstation";
    }

    // Dynamic resolution based on aspectRatio
    let width = 1024;
    let height = 1024;

    if (aspectRatio === "16:9") {
      width = 1024;
      height = 576;
    } else if (aspectRatio === "9:16") {
      width = 576;
      height = 1024;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    }

    // Pass parameters explicitly to FLUX
    const response = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: enhancedPrompt,
      parameters: {
        width,
        height,
      },
    });

    let imageUrl = "";

    if (typeof response === "string") {
      imageUrl = response.startsWith("data:")
        ? response
        : `data:image/jpeg;base64,${response}`;
    } else {
      const blob = response as Blob;
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Generation failed" },
      { status: 500 }
    );
  }
}