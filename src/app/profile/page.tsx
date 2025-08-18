
'use client';

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, FileClock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


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
            <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
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
                            <AccordionItem value="item-1">
                                <AccordionTrigger>June 2024</AccordionTrigger>
                                <AccordionContent>
                                Here you will be able to see a summary or download the report for June 2024.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>May 2024</AccordionTrigger>
                                <AccordionContent>
                                Here you will be able to see a summary or download the report for May 2024.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>April 2024</AccordionTrigger>
                                <AccordionContent>
                                Here you will be able to see a summary or download the report for April 2024.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    )
}
