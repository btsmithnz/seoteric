import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  message: string;
}

export function UpgradePrompt({ message }: UpgradePromptProps) {
  return (
    <div className="flex items-center justify-between gap-3 border border-amber-500/20 bg-amber-500/5 p-3">
      <p className="text-sm">{message}</p>
      <Button
        nativeButton={false}
        render={<Link href="/account" />}
        size="sm"
        variant="outline"
      >
        Upgrade plan
        <ArrowUpRightIcon />
      </Button>
    </div>
  );
}
