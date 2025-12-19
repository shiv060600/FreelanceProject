'use client'
import { useState } from "react"

interface AiContractGenerateParams {
    title: string;
    contractType: string;
    prompt: string;
    clientName: string;
}

const KEY = process.env.AI_CONTRACT_API_KEY as string

export function useAiContractGenerate() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateAiContract = async (params: AiContractGenerateParams): Promise<string> => {
        setLoading(true);
        setError(null);
        try {
            if (!params.title.trim()) {
                throw new Error('Contract title is required');
            }
            if (!params.contractType.trim()) {
                throw new Error('Contract type is required');
            }
            if (!params.prompt.trim()) {
                throw new Error('Prompt is required');
            }
            if (!params.clientName.trim()) {
                throw new Error('Client name is required');
            }

            const response = await fetch('/api/ai-contract-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key' : KEY
                },
                body: JSON.stringify(params)
            });

            // Check if response is ok before trying to parse JSON
            if (!response.ok) {
                let errorMessage = 'Failed to generate contract';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // If JSON parsing fails, use status text
                    errorMessage = response.statusText || `Server error (${response.status})`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.success || !data.contract) {
                throw new Error(data.message || 'Invalid response from AI service');
            }

            return data.contract;
        } catch (error: any) {
            console.error('Failed to generate contract:', error);
            const errorMessage = error?.message || "Failed to generate AI contract. Please check your connection and try again.";
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    return {
        loading,
        error,
        generateAiContract
    };
}
