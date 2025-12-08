
import React from 'react';
import { View, Text } from 'react-native';
import Icon from './Icon';
import { commonStyles, colors } from '../styles/commonStyles';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function StatCard({ title, value, icon, color = colors.primary }: StatCardProps) {
  return (
    <View style={[commonStyles.card, { alignItems: 'center', minHeight: 100 }]}>
      <Icon name={icon as any} size={32} color={color} />
      <Text style={[commonStyles.title, { fontSize: 20, marginTop: 8, marginBottom: 4 }]}>
        {value}
      </Text>
      <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
        {title}
      </Text>
    </View>
  );
}
