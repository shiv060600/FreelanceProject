'use client';
import { useEffect, useState } from "react";
import { useLeadGenerator } from "@/api/client/lead-generator";
import { Lead, LeadGeneratorParams } from "@/types/lead-generator";
import { createClient } from "@/lib/supabase-browser";
import { redirect } from "next/navigation";
import { getSubscriptionAccess } from "@/utils/subscription";
import { Lock } from "lucide-react";
import { Loader2 } from "lucide-react";
export default function LeadGeneratorPage() {
  const { leads, loading, error, generateLeads } = useLeadGenerator();
  const [currenttier,setCurrentTier] = useState<string | null>(null);
  const [isLoading,setIsLoading] = useState(true)
  const [currentPage,setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
      const data = await getSubscription();
      setCurrentTier(data?.subscription || null)
      }
      catch(error){
        console.log(`error getting subscription ${error}`)
      }finally{
        setIsLoading(false);
      }
    }
    fetchSubscription();
  },[]);

  useEffect(() => {
    setCurrentPage(1);
  },[leads]);

  const getSubscription = async () => {
    const supabase = createClient();
    const {data : {user} , error : userError } =  await supabase.auth.getUser();
    if (!user || userError) {return redirect('/sign-in')};

    const {data : subscriptionData , error : subscriptionError} = await supabase
    .from('users')
    .select('subscription')
    .eq('user_id',user.id)
    .single()

    return subscriptionData;
    
  };

  

  const [formData, setFormData] = useState<LeadGeneratorParams>({
    location: "",
    radius: "10",
    limit: "50",
    businessType: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateLeads(formData);
    } catch (error) {
      // Error is already handled in the useLeadGenerator hook
    }
  };

  if(isLoading){
    return(
      <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin"/>
      </div>
    )
  }
  const indexOfLastLead = currentPage * 10
  const indexOfFirstLead = indexOfLastLead - 10
  const currentLeads = leads.slice(indexOfFirstLead,indexOfLastLead)
  const totalPages = Math.ceil(leads.length/10);
  const needMoreThanOne = leads.length > 10;

  const Pagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++){
      pageNumbers.push(i)
    }
    return(
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button 
        onClick={() => setCurrentPage(prev => Math.max(prev-1,1))}
        disabled = {currentPage === 1} 
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        {pageNumbers.map(number => (
            <button
              key = {number}
              onClick={() => setCurrentPage(number)}
              className="px-3 py-2 text-sm font-medium rounded-md">
            {number}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1,totalPages))}
            disabled = {currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
      </div>
    );
  };

  return (
    currenttier === "Expert Freelancer" ? (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lead Generator
          </h1>
          <p className="text-lg text-gray-600">
            Describe your service or business to generate qualified leads
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleGenerate}>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg h-12 px-2"
              placeholder="Enter location"
            />
          </div>
          <div>
            <label
              htmlFor="radius"
              className="block text-sm font-medium text-gray-700"
            >
              Radius (Mi)
            </label>
            <input
              type="text"
              id="radius"
              name="radius"
              value={formData.radius}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg h-12 px-2"
              placeholder="Enter Radius (Miles)"
            />
          </div>
          <div>
            <label
              htmlFor="limit"
              className="block text-sm font-medium text-gray-700"
            >
              Limit (maximum responses)
            </label>
            <input
              type="text"
              id="limit"
              name="limit"
              value={formData.limit}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg h-12 px-2"
              placeholder="Enter limit"
            />
          </div>
          <div>
            <label
              htmlFor="businessType"
              className="block text-sm font-medium text-gray-700"
            >
              Business Type
            </label>
            <input
              type="text"
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg h-12 px-2"
              placeholder="Enter business type"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Leads"}
          </button>
        </form>
      </div>
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
            <p className="mt-2 text-gray-600">Generating leads...</p>
          </div>
        ) : leads.length > 0 ? (
          <>
          {currentLeads.map((lead, index) => (
            <div
              key={indexOfFirstLead + index}
              className="p-4 border rounded-md shadow-md mb-4 flex"
            >
              {lead.image_url && (
                <div className="mr-4 flex-shrink-0">
                  <img 
                    src={lead.image_url} 
                    alt={lead.name} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="flex-grow">
                <h2 className="text-lg font-bold">{lead.name}</h2>
                <p className="text-sm text-gray-600">Service: {lead.service}</p>
                {lead.email && lead.email !== 'Contact via Yelp' && (
                  <p className="text-sm text-gray-600">Email: {lead.email}</p>
                )}
                {lead.phone_number && lead.phone_number !== 'Not available' && (
                  <p className="text-sm text-gray-600">Phone: {lead.phone_number}</p>
                )}
                {lead.website && (
                  <p className="text-sm text-gray-600 mt-2">
                    <a 
                      href={lead.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View on Yelp
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
          {needMoreThanOne && <Pagination/>}
          </>
        ) : (
          <div className="text-center mt-8">
            {error ? (
              <div className="text-red-600 mb-4">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            ) : formData.location ? (
              <p className="text-gray-500">No leads found. Try different search parameters.</p>
            ) : (
              <p className="text-gray-500">No leads generated yet.</p>
            )}
            
            {formData.location && !error && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm">
                <p className="font-medium text-blue-800">Tips for better results:</p>
                <ul className="list-disc list-inside text-left mt-2 text-blue-700">
                  <li>Try a larger radius (e.g., 25 miles instead of 10)</li>
                  <li>Use more generic business types (e.g., "cafe" instead of "specialty coffee")</li>
                  <li>Check your location spelling</li>
                  <li>Use city names rather than specific addresses</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>) 
    : (
      <div className="min-h-screen flex  items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="flex space-x-2">
            <Lock className="h-10 w-10 text-red-500"/>
            <h2 className="text-bold text-red-600">
              No access for users who don't have Expert Freelancer subscription
            </h2>
          </div>
        </div>
      </div>
    )
    
  
  );
}
