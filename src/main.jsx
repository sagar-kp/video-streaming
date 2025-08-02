import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  ?.use(initReactI18next) // passes i18n down to react-i18next
  ?.use(LanguageDetector)
  ?.use(HttpApi)
  ?.init({
    supportedLngs: ["en", "fr", "hi"],
    fallbackLng: "en",
    detection: {
      order: [
        "cookie",
        "navigator",
        "querystring",
        "localStorage",
        "sessionStorage",
        "htmlTag",
        "path",
        "subdomain",
      ],
      caches: ["cookie"],
    },
    backend: {
      loadPath: "/assets/locales/{{lng}}/translation.json",
    },
    react: { useSuspense: false },
  });

ReactDOM?.createRoot(document.getElementById("root"))?.render(
  // <React.StrictMode>
  <App />
  //</React.StrictMode>,
);
