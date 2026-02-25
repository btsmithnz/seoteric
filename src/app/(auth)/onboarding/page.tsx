"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
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
      siteLocation: searchParams.get("siteLocation") ?? "",
      siteLatitude: searchParams.get("siteLatitude") ?? "",
      siteLongitude: searchParams.get("siteLongitude") ?? "",
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
        siteLocation: z.string(),
        siteLatitude: z.string(),
        siteLongitude: z.string(),
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
      } else {
        startTransition(() => {
          const params = new URLSearchParams();
          params.set("name", value.siteName);
          params.set("domain", value.siteDomain);
          params.set("country", value.siteCountry);
          params.set("industry", value.siteIndustry);
          if (value.siteLocation) {
            params.set("location", value.siteLocation);
          }
          if (value.siteLatitude !== "") {
            params.set("latitude", String(value.siteLatitude));
          }
          if (value.siteLongitude !== "") {
            params.set("longitude", String(value.siteLongitude));
          }
          router.push(`/onboarding/complete?${params}`);
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
                    autoComplete="name"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="John Doe"
                    type="text"
                    value={field.state.value}
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
                    autoComplete="new-password"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Create a password"
                    type="password"
                    value={field.state.value}
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
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="My Website"
                    type="text"
                    value={field.state.value}
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
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="example.com"
                    type="text"
                    value={field.state.value}
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
                    onValueChange={(value) => field.handleChange(value ?? "")}
                    value={field.state.value}
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
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., E-commerce, Healthcare, Finance"
                    type="text"
                    value={field.state.value}
                  />
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
            <form.Field name="siteLocation">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Location</FieldLabel>
                  <Input
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Christchurch - New Zealand"
                    type="text"
                    value={field.state.value}
                  />
                  <FieldDescription>
                    Descriptive location for local SEO (optional)
                  </FieldDescription>
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
                {isSubmitting || isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            )}
          </form.Subscribe>
          <p className="text-muted-foreground text-xs">
            Already have an account?{" "}
            <Link className="text-primary hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}
