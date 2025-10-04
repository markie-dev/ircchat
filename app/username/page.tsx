"use client";

import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  useConvex,
  useMutation,
  useQuery,
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <div className="text-red-600 text-sm border border-red-300 bg-red-50 rounded-md px-3 py-2 flex items-center gap-2">
          <WarningCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{field.state.meta.errors.join(", ")}</span>
        </div>
      ) : null}
    </>
  );
}

function UsernameForm() {
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const convex = useConvex();
  const updateUsername = useMutation(api.users.updateUsername);
  const router = useRouter();

  const currentUser = useQuery(api.users.getCurrentUser);

  const form = useForm({
    defaultValues: {
      username: currentUser?.username ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        setUsernameError(null);
        await updateUsername({ username: value.username });

        // keep spinner going until we navigate off page
        setIsNavigating(true);

        router.push("/c/general");
      } catch (error) {
        console.error("Error saving username:", error);
        if (error instanceof Error) {
          setUsernameError(error.message);
        } else {
          setUsernameError("Failed to save username. Please try again.");
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
          <span className="text-3xl font-bold -ml-2">username</span>
        </div>

        {usernameError && (
          <div className="text-red-600 text-sm border border-red-300 bg-red-50 rounded-md px-3 py-2 flex items-center gap-2 mb-4 -mt-4">
            <WarningCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{usernameError}</span>
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
            name="username"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "username is required";
                if (value.length < 3)
                  return "username must be at least 3 characters";
                if (value.length > 30)
                  return "username must be 30 characters or less";
                if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
                  return "username can only contain letters, numbers, periods, dashes, and underscores";
                }
                return undefined;
              },
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                if (
                  !value ||
                  value.length < 3 ||
                  value.length > 30 ||
                  !/^[a-zA-Z0-9._-]+$/.test(value)
                ) {
                  return undefined;
                }

                // dont check if the username is the same as the current user's username
                if (value === currentUser?.username) {
                  return undefined;
                }

                try {
                  // check if username is already taken
                  const exists = await convex.query(api.users.checkUsername, {
                    username: value,
                  });

                  if (exists) {
                    return "username is already taken";
                  }
                  return undefined;
                } catch (error) {
                  return "error checking username availability";
                }
              },
            }}
            children={(field) => {
              return (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={field.name}>username</Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder=""
                      required
                      className="pr-10"
                      disabled={currentUser === undefined}
                    />
                    {(field.state.meta.isValidating ||
                      currentUser === undefined) && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Spinner size="small" />
                      </div>
                    )}
                  </div>
                  <FieldInfo field={field} />
                </div>
              );
            }}
          />

          <form.Subscribe
            selector={(state) => [
              state.values.username,
              state.isSubmitting,
              state.canSubmit,
            ]}
            children={([username, isSubmitting, canSubmit]) => {
              // check if username has changed from current user's username
              const hasUsernameChanged = currentUser?.username !== username;
              const isLoading = Boolean(isSubmitting) || isNavigating;

              return (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isLoading ||
                    currentUser === undefined ||
                    !hasUsernameChanged
                  }
                  className="w-full mt-2 py-5 font-semibold"
                >
                  {isLoading ? (
                    <Spinner size="small" className="text-white" />
                  ) : (
                    "save"
                  )}
                </Button>
              );
            }}
          />
        </form>
      </div>
    </div>
  );
}

function UsernameFormSkeleton() {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-12 w-full mt-2" />
        </div>
      </div>
    </div>
  );
}

// redirect to login if user is not authenticated
function RedirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }

  return null;
}

export default function UsernamePage() {
  return (
    <>
      <Authenticated>
        <UsernameForm />
      </Authenticated>
      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>
      <AuthLoading>
        <UsernameFormSkeleton />
      </AuthLoading>
    </>
  );
}
