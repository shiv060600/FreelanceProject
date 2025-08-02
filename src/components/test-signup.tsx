"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export function TestSignup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Sign-up successful! Check your email.' });
      } else {
        const data = await response.text();
        setMessage({ type: 'error', text: data || 'Sign-up failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const generateTestEmail = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    setFormData(prev => ({
      ...prev,
      email: `test.${timestamp}.${random}@example.com`
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Sign-up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="test-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email"
                required
              />
              <Button type="button" onClick={generateTestEmail} variant="outline">
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-password">Password</Label>
            <Input
              id="test-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-fullname">Full Name</Label>
            <Input
              id="test-fullname"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>

          {message && (
            <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={loading || !formData.email || !formData.password || !formData.fullName}
            className="w-full"
          >
            {loading ? "Signing up..." : "Test Sign-up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 