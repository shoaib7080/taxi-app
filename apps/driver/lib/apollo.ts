import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import * as SecureStore from "expo-secure-store";

const API_URL = "  ";
// ⚠️ IMPORTANT:
// If using Android Emulator, use 'http://10.0.2.2:3000/graphql'
// If using iOS Simulator, use 'http://localhost:3000/graphql'
// If using Physical Device, use your computer's LAN IP 'http://192.168.x.x:3000/graphql'
const httpLink = createHttpLink({
  uri: "https://distinguishedly-unmodernized-claris.ngrok-free.dev/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  // Get the token from secure storage
  const token = await SecureStore.getItemAsync("auth_token");

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
