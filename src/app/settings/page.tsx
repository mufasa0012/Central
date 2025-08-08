
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSaveChanges = async () => {
        if (!user) return;
        if (!password) {
            toast({
                variant: "destructive",
                title: "Authentication Required",
                description: "Please enter your current password to save changes.",
            });
            return;
        }

        setIsSaving(true);

        try {
            const credential = EmailAuthProvider.credential(user.email!, password);
            await reauthenticateWithCredential(user, credential);
            
            // Once reauthenticated, update profile
            if (displayName !== user.displayName) {
                await updateProfile(user, { displayName });
            }
            if (email !== user.email) {
                await updateEmail(user, email);
            }

            toast({
                title: "Settings Saved",
                description: "Your profile has been updated successfully.",
            });

        } catch (error: any) {
            console.error("Error updating settings:", error);
            let description = "An unknown error occurred.";
            if (error.code === 'auth/wrong-password') {
                description = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/email-already-in-use') {
                description = "This email address is already in use by another account.";
            }
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: description,
            });
        } finally {
            setIsSaving(false);
            setPassword("");
        }
    };


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your display name and email address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
             <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="password">Current Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter current password to save" />
                <p className="text-xs text-muted-foreground">For your security, you must provide your current password to make changes.</p>
            </div>
             <div>
                 <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
