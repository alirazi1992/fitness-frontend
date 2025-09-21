"use client";
import { useQuery } from "@tanstack/react-query";
import { getGyms } from "@/lib/api";
import type { GymSummary } from "@/lib/types";

export default function GymsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["gyms"],
    queryFn: getGyms,
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Gyms</h2>
      <ul className="grid gap-3">
        {data?.map((gym: GymSummary) => (
          <li key={gym.id} className="border rounded p-3 bg-white">
            <div className="font-semibold">{gym.name}</div>
            <div className="text-sm text-gray-600">{gym.location}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}

