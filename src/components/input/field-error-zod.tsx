import type { AnyFieldApi, StandardSchemaV1Issue } from "@tanstack/react-form";
import { FieldError } from "../ui/field";

export function FormErrorZod({
  errors,
}: {
  errors: (StandardSchemaV1Issue | undefined)[];
}) {
  const filtered = errors.filter((error) => error !== undefined);
  if (filtered.length === 0) {
    return null;
  }

  return (
    <FieldError>
      {filtered.map((error) => error?.message).join(", ")}
    </FieldError>
  );
}

export function FieldErrorZod({ field }: { field: AnyFieldApi }) {
  if (!field.state.meta.isTouched) {
    return null;
  }
  return <FormErrorZod errors={field.state.meta.errors} />;
}
