export function ToolCall({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="text-gray-500 text-sm">
      {icon} {children}
    </p>
  );
}
