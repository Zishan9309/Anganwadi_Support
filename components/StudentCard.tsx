
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Icon from './Icon';
import { commonStyles, colors } from '../styles/commonStyles';
import { Student } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
}

export default function StudentCard({ student, onPress }: StudentCardProps) {
  const { t } = useLanguage();

  const getNutritionStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return colors.success;
      case 'at-risk':
        return colors.warning;
      case 'malnourished':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getLatestNutritionStatus = () => {
    if (student.nutritionRecords && student.nutritionRecords.length > 0) {
      const latest = student.nutritionRecords[student.nutritionRecords.length - 1];
      return latest.nutritionStatus;
    }
    return 'healthy';
  };

  const nutritionStatus = getLatestNutritionStatus();

  return (
    <TouchableOpacity
      style={commonStyles.card}
      onPress={onPress || (() => router.push(`/students/${student.id}`))}
      activeOpacity={0.7}
    >
      <View style={commonStyles.row}>
        <View style={commonStyles.column}>
          <Text style={commonStyles.subtitle}>{student.name}</Text>
          <Text style={commonStyles.textSecondary}>
            {t('age')}: {student.age} | {t('gender')}: {t(student.gender)}
          </Text>
          <Text style={commonStyles.textSecondary}>
            {t('parentName')}: {student.parentName}
          </Text>
        </View>
        
        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={{
              backgroundColor: getNutritionStatusColor(nutritionStatus),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
              {t(nutritionStatus)}
            </Text>
          </View>
          
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
