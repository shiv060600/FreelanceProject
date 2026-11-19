"use client";
import { useCallback, useRef, useState } from "react";
import type { LengthId, ToneId } from "@/lib/contracts/catalog";
import { splitDraft, type SplitDraft } from "@/lib/contracts/draft";

export interface GenerateParams {
  title: string;
  contractType: string;
  details: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  jurisdiction?: string;
  tone?: ToneId;
  length?: LengthId;
}

export interface RefineParams {
  currentContract: string;
  instruction: string;
  /** Governing law, so revisions keep following the same jurisdiction rules. */
  jurisdiction?: string;
}

interface StreamCallbacks {
  /** Called with the CONTRACT text so far each time more arrives (the notes checklist is split off). */
  onText: (contractSoFar: string) => void;
}

/**
 * Streams a contract from /api/ai-contract-generate. The server increments
 * the usage counter, so after a run the caller should refetch usage
 * (we expose the server's reported count via `lastUsage`).
 */
export function useAiContractGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsage, setLastUsage] = useState<{ used: number; limit: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (payload: Record<string, unknown>, { onText }: StreamCallbacks): Promise<SplitDraft> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      let text = "";

      try {
        const response = await fetch("/api/ai-contract-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          let message = `Request failed (${response.status})`;
          try {
            message = (await response.json()).message || message;
          } catch {
            /* non-JSON error body */
          }
          throw new Error(message);
        }

        const limitHeader = response.headers.get("X-AI-Limit");
        const used = Number(response.headers.get("X-AI-Used"));
        if (limitHeader && Number.isFinite(used)) {
          setLastUsage({ used, limit: limitHeader === "unlimited" ? Infinity : Number(limitHeader) });
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          onText(splitDraft(text).contract);
        }
        text += decoder.decode();
        const finished = splitDraft(text, { final: true });
        onText(finished.contract);

        if (!finished.contract.trim()) throw new Error("The AI returned an empty contract. Please try again.");
        return finished;
      } catch (e: any) {
        if (e?.name === "AbortError") return splitDraft(text, { final: true }); // user cancelled; keep what we have
        const message = e?.message || "Failed to generate contract. Check your connection and try again.";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [],
  );

  const generateAiContract = useCallback(
    (params: GenerateParams, cb: StreamCallbacks) => run({ mode: "generate", ...params }, cb),
    [run],
  );

  const refineAiContract = useCallback(
    (params: RefineParams, cb: StreamCallbacks) => run({ mode: "refine", ...params }, cb),
    [run],
  );

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { loading, error, lastUsage, generateAiContract, refineAiContract, cancel };
}
