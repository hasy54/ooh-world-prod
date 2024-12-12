'use client';

import { useUser } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn, user } = useUser();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {isSignedIn ? (
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.fullName || user?.emailAddresses[0]?.emailAddress}
        </h1>
      ) : (
        <h1 className="text-2xl font-semibold">You are not signed in</h1>
      )}
    </div>
  );
}
