"use client";

import { useForm } from "@tanstack/react-form";
import { Preloaded, usePreloadedQuery, useMutation } from "convex/react";
import { z } from "zod";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { FieldErrorZod } from "@/components/input/field-error-zod";
import { countries, renderCountryLabel } from "@/lib/countries";

interface SiteConfigFormProps {
  preloadedSite: Preloaded<typeof api.site.get>;
}

export function SiteConfigForm({ preloadedSite }: SiteConfigFormProps) {
  const site = usePreloadedQuery(preloadedSite);
  const updateSiteMutation = useMutation(api.site.update);

  const form = useForm({
    defaultValues: {
      name: site.name,
      domain: site.domain,
      country: site.country,
      industry: site.industry,
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        domain: z.string().regex(z.regexes.domain, { error: "Invalid domain" }),
        country: z.string(),
        industry: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await updateSiteMutation({
          siteId: site._id,
          name: value.name,
          domain: value.domain,
          country: value.country,
          industry: value.industry,
        });

        toast.success("Site settings updated successfully");
      } catch {
        toast.error("Failed to update site settings");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Update your site information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <form.Field name="name">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Site name</FieldLabel>
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
            <form.Field name="domain">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Domain</FieldLabel>
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
            <form.Field name="country">
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
            <form.Field name="industry">
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

        <CardFooter className="justify-end">
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </form>
  );
}
