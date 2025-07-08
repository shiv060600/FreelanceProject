import { NextResponse } from 'next/server';
import { fetchYelpBusinesses, transformYelpDataToLeads } from '@/api/server/external/yelp';

/**
 * API handler for lead generation requests
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const radius = searchParams.get('radius');
  const limit = searchParams.get('limit');
  const businessType = searchParams.get('businessType');


  if (!location || !radius || !limit || !businessType) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {

    const businesses = await fetchYelpBusinesses({
      term: businessType,
      location,
      radius,
      limit,
    });
    
    // Transform the data to our Lead format
    const leads = transformYelpDataToLeads(businesses);
    
    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('Error in lead-generator API route:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate leads',
      message: error.message
    }, { status: 500 });
  }
}
