
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
    const { user } = useAuth();
    
    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
    }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">View and manage your profile information.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>This is how your profile appears to others in the application.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.photoURL || "https://placehold.co/100x100"} alt={user?.displayName || "User"} data-ai-hint="person face" />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-semibold">{user?.displayName || 'User'}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground pt-2">Account created: {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
            <p className="text-sm text-muted-foreground">Last login: {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A'}</p>
            <Button asChild variant="outline" className="mt-4">
                <Link href="/settings">Edit Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
