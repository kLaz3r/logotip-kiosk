"use client";

import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="mx-auto max-w-md px-4 text-center text-white">
        <div className="mb-8">
          <Image
            src="/logo.svg"
            alt="Logotip"
            width={128}
            height={128}
            className="mx-auto mb-4"
          />
          <h1 className="mb-2 text-3xl font-bold">Logotip Kiosk</h1>
          <p className="text-gray-300">Aplicația este offline</p>
        </div>

        <div className="mb-6 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Funcționalități disponibile offline:
          </h2>
          <ul className="space-y-2 text-left text-gray-300">
            <li>• Vizualizarea catalogului de produse</li>
            <li>• Navigarea prin categorii</li>
            <li>• Vizualizarea imaginilor produselor</li>
            <li>• Informații despre produse</li>
          </ul>
        </div>

        <div className="text-sm text-gray-400">
          <p>Conectați-vă la internet pentru funcționalități complete.</p>
          <p className="mt-2">
            Aplicația va funcționa automat când conexiunea se restabilește.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-white px-6 py-2 font-semibold text-black transition-colors hover:bg-gray-200"
        >
          Reîncarcă aplicația
        </button>
      </div>
    </div>
  );
}
