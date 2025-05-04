import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useEffect } from "react";

const loginSchema = insertUserSchema.pick({ username: true, password: true });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      instagramHandle: "",
    },
  });

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              InstaShop Review
            </h1>
            <p className="mt-4 text-gray-600">
              Discover and review authentic Instagram brands. Share your experiences
              and help others make informed decisions.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="/about" className="text-purple-600 hover:underline">About Us</Link>
              <Link href="/contact" className="text-purple-600 hover:underline">Contact</Link>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div>
                      <Input
                        placeholder="Username"
                        {...loginForm.register("username")}
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...loginForm.register("password")}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit((data) =>
                      registerMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div>
                      <Input
                        placeholder="Username"
                        {...registerForm.register("username")}
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...registerForm.register("password")}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Instagram Handle"
                        {...registerForm.register("instagramHandle")}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      Register
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}