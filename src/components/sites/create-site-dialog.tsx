"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { FieldErrorZod } from "@/components/input/field-error-zod";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  createDialogHandle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  getLimitToastMessage,
  parseLimitExceededError,
} from "@/lib/billing-errors";
import { countries, renderCountryLabel } from "@/lib/countries";
import { useAuthQuery } from "@/lib/hooks";

interface CreateSiteDialogProps {
  trigger?: React.ReactElement;
  onSuccess?: (siteId: string) => void;
}

export const createSiteDialog = createDialogHandle();

interface CreateSiteDialogTriggerProps {
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}

export function useSiteCreationAvailability() {
  const entitlements = useAuthQuery(api.billing.getEntitlements);
  const isLoading = entitlements === undefined;
  const siteLimitReached =
    !isLoading && (entitlements?.remaining.sites ?? 0) <= 0;
  const canCreateSite = !siteLimitReached;

  return {
    canCreateSite,
    isLoading,
    siteLimitReached,
    remainingSites: entitlements?.remaining.sites,
  };
}

export function CreateSiteDialogTrigger({
  className,
  size = "sm",
  variant = "default",
}: CreateSiteDialogTriggerProps = {}) {
  const { siteLimitReached } = useSiteCreationAvailability();
  const disabled = siteLimitReached;

  return (
    <DialogTrigger
      disabled={disabled}
      handle={createSiteDialog}
      render={
        <Button
          className={className}
          disabled={disabled}
          size={size}
          title={
            disabled
              ? "Site limit reached. Upgrade your plan in Account > Billing."
              : undefined
          }
          variant={variant}
        />
      }
    >
      <PlusIcon className="mr-1" />
      New site
    </DialogTrigger>
  );
}

export function CreateSiteDialog({ onSuccess }: CreateSiteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const createSiteMutation = useMutation(api.site.create);

  const form = useForm({
    defaultValues: {
      name: "",
      domain: "",
      country: "",
      industry: "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        domain: z.string().regex(z.regexes.domain, { error: "Invalid domain" }),
        country: z.string().min(1, "Please select a country"),
        industry: z.string().min(1, "Please enter an industry"),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const siteId = await createSiteMutation({
          name: value.name,
          domain: value.domain,
          country: value.country,
          industry: value.industry,
        });

        toast.success("Site created successfully");
        setOpen(false);
        form.reset();

        if (onSuccess) {
          onSuccess(siteId);
        } else {
          startTransition(() => {
            router.push(`/sites/${siteId}`);
          });
        }
      } catch (error) {
        const limitError = parseLimitExceededError(error);
        if (limitError) {
          toast.error(getLimitToastMessage(limitError), {
            description: "Open Account to upgrade or manage billing.",
          });
          return;
        }

        toast.error("Failed to create site");
      }
    },
  });

  return (
    <Dialog handle={createSiteDialog} onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new site</DialogTitle>
          <DialogDescription>
            Add a website to start managing its SEO
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
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
          </FieldGroup>
          <DialogFooter className="mt-4">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  disabled={!canSubmit || isSubmitting || isPending}
                  type="submit"
                >
                  {isSubmitting || isPending ? "Creating..." : "Create site"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
