import { CreateSiteDialogTrigger } from "@/components/sites/create-site-dialog";

export default function SitesLayout({ children }: LayoutProps<"/sites">) {
  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Sites</h1>
        <CreateSiteDialogTrigger />
      </div>

      <div className="grid gap-3">{children}</div>
    </div>
  );
}
