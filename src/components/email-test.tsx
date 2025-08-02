"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export function EmailTest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send test email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Email Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This will send a password reset email to test if your Supabase email configuration is working.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleTestEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email Address</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          {message && (
            <Alert className={message.type === 'success' ? 'border-green-500' : message.type === 'error' ? 'border-red-500' : 'border-blue-500'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : message.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Info className="h-4 w-4 text-blue-500" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-700' : message.type === 'error' ? 'text-red-700' : 'text-blue-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Test Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 