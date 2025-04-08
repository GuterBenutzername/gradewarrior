import "./index.css";
import { render } from "preact";
import { App } from "./app.tsx";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import i18n from "i18next";
import { initReactI18next } from "preact-i18next";
import translationEN from "./locales/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translationEN,
      },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

const client = new ApolloClient({
  uri: "http://0.0.0.0:8000/graphql/",
  cache: new InMemoryCache(),
});
render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("app") as HTMLElement,
);
