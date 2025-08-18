
'use client';

import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Gem, Lock, RotateCcw } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      icon: <div className="text-sm">AD</div>,
      text: "Enjoy a completely ad-free experience",
    },
];

export default function SubscriptionPage() {
    const { upgradeToPremium } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            await upgradeToPremium();
            router.push('/');
        } catch (error) {
            console.error("Upgrade failed:", error);
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
                           $2.99 <span className="text-lg font-normal text-muted-foreground">/ month</span>
                        </p>
                         <Button 
                            className="w-full text-lg py-6" 
                            onClick={handleUpgrade}
                            disabled={isLoading}
                        >
                            {isLoading ? "Upgrading..." : "Upgrade to Premium"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            This is a placeholder. No real payment will be processed. Clicking this button will enable premium features for your account.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
