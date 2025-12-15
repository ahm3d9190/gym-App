"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Image from "next/image";

type NutritionInfo = {
  food_name: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
};

export default function Home() {
  const { t, i18n } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError(t("home.form.error.no_file"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setNutritionInfo(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze image.");
      }

      const data = await response.json();
      if (data.message) {
        setError(t("home.results.no_food_detected"));
      } else {
        setNutritionInfo(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 ${
        i18n.language === "ar" ? "rtl" : ""
      }`}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
        <LanguageSwitcher />
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          {t("home.title")}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {t("home.description")}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="image"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              {t("home.form.image_label")}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {previewUrl && (
            <div className="mb-6 flex justify-center">
              <Image
                src={previewUrl}
                alt="Image preview"
                width={200}
                height={200}
                className="rounded-lg shadow-md"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              t("home.form.submit_button")
            )}
            <span className="ml-2">{isLoading ? t("home.form.loading_button") : ""}</span>
          </button>
        </form>

        {error && <p className="mt-6 text-center text-red-600">{error}</p>}

        {nutritionInfo && (
          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("home.results.title")}
            </h2>
            <p className="text-lg font-medium text-gray-700 capitalize">
              {t("home.results.food_name")}: {nutritionInfo.food_name}
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>{t("home.results.calories")}: {nutritionInfo.calories}</li>
              <li>{t("home.results.protein")}: {nutritionInfo.protein}g</li>
              <li>{t("home.results.fat")}: {nutritionInfo.fat}g</li>
              <li>{t("home.results.carbs")}: {nutritionInfo.carbs}g</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
