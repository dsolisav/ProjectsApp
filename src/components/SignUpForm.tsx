"use client";
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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"

const signupSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must have at least 3 characters.",
    })
    .max(20, {
      message: "Username can't exceed 20 characters.",
    }),
  email: z.string().email({ message: "You must input a valid email." }),
  password: z.string().min(6, {
    message: "Password must have at least 6 characters.",
  }),
  role: z.enum(["client", "project_manager", "designer"], {
    message: "Role must be client, project manager or designer.",
  }),
});

export default function SignUpForm() {
  const { toast } = useToast()
	const router = useRouter()
  async function signUpNewUser(
    userEmail: string,
    userPassword: string,
    userUsername: string,
    userRole: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: userPassword,
      options: {
        data: {
          username: userUsername,
          role: userRole,
        },
      },
    });
    if (data) console.log(data);
    if (error) console.log(error);
		return { data, error }
  }

  async function createUser(
    userEmail: string,
    userUsername: string,
    userRole: string
  ) {
    const { data, error } = await supabase
      .from("users")
      .update([{ username: userUsername, role: userRole }])
      .eq('email', userEmail);
    if (data) console.log(data);
    if (error) console.log(error);
		return { data, error }
  }

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    const signUpResult = await signUpNewUser(
      values.email,
      values.password,
      values.username,
      values.role
    );
  
    
    if (signUpResult.error) {
      toast({
        title: "Failed Sign Up",
        description: "Could not Sign Up, remember not to use an already registered email address.",
      })
      console.log(signUpResult.error);
      return;
    }
  

    const userId = signUpResult.data.user?.id;
    if (!userId) {
      console.error('User ID is missing after sign-up');
      return;
    }
  
    const createUserResult = await createUser(
      values.email,
      values.username,
      values.role
    );
  
    if (createUserResult.error) {
      console.log(createUserResult.error);
      return;
    }
  
    router.push('/');
    router.refresh();
  };

  return (
    <div className="p-6">
      <Card className="w-[280px] sm:w-[400px]">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create your account in Designio to get started.
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
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                        <FormDescription>
                          This is the email for your account.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-6">
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
                            placeholder="Set a password"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the password for your account.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="project_manager">
                              Project Manager
                            </SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This is the role you will play in your projects.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <CardFooter className="flex justify-between mt-3">
                  <Link href="/">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit">Sign Up</Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
