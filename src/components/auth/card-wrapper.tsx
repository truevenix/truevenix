"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
}

export const CardWrapper = ({children, headerLabel, backButtonLabel,
     backButtonHref, showSocial } : CardWrapperProps) => {
  return (
    <Card className="w-84 md:w-95 shadow-md border-[var(--theme-primary)]/15">
      <CardHeader>
        <Header label={headerLabel}/>
      </CardHeader>
      <CardContent>
      {children}
      </CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton
        label={backButtonLabel}
        href={backButtonHref}
        />
      </CardFooter>
      <CardFooter>
      <p className="!text-tiny-medium text-gray-500">By signing up, you agree to the  <a href="/terms-and-conditions" target="_blank" className="text-[var(--theme-primary)] underline ">Terms of Service</a> and <a href="/privacy-policy" target="_blank" className="text-[var(--theme-primary)] underline">Privacy Policy</a></p>
      </CardFooter>
    </Card>
  );
};