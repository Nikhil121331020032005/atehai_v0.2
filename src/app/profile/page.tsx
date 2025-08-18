
'use client';

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useAppContext } from "@/context/app-context";
import { useToast } from "@/hooks/use-toast";
import { LogOut, FileClock, Edit, RotateCcw, Info, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";


export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { profile, isLoading, resetMonthlyData } = useAppContext();
    const router = useRouter();
    const { toast } = useToast();
    const [archivedMonths, setArchivedMonths] = useState<string[]>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

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
    
    const handleReset = async () => {
        setIsResetting(true);
        try {
            await resetMonthlyData();
            toast({ title: 'Data Reset', description: 'Your current month\'s data has been successfully reset.' });
        } catch (error: any) {
            if (error.message !== 'Reset limit reached') {
                toast({ variant: 'destructive', title: 'Reset Failed', description: 'Could not reset your data. Please try again.' });
            }
            console.error(error);
        } finally {
            setIsResetting(false);
        }
    }

    if (isLoading || !profile) {
        return (
            <AppLayout pageTitle="Profile">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-20 w-20 rounded-full" />
                                    <div>
                                        <Skeleton className="h-8 w-40 mb-2" />
                                        <Skeleton className="h-4 w-60" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-72" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        )
    }

    const canReset = profile.isPremium || (profile.resetsThisMonth ?? 0) < 2;

    return (
        <AppLayout pageTitle="Profile">
            <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={profile.avatarUrl} alt={profile.name || 'User Avatar'} />
                                    <AvatarFallback>
                                        {profile.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-3xl">{profile.name || 'User'}</CardTitle>
                                    <CardDescription>Your personal account details.</CardDescription>
                                </div>
                            </div>
                             <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit Profile</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between border rounded-lg p-3">
                                <span className="text-muted-foreground text-sm">Email</span>
                                <span className="font-medium">{profile.email}</span>
                            </div>
                             <div className="flex items-center justify-between border rounded-lg p-3">
                                <span className="text-muted-foreground text-sm">Age</span>
                                <span className="font-medium">{profile.age || 'Not set'}</span>
                            </div>
                             <div className="flex items-center justify-between border rounded-lg p-3">
                                <span className="text-muted-foreground text-sm">Gender</span>
                                <span className="font-medium">{profile.gender || 'Not set'}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                             <Button onClick={handleLogout} variant="outline">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                            <Button asChild variant="outline">
                               <Link href="/about">
                                <Info className="mr-2 h-4 w-4" /> About Us
                               </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <FileClock className="h-5 w-5" /> Archived Reports
                        </CardTitle>
                        <CardDescription>Access your past monthly expense records. This is a premium feature.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {profile.isPremium ? (
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
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">This Feature is Locked</h3>
                                <p className="text-muted-foreground text-sm mb-4">Upgrade to premium to access your monthly archives.</p>
                                <Button asChild>
                                    <Link href="/subscription">Upgrade Now</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                           <RotateCcw className="h-5 w-5" /> Reset Monthly Data
                        </CardTitle>
                        <CardDescription>
                            This will clear all your transactional data for the current month. Free users can do this twice a month. Premium users have unlimited resets. This action cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isResetting || !canReset}>
                                    {isResetting ? 'Resetting...' : 'Reset Current Month'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all of your financial records for the current month and reset your goal progress.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                                    Yes, reset my data
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {!profile.isPremium && (
                            <p className="text-xs text-muted-foreground mt-2">
                                You have {2 - (profile.resetsThisMonth ?? 0)} resets remaining this month.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <EditProfileDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                profile={profile}
            />
        </AppLayout>
    )
}
