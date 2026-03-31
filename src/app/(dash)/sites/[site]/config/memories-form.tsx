"use client";

import { useForm } from "@tanstack/react-form";
import { type Preloaded, useAction, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface MemoryCardProps {
  description: string;
  memoryKey: string;
  preloadedMemories: Preloaded<typeof api.memories.listBySite>;
  siteId: Id<"sites">;
  title: string;
}

function MemoryCard({
  title,
  description,
  memoryKey,
  siteId,
  preloadedMemories,
}: MemoryCardProps) {
  const memories = usePreloadedQuery(preloadedMemories);
  const saveMemory = useAction(api.memories.saveMemory);

  const currentMemory = memories.find((m) => m.key === memoryKey);

  const form = useForm({
    defaultValues: {
      value: currentMemory?.value ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        await saveMemory({ siteId, key: memoryKey, value: value.value });
        toast.success(`${title} memory saved`);
      } catch {
        toast.error(`Failed to save ${title} memory`);
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
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form.Field name="value">
            {(field) => (
              <Field>
                <Textarea
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="No memory saved yet. This will be populated automatically as you chat with the AI."
                  rows={6}
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>
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
                {isSubmitting ? "Saving..." : "Save memory"}
              </Button>
            )}
          </form.Subscribe>
        </CardFooter>
      </Card>
    </form>
  );
}

interface SiteMemoriesFormProps {
  preloadedMemories: Preloaded<typeof api.memories.listBySite>;
  siteId: Id<"sites">;
}

export function SiteMemoriesForm({
  siteId,
  preloadedMemories,
}: SiteMemoriesFormProps) {
  return (
    <div className="mt-6 space-y-6">
      <h2 className="font-semibold text-lg">AI Memory</h2>
      <MemoryCard
        description="General context about this site, goals, and preferences saved from conversations."
        memoryKey="general"
        preloadedMemories={preloadedMemories}
        siteId={siteId}
        title="General"
      />
      <MemoryCard
        description="What the AI learned about this business from its research."
        memoryKey="business-review"
        preloadedMemories={preloadedMemories}
        siteId={siteId}
        title="Business Review"
      />
      <MemoryCard
        description="Competitor landscape the AI identified for this site."
        memoryKey="competitor-analysis"
        preloadedMemories={preloadedMemories}
        siteId={siteId}
        title="Competitor Analysis"
      />
    </div>
  );
}
