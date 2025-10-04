"use client";

import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [isNavigating, setIsNavigating] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (step === "signIn") {
          setSignInError(null);
        } else {
          setSignUpError(null);
        }
        const formData = new FormData();
        formData.append("email", value.email);
        formData.append("password", value.password);
        formData.append("flow", step);
        await signIn("password", formData);

        // keep spinner going until we navigate off page
        setIsNavigating(true);

        if (step === "signUp") {
          router.push("/username");
        } else if (step === "signIn") {
          router.push("/c/general");
        }
      } catch (error) {
        console.error("auth error:", error);
        if (error instanceof Error) {
          if (
            error.message.includes("InvalidAccountId") ||
            error.message.includes("InvalidSecret")
          ) {
            const errorMessage = "invalid email or password. please try again";
            if (step === "signIn") {
              setSignInError(errorMessage);
            } else {
              setSignUpError(errorMessage);
            }
          } else {
            const errorMessage = "auth failed. please try again";
            if (step === "signIn") {
              setSignInError(errorMessage);
            } else {
              setSignUpError(errorMessage);
            }
          }
        } else {
          const errorMessage = "an unexpected error occurred :0";
          if (step === "signIn") {
            setSignInError(errorMessage);
          } else {
            setSignUpError(errorMessage);
          }
        }
      }
    },
  });

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-3xl font-semibold text-neutral-400">
            ircchat
          </span>
          <span className="text-3xl font-bold -ml-4 text-neutral-400">/</span>
          <span className="text-3xl font-bold -ml-2">
            {step === "signIn" ? "login" : "sign up"}
          </span>
        </div>

        {(step === "signIn" ? signInError : signUpError) && (
          <div className="text-red-600 text-sm border border-red-300 bg-red-50 rounded-md px-3 py-2 flex items-center gap-2 mb-4 -mt-4">
            <WarningCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">
              {step === "signIn" ? signInError : signUpError}
            </span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            children={(field) => {
              return (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={field.name}>email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="m@example.com"
                    required
                  />
                </div>
              );
            }}
          />

          <form.Field
            name="password"
            children={(field) => {
              return (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={field.name}>password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                  />
                </div>
              );
            }}
          />

          <form.Subscribe
            selector={(state) => [
              state.values.email,
              state.values.password,
              state.isSubmitting,
            ]}
            children={([email, password, isSubmitting]) => {
              const isPasswordValid =
                step === "signIn" ||
                (typeof password === "string" && password.length >= 8);
              const isLoading = Boolean(isSubmitting) || isNavigating;
              return (
                <Button
                  type="submit"
                  disabled={
                    !email || !password || !isPasswordValid || isLoading
                  }
                  className="w-full mt-2 py-5 font-semibold"
                >
                  {isLoading ? (
                    <Spinner size="small" className="text-white" />
                  ) : step === "signIn" ? (
                    "log in"
                  ) : (
                    "sign up"
                  )}
                </Button>
              );
            }}
          />
        </form>

        <div className="text-center mt-4 text-sm">
          {step === "signIn"
            ? "don't have an account? "
            : "already have an account? "}
          <span
            className="underline underline-offset-4 cursor-pointer"
            onClick={() => {
              setStep(step === "signIn" ? "signUp" : "signIn");
            }}
          >
            {step === "signIn" ? "sign up" : "log in"}
          </span>
        </div>
      </div>
    </div>
  );
}
