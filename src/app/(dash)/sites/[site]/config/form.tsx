"use client";

import { useForm } from "@tanstack/react-form";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
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
import { api } from "@/convex/_generated/api";
import { countries, renderCountryLabel } from "@/lib/countries";
import { parseFloatSafe } from "@/lib/utils";

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
      location: site.location ?? "",
      latitude: site.latitude?.toString() ?? "",
      longitude: site.longitude?.toString() ?? "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        domain: z.string().regex(z.regexes.domain, { error: "Invalid domain" }),
        country: z.string(),
        industry: z.string(),
        location: z.string(),
        latitude: z.string(),
        longitude: z.string(),
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
          location: value.location || undefined,
          latitude: parseFloatSafe(value.latitude) ?? undefined,
          longitude: parseFloatSafe(value.longitude) ?? undefined,
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
            <form.Field name="domain">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Domain</FieldLabel>
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
            <form.Field name="country">
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
            <form.Field name="industry">
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
            <form.Field name="location">
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
            <form.Field name="latitude">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Latitude</FieldLabel>
                  <Input
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="-43.5321"
                    step="any"
                    type="number"
                    value={field.state.value}
                  />
                  <FieldErrorZod field={field} />
                </Field>
              )}
            </form.Field>
            <form.Field name="longitude">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel>Longitude</FieldLabel>
                  <Input
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="172.6362"
                    step="any"
                    type="number"
                    value={field.state.value}
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
              <Button disabled={!canSubmit || isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </form>
  );
}
