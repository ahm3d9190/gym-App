"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Encryption() {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEncrypt = async () => {
    setIsLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Encryption failed");
      }
      const data = await response.json();
      setResult(data.encrypted_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async () => {
    setIsLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encrypted_text: text, password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Decryption failed");
      }
      const data = await response.json();
      setResult(data.decrypted_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const moveToInput = () => {
    setText(result);
    setResult("");
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        {t("encryption.title")}
      </h2>
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("encryption.text_placeholder")}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows={4}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("encryption.password_placeholder")}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-4">
          <button
            onClick={handleEncrypt}
            disabled={isLoading || !text || !password}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isLoading ? t("encryption.loading") : t("encryption.encrypt_button")}
          </button>
          <button
            onClick={handleDecrypt}
            disabled={isLoading || !text || !password}
            className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
          >
            {isLoading ? t("encryption.loading") : t("encryption.decrypt_button")}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-center text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {t("encryption.result_title")}
          </h3>
          <p className="text-gray-600 break-all">{result}</p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={copyToClipboard}
              className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
            >
              {t("encryption.copy_button")}
            </button>
            <button
              onClick={moveToInput}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              {t("encryption.move_to_input_button")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
