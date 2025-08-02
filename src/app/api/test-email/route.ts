import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server'

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

    // Test email configuration by attempting to send a password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    });

    if (error) {
      console.error('Test email error:', error);
      return NextResponse.json(
        { 
          error: error.message || 'Failed to send test email',
          details: error
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Test email sent successfully. Check your inbox for password reset email.',
      note: 'This sends a password reset email to test if email configuration is working.'
    });

  } catch (error) {
    console.error('Unexpected error in test email:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 