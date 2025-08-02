"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || '';
  const verifyPassowrd = formData.get("verify-password")?.toString() || '';

  if (verifyPassowrd !== password){
    return encodedRedirect(
      "error",
      "/sign-up",
      "Your password and verify password do not match, try again."
    )
  }
  
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  try {
    const supabase = await createClient();
    

    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Supabase sign-up error:", error);
      
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return encodedRedirect(
          "error", 
          "/sign-up", 
          "An account with this email already exists. Please sign in instead."
        );
      }
      
      return encodedRedirect("error", "/sign-up", error.message);
    }

    if (user) {
      console.log("User created successfully:", user.id);
      console.log("User email confirmed:", user.email_confirmed_at);
      console.log("User email:", user.email);
      
      // Check if email confirmation is required
      if (!user.email_confirmed_at) {
        console.log("Email confirmation required - verification email should be sent");
      } else {
        console.log("Email already confirmed");
      }
      
      return encodedRedirect(
        "success",
        "/sign-up",
        "Account created! Please check your email for verification.",
      );
    }
  } catch (error) {
    console.error("Unexpected sign-up error:", error);
    return encodedRedirect(
      "error", 
      "/sign-up", 
      "An unexpected error occurred. Please try again."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const supabase = await createClient();

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    return false;
  }

  return !!subscription;
};
