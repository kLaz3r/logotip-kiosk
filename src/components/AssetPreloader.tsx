"use client";

import NextImage from "next/image";
import { useEffect, useState } from "react";
import { getCategories } from "~/lib/catalogue";

interface AssetPreloaderProps {
  onComplete?: () => void;
}

export function AssetPreloader({ onComplete }: AssetPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        const categories = getCategories();
        const totalAssets = categories.length + 10; // Approximate count
        let loadedAssets = 0;

        const updateProgress = () => {
          loadedAssets++;
          const newProgress = Math.min((loadedAssets / totalAssets) * 100, 100);
          setProgress(newProgress);

          if (newProgress >= 100) {
            setStatus("Complete!");
            setTimeout(() => {
              onComplete?.();
            }, 500);
          }
        };

        // Preload critical fonts
        setStatus("Loading fonts...");
        const fontPromises = [
          "/fonts/FuturaPT-Book.ttf",
          "/fonts/FuturaPT-Medium.ttf",
          "/fonts/FuturaPT-Demi.ttf",
          "/fonts/FuturaPT-Bold.ttf",
        ].map((fontPath) => {
          return new Promise<void>((resolve) => {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "font";
            link.type = "font/ttf";
            link.href = fontPath;
            link.crossOrigin = "anonymous";
            link.onload = () => {
              updateProgress();
              resolve();
            };
            link.onerror = () => {
              updateProgress();
              resolve();
            };
            document.head.appendChild(link);
          });
        });

        await Promise.all(fontPromises);

        // Preload critical images
        setStatus("Loading images...");
        const imagePromises = ["/logo.svg", "/back.svg", "/logotip-bg.svg"].map(
          (imagePath) => {
            return new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                updateProgress();
                resolve();
              };
              img.onerror = () => {
                updateProgress();
                resolve();
              };
              img.src = imagePath;
            });
          },
        );

        await Promise.all(imagePromises);

        // Preload category images
        setStatus("Loading category images...");
        const categoryImagePromises = categories.slice(0, 5).map((category) => {
          return new Promise<void>((resolve) => {
            // Get first image from category
            const firstImage = `/assets/${category.id}/${category.id} 1.jpg`;
            const img = new Image();
            img.onload = () => {
              updateProgress();
              resolve();
            };
            img.onerror = () => {
              updateProgress();
              resolve();
            };
            img.src = firstImage;
          });
        });

        await Promise.all(categoryImagePromises);

        // Preload remaining assets in background
        setStatus("Loading remaining assets...");
        void setTimeout(() => {
          categories.forEach((category) => {
            // Preload more images for each category
            for (let i = 1; i <= 3; i++) {
              const img = new Image();
              img.src = `/assets/${category.id}/${category.id} ${i}.jpg`;
            }
          });
        }, 100);

        // Complete preloading
        void setTimeout(() => {
          setProgress(100);
          setStatus("Complete!");
          void setTimeout(() => {
            onComplete?.();
          }, 500);
        }, 2000);
      } catch (error) {
        console.error("Asset preloading failed:", error);
        setStatus("Error loading assets");
        void setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    };

    void preloadAssets();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center text-white">
        <div className="mb-8">
          <NextImage
            src="/logo.svg"
            alt="Logotip"
            width={128}
            height={128}
            className="mx-auto mb-4 h-32 w-32"
          />
          <h1 className="text-2xl font-bold">Logotip Kiosk</h1>
        </div>

        <div className="mb-4 h-2 w-64 rounded-full bg-gray-700">
          <div
            className="h-2 rounded-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-300">{status}</p>
        <p className="mt-2 text-xs text-gray-400">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
