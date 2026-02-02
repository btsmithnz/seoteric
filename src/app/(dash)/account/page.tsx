import { Billing } from "./billing";

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 font-semibold text-xl">Account</h1>
      <Billing />
    </div>
  );
}
