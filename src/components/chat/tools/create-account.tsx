import { Spinner } from "../../ui/spinner";
import { ToolCall } from "./tool-call";

export function CreateAccountTool() {
  return (
    <ToolCall icon={<Spinner className="inline size-4" />}>
      Creating your account
    </ToolCall>
  );
}
