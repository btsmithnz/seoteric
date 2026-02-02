"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FieldErrorZod } from "@/components/input/field-error-zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
        password: z.string().min(8),
      }),
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to sign in");
      } else {
        startTransition(() => {
          router.push("/sites");
        });
      }
    },
  });

  return (
    <form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <form.Field name="email">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    autoComplete="email"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={field.state.value}
                  />
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    autoComplete="current-password"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your password"
                    type="password"
                    value={field.state.value}
                  />
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button
                className="w-full"
                disabled={!canSubmit || isSubmitting || isPending}
                type="submit"
              >
                {isSubmitting || isPending ? "Signing in..." : "Sign in"}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-muted-foreground text-xs">
            Don&apos;t have an account?{" "}
            <Link className="text-primary hover:underline" href="/onboarding">
              Get started
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}
