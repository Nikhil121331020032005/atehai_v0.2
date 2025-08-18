
'use client';

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, FileClock, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";


export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [archivedMonths, setArchivedMonths] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            const archiveColRef = collection(db, 'users', user.uid, 'monthlyArchives');
            const unsubscribe = onSnapshot(archiveColRef, (snapshot) => {
                const months = snapshot.docs.map(doc => doc.id).sort((a, b) => b.localeCompare(a));
                setArchivedMonths(months);
            });
            return () => unsubscribe();
        }
    }, [user]);

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
            <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="user avatar" />
                                    <AvatarFallback>
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-3xl">Alex Doe</CardTitle>
                                    <CardDescription>Your personal account details.</CardDescription>
                                </div>
                            </div>
                             <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Profile</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between border rounded-lg p-3">
                                <span className="text-muted-foreground text-sm">Email</span>
                                <span className="font-medium">{user?.email}</span>
                            </div>
                             <div className="flex items-center justify-between border rounded-lg p-3">
                                <span className="text-muted-foreground text-sm">Age</span>
                                <span className="font-medium">28</span>
                            </div>
                             <div className="flex items-center justify-between border rounded-lg p-3">
                                <span className="text-muted-foreground text-sm">Gender</span>
                                <span className="font-medium">Male</span>
                            </div>
                        </div>

                        <Button onClick={handleLogout} variant="outline" className="w-full md:w-auto">
                           <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <FileClock className="h-5 w-5" /> Archived Reports
                        </CardTitle>
                        <CardDescription>Access your past monthly expense records.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {archivedMonths.length > 0 ? (
                                archivedMonths.map(month => (
                                    <AccordionItem key={month} value={month}>
                                        <AccordionTrigger>{format(new Date(month + '-02'), 'MMMM yyyy')}</AccordionTrigger>
                                        <AccordionContent>
                                            Here you will be able to see a summary or download the report for {format(new Date(month + '-02'), 'MMMM yyyy')}.
                                        </AccordionContent>
                                    </AccordionItem>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No archived reports found.</p>
                            )}
                        </Accordion>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    )
}
