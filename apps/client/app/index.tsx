import { Redirect } from "expo-router";

export default function Index() {
  // Automatically redirect users to the (tabs) folder
  // return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
