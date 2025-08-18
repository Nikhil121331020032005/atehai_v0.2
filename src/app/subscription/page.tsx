'use client';

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Gem, Lock, RotateCcw, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { createCheckoutSession } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import Head from "next/head";

const premiumFeatures = [
    {
      icon: <Lock className="h-5 w-5" />,
      text: "Access all historical monthly reports",
    },
    {
      icon: <RotateCcw className="h-5 w-5" />,
      text: "Unlimited monthly data resets",
    },
    {
      icon: <Moon className="h-5 w-5" />,
      text: "Switch to a beautiful dark mode",
    },
    {
      icon: <div className="text-sm">AD</div>,
      text: "Enjoy a completely ad-free experience",
    },
];

export default function SubscriptionPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isCashfreeReady, setIsCashfreeReady] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree-checkout.js';
        script.onload = () => setIsCashfreeReady(true);
        script.onerror = () => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load payment gateway. Please refresh the page.',
            });
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [toast]);

    const handleUpgrade = async () => {
        if (!isCashfreeReady) {
             toast({
                variant: 'destructive',
                title: 'Payment Gateway Not Ready',
                description: 'Please wait a moment for the payment gateway to load.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const { session_id, error } = await createCheckoutSession();

            if (error || !session_id) {
                throw new Error(error || "Failed to create checkout session.");
            }

            const cashfree = new (window as any).Cashfree(session_id);
            cashfree.checkout({
                paymentStyle: "popup",
            });

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Subscription Error',
                description: error.message || 'Could not initiate payment. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AppLayout pageTitle="Go Premium">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="text-center bg-primary text-primary-foreground p-8 rounded-t-xl">
                         <div className="mx-auto bg-primary-foreground/20 p-3 rounded-full w-fit mb-2">
                            <Gem className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-3xl">Unlock Premium Features</CardTitle>
                        <CardDescription className="text-primary-foreground/80 text-lg">
                           Take full control of your finances with an Atehai Premium membership.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4 mb-8">
                            <h3 className="font-semibold text-lg">Your Premium membership includes:</h3>
                             <ul className="space-y-3">
                                {premiumFeatures.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                                        <Check className="h-4 w-4" />
                                    </span>
                                    <span className="text-muted-foreground">{feature.text}</span>
                                </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-center text-4xl font-bold mb-2">
                           ₹2.99 <span className="text-lg font-normal text-muted-foreground">/ month</span>
                        </p>
                         <Button 
                            className="w-full text-lg py-6" 
                            onClick={handleUpgrade}
                            disabled={isLoading || !isCashfreeReady}
                        >
                            {isLoading ? "Redirecting..." : "Upgrade to Premium"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            You will be redirected to our secure payment partner, Cashfree.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
