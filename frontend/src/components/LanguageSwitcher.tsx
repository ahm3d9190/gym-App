// frontend/src/components/LanguageSwitcher.tsx
"use client";

import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex justify-center space-x-4 mb-4">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          i18n.language === 'en'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {t("home.language_switcher.en")}
      </button>
      <button
        onClick={() => changeLanguage("ar")}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          i18n.language === 'ar'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {t("home.language_switcher.ar")}
      </button>
    </div>
  );
}
