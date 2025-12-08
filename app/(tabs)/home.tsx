
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { commonStyles, colors } from '../../styles/commonStyles';
import { useLanguage } from '../../hooks/useLanguage';
import { useStudents } from '../../hooks/useStudents';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';

export default function HomeScreen() {
  const { t } = useLanguage();
  const { students } = useStudents();
  const [todayAttendance, setTodayAttendance] = useState(0);

  useEffect(() => {
    // Calculate today's attendance
    const today = new Date().toISOString().split('T')[0];
    let presentCount = 0;
    
    students.forEach(student => {
      const todayRecord = student.attendanceRecords?.find(record => 
        record.date === today && record.present
      );
      if (todayRecord) {
        presentCount++;
      }
    });
    
    setTodayAttendance(presentCount);
  }, [students]);

  const getNutritionStats = () => {
    let healthy = 0, atRisk = 0, malnourished = 0;
    
    students.forEach(student => {
      if (student.nutritionRecords && student.nutritionRecords.length > 0) {
        const latest = student.nutritionRecords[student.nutritionRecords.length - 1];
        switch (latest.nutritionStatus) {
          case 'healthy':
            healthy++;
            break;
          case 'at-risk':
            atRisk++;
            break;
          case 'malnourished':
            malnourished++;
            break;
        }
      } else {
        healthy++; // Default to healthy if no records
      }
    });
    
    return { healthy, atRisk, malnourished };
  };

  const nutritionStats = getNutritionStats();

  const quickActions = [
    {
      title: t('markAttendance'),
      icon: 'checkmark-circle-outline',
      color: colors.primary,
      onPress: () => router.push('/attendance'),
    },
    {
      title: t('addStudent'),
      icon: 'person-add-outline',
      color: colors.accent,
      onPress: () => router.push('/students/add'),
    },
    {
      title: t('viewReports'),
      icon: 'bar-chart-outline',
      color: colors.secondary,
      onPress: () => router.push('/reports'),
    },
    {
      title: t('chatAssistant'),
      icon: 'chatbubble-outline',
      color: colors.primary,
      onPress: () => router.push('/chat'),
    },
    {
      title: "Vaccination Drive",
      icon: "medkit-outline",
      color: colors.success,
      onPress: () => router.push('/students/vaccinationDrive'),
    },
  ];

  return (
    <View style={commonStyles.container}>
      <Header 
        title={t('home')}
        rightAction={{
          icon: 'person-circle-outline',
          onPress: () => router.push('/profile'),
        }}
      />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          <Text style={commonStyles.title}>
            {t('welcome')}, {t('anganwadiWorker')}!
          </Text>
          
          {/* Statistics */}
          <View style={{ marginVertical: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <StatCard
                  title={t('totalStudents')}
                  value={students.length}
                  icon="people-outline"
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <StatCard
                  title={t('presentToday')}
                  value={todayAttendance}
                  icon="checkmark-circle-outline"
                  color={colors.success}
                />
              </View>
            </View>
            
            {/* Nutrition Status */}
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              {t('nutritionStatus')}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 4 }}>
                <StatCard
                  title={t('healthy')}
                  value={nutritionStats.healthy}
                  icon="heart-outline"
                  color={colors.success}
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: 4 }}>
                <StatCard
                  title={t('atRisk')}
                  value={nutritionStats.atRisk}
                  icon="warning-outline"
                  color={colors.warning}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 4 }}>
                <StatCard
                  title={t('malnourished')}
                  value={nutritionStats.malnourished}
                  icon="alert-circle-outline"
                  color={colors.danger}
                />
              </View>
            </View>
          </View>
          
          {/* Quick Actions */}
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
            {t('quickActions')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  commonStyles.card,
                  {
                    width: '48%',
                    alignItems: 'center',
                    paddingVertical: 20,
                    marginBottom: 12,
                  }
                ]}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <Icon name={action.icon as any} size={32} color={action.color} />
                <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 8 }]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
