"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, LinkButton } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.debug("Navbar auth", { loading, user });
  }, [loading, user]);

  const navItems = (
    <>
      <a
        href="#pricing"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Pricing
      </a>
      {!loading && (
        <>
          {user ? (
            <LinkButton href="/dashboard" size="sm">
              Dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                Login
              </LinkButton>
              <LinkButton href="/signup" size="sm">
                Sign Up
              </LinkButton>
            </>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          BlogAI
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          {navItems}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 p-4">
              <SheetClose
                render={<a href="#pricing" />}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </SheetClose>
              {!loading && (
                <>
                  {user ? (
                    <SheetClose render={<span />}>
                      <LinkButton href="/dashboard" className="w-full" size="sm">
                        Dashboard
                      </LinkButton>
                    </SheetClose>
                  ) : (
                    <>
                      <SheetClose render={<span />}>
                        <LinkButton
                          href="/login"
                          variant="ghost"
                          className="w-full"
                          size="sm"
                        >
                          Login
                        </LinkButton>
                      </SheetClose>
                      <SheetClose render={<span />}>
                        <LinkButton href="/signup" className="w-full" size="sm">
                          Sign Up
                        </LinkButton>
                      </SheetClose>
                    </>
                  )}
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
