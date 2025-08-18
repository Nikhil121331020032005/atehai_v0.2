
'use client';

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
          await logout();
          router.push('/login');
          toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log you out. Please try again.' });
        }
    }

    return (
        <AppLayout pageTitle="Profile">
            <div className="max-w-xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your personal account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{user?.email}</span>
                        </div>

                        <Button onClick={handleLogout} variant="outline" className="w-full">
                           <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
