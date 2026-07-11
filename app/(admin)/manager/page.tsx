import Link from "next/link";

export default function Manager() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Manager</h1>
      <ul className="mt-4 list-disc pl-5">
        <li>
          <Link href="/manager/performance" className="text-blue-600 hover:underline">
            Performance baseline
          </Link>
        </li>
      </ul>
    </div>
  );
}
