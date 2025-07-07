"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function SmtpMessage() {
  // In development, show a helpful message about SMTP configuration
  if (process.env.NODE_ENV === "development") {
    return (
      <Alert className="mt-6 max-w-md">
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription>
          <p className="text-xs text-muted-foreground">
            In development mode, check the server console to find the password reset link.
            For production, make sure to configure your SMTP settings.
          </p>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
