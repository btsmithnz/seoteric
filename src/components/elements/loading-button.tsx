"use client";

import { ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface LoadingButtonProps extends ButtonProps {
  icon?: ReactNode;
  loading?: boolean;
  spinnerClassName?: string;
}

export function LoadingButton({
  icon,
  loading = false,
  disabled,
  spinnerClassName,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? (
        <Spinner className={spinnerClassName} />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </Button>
  );
}
