# Email Verification Setup Guide

## Problem
The email verification emails are not being sent when users sign up. This is because Supabase requires proper email configuration.

## Solution Steps

### 1. Configure Supabase Email Settings

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Select your project

2. **Configure Authentication Settings**
   - Go to **Authentication** → **Settings**
   - Under **Email Templates**, configure the following:

### 2. Email Template Configuration

#### Confirm Signup Template
- **Subject**: `Confirm your signup`
- **Content**:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>
```

#### Confirm Email Change Template
- **Subject**: `Confirm your email change`
- **Content**:
```html
<h2>Confirm your email change</h2>
<p>Follow this link to confirm your email change:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>
```

#### Reset Password Template
- **Subject**: `Reset your password`
- **Content**:
```html
<h2>Reset your password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>
```

### 3. SMTP Configuration (Optional but Recommended)

For production, configure SMTP settings:

1. **Go to Authentication** → **Settings** → **SMTP Settings**
2. **Enable SMTP**
3. **Configure your SMTP provider** (Gmail, SendGrid, etc.)

#### Example SMTP Settings for Gmail:
- **Host**: `smtp.gmail.com`
- **Port**: `587`
- **Username**: `your-email@gmail.com`
- **Password**: `your-app-password`
- **Encryption**: `STARTTLS`

### 4. Environment Variables

Make sure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Site URL Configuration

In your Supabase dashboard:
1. Go to **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Set **Redirect URLs** to include: `http://localhost:3000/auth/callback`

### 6. Testing

1. **Development Mode**: 
   - Check the Supabase dashboard logs for email links
   - Or use the resend verification component

2. **Production Mode**:
   - Configure proper SMTP settings
   - Set correct site URLs

### 7. Troubleshooting

#### Common Issues:

1. **Emails not sending**:
   - Check SMTP configuration
   - Verify email templates are set
   - Check site URL configuration

2. **Verification links not working**:
   - Ensure redirect URLs are properly configured
   - Check that `NEXT_PUBLIC_SITE_URL` is set correctly

3. **Development testing**:
   - Use the resend verification component
   - Check Supabase dashboard logs for email content

### 8. Code Changes Made

1. **Created API route**: `src/app/api/resend-verification/route.ts`
2. **Updated sign-up action**: Added `emailRedirectTo` option
3. **Resend verification component**: Already exists and now has a working API endpoint

### 9. Next Steps

1. Configure email templates in Supabase dashboard
2. Set up SMTP for production
3. Test the sign-up flow
4. Verify emails are being sent and received

## Quick Test

After configuration, test the sign-up flow:
1. Go to `/sign-up`
2. Create a new account
3. Check your email for verification link
4. If no email, use the "Resend Verification Email" component 