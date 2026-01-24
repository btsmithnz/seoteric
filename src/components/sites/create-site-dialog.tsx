"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { z } from "zod";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createDialogHandle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { FieldErrorZod } from "@/components/input/field-error-zod";

interface CreateSiteDialogProps {
  trigger?: React.ReactElement;
  onSuccess?: (siteId: string) => void;
}

export const createSiteDialog = createDialogHandle();

export function CreateSiteDialog({ onSuccess }: CreateSiteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const createSiteMutation = useMutation(api.site.create);

  const form = useForm({
    defaultValues: {
      name: "",
      domain: "",
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
        domain: z
          .string()
          .regex(z.regexes.domain, { error: "Invalid domain" }),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        const siteId = await createSiteMutation({
          name: value.name,
          domain: value.domain,
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
      } catch {
        toast.error("Failed to create site");
      }
    },
  });

  return (
    <Dialog handle={createSiteDialog} open={open} onOpenChange={setOpen}>
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
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending}
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
