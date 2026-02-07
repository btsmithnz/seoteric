import { Card, CardHeader } from "@/components/ui/card";

export default function LoadingState() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card className="animate-pulse" key={i} size="sm">
          <CardHeader>
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-1 h-3 w-24 rounded bg-muted" />
          </CardHeader>
        </Card>
      ))}
    </>
  );
}
