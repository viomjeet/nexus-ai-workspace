import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

export async function POST(req: Request) {
  try {
    const { prompt, stylePreset } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const hfToken = process.env.HF_TOKEN?.trim();
    if (!hfToken) {
      return NextResponse.json(
        { error: "HF_TOKEN missing in .env.local" },
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

    // Official free fast FLUX model via SDK
    const response = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: enhancedPrompt,
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