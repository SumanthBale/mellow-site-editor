import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { analyzeUrl, type UrlAnalysis } from "./phishing-features";

const ScanInput = z.object({ url: z.string().min(3).max(2048) });

export interface AiVerdict {
  summary: string;
  indicators: string[];
  recommendation: string;
}

export interface ScanResult extends UrlAnalysis {
  ai: AiVerdict | null;
  aiError: string | null;
}

export const scanUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ScanInput.parse(input))
  .handler(async ({ data }): Promise<ScanResult> => {
    let analysis: UrlAnalysis;
    try {
      analysis = analyzeUrl(data.url);
    } catch {
      throw new Error("That does not look like a valid URL.");
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ...analysis, ai: null, aiError: "AI reasoning is not configured." };
    }

    const { generateText, Output } = await import("ai");
    const gateway = createLovableAiGatewayProvider(apiKey);

    const featureLines = analysis.features
      .map((f) => `- ${f.label}: ${f.value}${f.hit ? " [RISK TRIGGERED]" : ""}`)
      .join("\n");

    try {
      const result = await generateText({
        model: gateway("google/gemini-3.7-flash"),
        output: Output.object({
          schema: z.object({
            summary: z.string(),
            indicators: z.array(z.string()).max(6),
            recommendation: z.string(),
          }),
        }),
        system:
          "You are the reasoning layer of an academic AI-based phishing detection system. " +
          "You receive lexical and structural features extracted from a URL by a machine-learning " +
          "feature pipeline, plus the classifier's risk score. Explain the verdict for a " +
          "non-expert in plain English. Be concise, factual, and never claim certainty you do not have. " +
          "Do not visit or claim to have visited the site.",
        prompt: [
          `URL: ${analysis.url}`,
          `Host: ${analysis.host}`,
          `Classifier risk score: ${analysis.riskScore}/100 (verdict: ${analysis.verdict})`,
          "",
          "Extracted features:",
          featureLines,
          "",
          "Write: a 2-sentence summary of why the model reached this verdict, up to 5 short " +
            "bullet indicators (each under 15 words), and one recommendation sentence for the user.",
        ].join("\n"),
      });

      return { ...analysis, ai: result.output, aiError: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI reasoning failed.";
      const friendly = /402|payment|credit/i.test(message)
        ? "AI credits are exhausted for this workspace — the rule-based score is still shown."
        : /429/.test(message)
          ? "AI reasoning is rate limited right now — try again in a moment."
          : "AI reasoning is temporarily unavailable — the rule-based score is still shown.";
      return { ...analysis, ai: null, aiError: friendly };
    }
  });
