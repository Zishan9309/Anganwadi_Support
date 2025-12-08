
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import Icon from './Icon';
import { commonStyles, colors } from '../styles/commonStyles';
import { useLanguage } from '../hooks/useLanguage';

export default function TabBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabs = [
    { name: 'home', icon: 'home-outline', route: '/home' },
    { name: 'students', icon: 'people-outline', route: '/students' },
    { name: 'attendance', icon: 'checkmark-circle-outline', route: '/attendance' },
    { name: 'reports', icon: 'bar-chart-outline', route: '/reports' },
    { name: 'chat', icon: 'chatbubble-outline', route: '/chat' },
  ];

  return (
    <View style={commonStyles.tabBar}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || pathname.startsWith(tab.route + '/');
        return (
          <TouchableOpacity
            key={tab.name}
            style={commonStyles.tabItem}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon as any}
              size={24}
              color={isActive ? colors.primary : colors.text}
            />
            <Text style={isActive ? commonStyles.tabTextActive : commonStyles.tabText}>
              {t(tab.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
