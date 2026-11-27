import { requireOwner } from "@/features/admin/server";

export default async function Manager() {
  await requireOwner();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin</h1>
    </div>
  );
}
