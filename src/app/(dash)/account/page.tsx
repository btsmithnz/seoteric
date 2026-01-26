import { Billing } from "./billing";

export default function AccountPage() {
  return (
    <div className="p-6 w-full max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Account</h1>
      <Billing />
    </div>
  );
}
