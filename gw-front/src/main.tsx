import "./index.css";
import { render } from "preact";
import { App } from "./app.tsx";
import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
} from "@apollo/client";

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
