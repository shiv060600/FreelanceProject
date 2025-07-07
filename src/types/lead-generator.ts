export interface Lead {
  name: string;
  service: string;
  email: string;
  phone_number: string;
  image_url?: string;
  website?: string;
}

export interface LeadGeneratorParams {
  businessType: string;
  location: string;
  radius: string;
  limit: string;
}

export interface YelpBusiness {
  id: string;
  alias: string;
  name: string;
  image_url?: string;
  url?: string;
  phone?: string;
  display_phone?: string;
  categories?: Array<{
    alias: string;
    title: string;
  }>;
  [key: string]: any; // For other Yelp API properties
}
