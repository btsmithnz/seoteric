export function ToolCall({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-gray-500">
      {icon} {children}
    </p>
  );
}
