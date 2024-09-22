"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [user, setUser] = React.useState<any>(null);

  const pathname = usePathname();
  const router = useRouter()

  async function getUserData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  async function logOut() {
    let { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null); // Explicitly set the user state to null
      router.push("/"); // Optional: Redirect to home page or wherever you want
    } else {
      console.error(error);
    }
  }

  React.useEffect(() => {
    async function fetchUser() {
      const userData = await getUserData();
      setUser(userData);
    }
    fetchUser();
  }, [pathname]);

  const { setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <>
      {!isAuthPage && (
        <nav className="border-b rounded-b-xl p-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex-shrink-0">
                  <span className="text-4xl font-extrabold">
                    <p className="bg-gradient-to-br from-slate-950 to-slate-500 inline-block text-transparent bg-clip-text py-4">
                      Designio
                    </p>
                  </span>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="mr-10 flex items-baseline space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-md text-bluebase font-medium transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <div className="md:flex justify-between gap-4 hidden">
                  {user != null && user.role == "authenticated" ? (
                    <>
                      <Button onClick={() => {
                        logOut()
                      }}>
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/signup">
                        <Button>Sign Up</Button>
                      </Link>
                      <Link href="/login">
                        <Button>Log In</Button>
                      </Link>
                    </>
                  )}
                </div>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden ml-2"
                    >
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col space-y-4 mt-4">
                      <Link
                        href="/login"
                        className="text-sm text-bluebase font-medium transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        Log In
                      </Link>
                      <Link
                        href="/signup"
                        className="text-sm text-bluebase font-medium transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="text-sm text-bluebase font-medium transition-colors hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
