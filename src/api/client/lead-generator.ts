'use client';

import { useState } from 'react';
import { Lead, LeadGeneratorParams } from '@/types/lead-generator';

/**
 * Custom hook for lead generation functionality
 */
export function useLeadGenerator() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  //Generate leads based on provided parameters
   
  const generateLeads = async (params: LeadGeneratorParams) => {
    setLoading(true);
    setError(null);

    try {
      // Validate required parameters
      if (!params.businessType.trim()) {
        throw new Error("Please enter a business type");
      }
      if (!params.location.trim()) {
        throw new Error("Please enter a location");
      }


      const queryParams = new URLSearchParams({
        businessType: params.businessType,
        location: params.location,
        radius: params.radius,
        limit: params.limit,
      });

      const response = await fetch(`/api/lead-generator?${queryParams}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate leads');
      }
      
      if (!Array.isArray(data)) {
        console.error('Unexpected API response format:', data);
        throw new Error('Unexpected response format from API');
      }
      
      setLeads(data);
      return data;
    } catch (error: any) {
      console.error("Failed to generate leads:", error);
      setError(error.message || "Failed to generate leads. Please try again.");
      setLeads([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    leads,
    loading,
    error,
    generateLeads,
  };
}
