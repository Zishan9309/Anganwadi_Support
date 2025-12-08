
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabBar from '../../components/TabBar';
import { commonStyles } from '../../styles/commonStyles';

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={() => <TabBar />}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="students/index" options={{ title: 'Students' }}/>
        <Tabs.Screen name="attendance" />
        <Tabs.Screen name="reports" />
        <Tabs.Screen name="chat" />
      </Tabs>
    </GestureHandlerRootView>
  );
}
