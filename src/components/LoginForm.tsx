"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

const signupSchema = z.object({
  email: z.string().email({ message: "You must input a valid email." }),
  password: z.string().min(6, {
    message: "Password must have at least 6 characters.",
  }),
});
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    const loginResult = await logInUser(values.email, values.password);
    if (loginResult.error) {
			console.log(loginResult.error);
      toast({
        title: "Failed Log In",
        description: "Could not Log In, check your credentials and try again.",
      })
			return;  
		}

    router.push('/')
    router.refresh();
    
  }

  async function logInUser(userEmail: string, userPassword: string) {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });
    if (data) console.log(data);
    if (error) console.log(error);
    return { data, error };
  }

  return (
    <div className="p-6">
      <Card className="w-[200px] sm:w-[400px]">
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>
            Log in to Designio to let your creativity shine.
          </CardDescription>
        </CardHeader>
        <div>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <CardFooter className="flex justify-between mt-3">
                  <Link href="/">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit">Log In</Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
