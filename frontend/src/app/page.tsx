"use client";

import { useState } from "react";

type NutritionInfo = {
  food_name: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to analyze.");
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
        setError(data.message);
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
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Calorie Counter AI
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Upload an image of your food to get its nutritional information.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="image"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Food Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-500">{error}</p>}

        {nutritionInfo && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Nutritional Information
            </h2>
            <p className="text-lg font-medium text-gray-700 capitalize">
              Food: {nutritionInfo.food_name}
            </p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>Calories: {nutritionInfo.calories}</li>
              <li>Protein: {nutritionInfo.protein}g</li>
              <li>Fat: {nutritionInfo.fat}g</li>
              <li>Carbs: {nutritionInfo.carbs}g</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
