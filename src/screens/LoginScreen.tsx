import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLogin } from "@/mutation/useAuth";
import logoFull from "@/assets/images/logofull.png";
import banner from "@/assets/images/banner.webp";

const loginSchema = z.object({
  email: z.string().min(3, "Enter your email or username"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending, isError, error } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  const errorMessage =
    isError && error instanceof Error ? error.message : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left — form panel */}
      <div className="flex flex-col w-full max-w-md shrink-0 px-12 py-10">
        {/* Logo */}
        <div className="mb-12">
          <img src={logoFull} alt="AIME" className="h-9 w-auto" />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500">
            Sign in to access your scheduled lessons
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-700">Email or username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@school.edu"
                      autoComplete="username"
                      autoFocus
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-700">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {errorMessage}
              </p>
            )}

            <Button type="submit" className="w-full h-10 mt-2" disabled={isPending}>
              {isPending ? (
                "Signing in…"
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Skip */}
        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            ← Continue without signing in
          </button>
        </div>
      </div>

      {/* Right — banner panel */}
      <div className="flex-1 relative overflow-hidden">
        <img
          src={banner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-[#1a6e8e]/20" />
      </div>
    </div>
  );
};
