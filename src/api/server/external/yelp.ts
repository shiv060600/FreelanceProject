import axios from 'axios';
import { YelpBusiness } from '@/types/lead-generator';

/**
 * Fetches business data from the Yelp API
 * @param params Search parameters for the Yelp API
 * @returns Array of businesses or empty array on error
 */
export async function fetchYelpBusinesses({
  term,
  location,
  radius,
  limit
}: {
  term: string;
  location: string;
  radius: string;
  limit: string;
}): Promise<YelpBusiness[]> {
  try {
    // Check if the YELP_API_KEY is available
    if (!process.env.YELP_API_KEY) {
      console.error('YELP_API_KEY is missing in environment variables');
      throw new Error('API key configuration error');
    }
    
    // Convert radius from miles to meters
    const radiusInMeters = parseInt(radius, 10) * 1609.34;
    
    const headers = {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.YELP_API_KEY}`,
    };
    
    const params = {
      term,
      location,
      radius: Math.min(Math.round(radiusInMeters), 40000), // Yelp API has a max radius of 40000 meters
      limit: parseInt(limit, 10),
    };
    
    console.log('Searching Yelp with params:', params);

    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers,
      params,
    });
    
    console.log(`Found ${response.data.businesses?.length || 0} businesses from Yelp`);
    
    return response.data.businesses || [];
  } catch (error: any) {
    console.error('Error fetching from Yelp API:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    throw error;
  }
}

/**
 * Transforms Yelp business data to our Lead format
 */
export function transformYelpDataToLeads(businesses: YelpBusiness[]) {
  return businesses.map(business => ({
    name: business.name,
    service: business.categories?.[0]?.title || 'Not specified',
    email: 'Contact via Yelp', // Yelp API doesn't provide email addresses
    phone_number: business.phone || business.display_phone || 'Not available',
    image_url: business.image_url,
    website: business.url
  }));
}
