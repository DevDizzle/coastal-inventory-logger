"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authorizedUsers } from "@/lib/authorized-users";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (authorizedUsers.includes(email.toLowerCase())) {
        setIsAuthorized(true);
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "The provided email is not authorized.",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  if (isAuthorized) {
    // Pass the email to the children component, in this case InventoryLogger
    return React.cloneElement(children as React.ReactElement, { userEmail: email });
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <form onSubmit={handleVerify}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            Authorized Access
          </CardTitle>
          <CardDescription>
            Please verify your email address to access the inventory logger.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
