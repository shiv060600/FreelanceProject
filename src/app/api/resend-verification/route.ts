import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Use Supabase's resend confirmation email function
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      console.error('Resend verification error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to resend verification email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent successfully. Please check your inbox.'
    });

  } catch (error) {
    console.error('Unexpected error in resend verification:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 