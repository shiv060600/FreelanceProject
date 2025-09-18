'use client'
import { useState } from "react"

interface AiContractGenerateParams {
    title: string;
    contractType: string;
    prompt: string;
    clientName: string;
}

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
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate contract');
            }

            if (!data.success || !data.contract) {
                throw new Error('Invalid response from AI service');
            }

            return data.contract;
        } catch (error: any) {
            console.error('Failed to generate contract:', error);
            const errorMessage = error.message || "Failed to generate AI contract";
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
