"use client";
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
import { Label } from "@/components/ui/label";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  username: z
    .string()
    .min(3, {
      message: "Username must have at least 3 characters.",
    })
    .max(20, {
      message: "Username can't exceed 20 characters.",
    }),
  password: z.string().min(6, {
    message: "Password must have at least 6 characters.",
  }),
});

export default function LoginForm() {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof signupSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <div className="p-6">
      <Card className="w-[400px]">
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            id="username"
                            placeholder="Enter your username"
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
