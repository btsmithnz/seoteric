"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { FieldErrorZod } from "@/components/input/field-error-zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { countries, renderCountryLabel } from "@/lib/countries";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      name: searchParams.get("name") ?? "",
      email: searchParams.get("email") ?? "",
      password: "",
      siteName: searchParams.get("siteName") ?? "",
      siteDomain: searchParams.get("siteDomain") ?? "",
      siteCountry: searchParams.get("siteCountry") ?? "",
      siteIndustry: searchParams.get("siteIndustry") ?? "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1),
        email: z.email(),
        password: z.string().min(8),
        siteName: z.string().min(1),
        siteDomain: z
          .string()
          .regex(z.regexes.domain, { error: "Invalid domain" }),
        siteCountry: z.string().min(1, "Please select a country"),
        siteIndustry: z.string().min(1, "Please enter an industry"),
      }),
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to create account");
      }

      startTransition(() => {
        const params = new URLSearchParams();
        params.set("name", value.siteName);
        params.set("domain", value.siteDomain);
        params.set("country", value.siteCountry);
        params.set("industry", value.siteIndustry);
        router.push(`/onboarding/complete?${params}`);
      });
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
          <CardTitle>Get started</CardTitle>
          <CardDescription>
            Create your account and add your first website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <form.Field name="name">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="name"
                  />
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="email"
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
                    type="password"
                    placeholder="Create a password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="new-password"
                  />
                  <FieldDescription>
                    Must be at least 8 characters
                  </FieldDescription>
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
            <form.Field name="siteName">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Website name</FieldLabel>
                  <Input
                    type="text"
                    placeholder="My Website"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
            <form.Field name="siteDomain">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Website domain</FieldLabel>
                  <Input
                    type="text"
                    placeholder="example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription>
                    Enter without http:// or https://
                  </FieldDescription>
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
            <form.Field name="siteCountry">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Country</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{renderCountryLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
            <form.Field name="siteIndustry">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Industry</FieldLabel>
                  <Input
                    type="text"
                    placeholder="e.g., E-commerce, Healthcare, Finance"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
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
                type="submit"
                className="w-full"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-muted-foreground text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}
