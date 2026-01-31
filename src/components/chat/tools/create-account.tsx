import { Spinner } from "../../ui/spinner";
import { ToolCall } from "./tool-call";

export function CreateAccountTool() {
  return (
    <ToolCall icon={<Spinner className="size-4 inline" />}>
      Creating your account
    </ToolCall>
  );
}
