
'use client';

import AppLayout from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Rocket, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <AppLayout pageTitle="About Verde Budget">
      <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
        
        <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Our Mission</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We believe that financial literacy is the key to a better future. Verde Budget was born from a simple idea: to make managing money simple, intuitive, and accessible for everyone.
            </p>
        </div>

        <Card className="bg-card shadow-lg border-none">
            <CardHeader className="items-center text-center">
                <div className="p-3 bg-secondary rounded-full">
                    <Rocket className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl pt-2">We're Just Getting Started</CardTitle>
                <CardDescription>And we need your help to succeed.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">
                    Verde Budget is in its very early stages. As a new business, your feedback is the most valuable asset we have. Every suggestion, bug report, and idea helps us build a better product for you. We are committed to growing with our community and creating a tool that truly makes a difference in your financial life.
                </p>
            </CardContent>
        </Card>

        <Card className="bg-card shadow-lg border-none">
            <CardHeader className="items-center text-center">
                 <div className="p-3 bg-secondary rounded-full">
                    <Heart className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl pt-2">Get In Touch</CardTitle>
                 <CardDescription>Your voice matters to us.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                    Have a question, a feature request, or any concerns? Please don't hesitate to reach out. We read every email and are eager to hear from you.
                </p>
                <Button asChild>
                    <Link href="mailto:support@verdebudget.com">
                        <Mail className="mr-2 h-4 w-4" /> Contact Support
                    </Link>
                </Button>
                <p className="text-xs text-muted-foreground pt-2">Contact Email: support@verdebudget.com</p>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
