export function formatUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    return pathname === "/" ? hostname : `${hostname}${pathname}`;
  } catch {
    return url;
  }
}

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
