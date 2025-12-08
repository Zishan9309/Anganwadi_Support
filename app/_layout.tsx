import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// REMOVED: SafeAreaProvider, useSafeAreaInsets, SafeAreaView
// The following imports are no longer needed here:
// import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
// import { SafeAreaView } from "react-native";
// import { commonStyles } from "../styles/commonStyles"; 
import { useEffect } from "react"; 
import { setupErrorLogging } from "../utils/errorLogger";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  
  useEffect(() => {
    // Only used for global error listening, not data fetching
    setupErrorLogging();
  }, []);

  return (
    // FIX: Only the Gesture Handler wraps the stack for structural stability.
    <GestureHandlerRootView style={{ flex: 1 }}>
      
      {/* FIX: Removed SafeAreaProvider and SafeAreaView wrappers that were causing conflicts. 
                Individual screens must now apply padding/Safe Area within their own components. */}
      <StatusBar style="light" backgroundColor="#4CAF50" />
      
      {/* Static Stack Definition */}
      <Stack screenOptions={{ headerShown: false, animation: "default" }}>
        <Stack.Screen name="index" /> 
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
      </Stack>
      
    </GestureHandlerRootView>
  );
}
