import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Icon from './Icon';
import { commonStyles, colors } from '../styles/commonStyles';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export default function Header({ title, showBack = false, rightAction }: HeaderProps) {
  return (
    <View style={commonStyles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {/* FIX: Check if a back action is possible before rendering the button. */}
        {showBack && router.canGoBack() && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={commonStyles.headerTitle}>{title}</Text>
      </View>
      
      {rightAction && (
        <TouchableOpacity onPress={rightAction.onPress} activeOpacity={0.7}>
          <Icon name={rightAction.icon as any} size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}
