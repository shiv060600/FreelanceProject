'use client'
import React from "react"
import { useState } from "react"



interface AiContractGenerateProps {
    contract_type : string,
    prompt : string,
    country? : string | null,
}
export function useAiContractGenereate({contract_type,prompt,country}: AiContractGenerateProps) {
    const [loading,setLoading] = useState<boolean>(false);
    const [error,setError] = useState<string|null>(null);
    const [response,setResponse] = useState<string | null>('');

    const payload = {
        contract_type : contract_type,
        prompt : prompt,
        country : country? country : null
    }

    const generateAiContent = async() =>{
        setLoading(true)
        const response = await fetch('',{
            method:'POST',
            headers: {"Content_Type":"application/json"},
            body: JSON.stringify(payload)
        });
    }

}