import "server-only";

import OpenAI from "openai";
import { readServerEnv } from "@/lib/server-env-local";

export function openaiClient() {
  const apiKey =
    readServerEnv("OPENAI_API_KEY") || process.env.OPENAI_API_KEY?.trim() || "";
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return new OpenAI({ apiKey });
}
