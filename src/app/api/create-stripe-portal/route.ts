import { NextRequest,NextResponse} from 'next/server';
import Stripe from 'stripe';
import { createClient } from '../../../../supabase/server';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);



export async function POST(req: NextRequest) {
  
  const supabase = await createClient();
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated", redirect: "/sign-in" }, { status: 401 });
  }

  const { data: userStripeId, error: userError } = await supabase
  .from('subscriptions')
  .select('customer_id')
  .eq('user_id',userId)
  .single()

  console.log('userId:', userId);
  console.log('userStripeId:', userStripeId);
  console.log('userError:', userError);

  if (!userStripeId) {
    return NextResponse.json({ error: "failed to find stripe_id for user"}, { status: 401 });
  }
  if (userError){
    return NextResponse.json({error:'error fetching stripe_id from supabase'},{status:401})
  }
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: userStripeId.customer_id,
      return_url: "https://freelance-project-lac.vercel.app/dashboard",
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe error:', e);
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}