import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-chart-kit'; // Importing PieChart
import { commonStyles, colors } from '../../styles/commonStyles';
import { useLanguage } from '../../hooks/useLanguage';
import { useStudents } from '../../hooks/useStudents';
import Header from '../../components/Header';
import Icon from '../../components/Icon';

const { width } = Dimensions.get('window');
const chartWidth = width - 40; // Full width minus screen padding (20 on each side)

export default function ReportsScreen() {
  const { t } = useLanguage();
  const { students, isLoading } = useStudents();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

    // --- Data Calculation Functions ---

  const getAttendanceStats = () => {
    const today = new Date();
    const startDate = new Date();
    
    if (selectedPeriod === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else {
      startDate.setFullYear(today.getFullYear() - 1);
    }

    let totalDays = 0;
    let totalPresent = 0;
    let totalMeals = 0;

    students.forEach(student => {
      student.attendanceRecords?.forEach(record => {
        const recordDate = new Date(record.date);
        if (recordDate >= startDate && recordDate <= today) {
          totalDays++;
          if (record.present) totalPresent++;
          if (record.mealProvided) totalMeals++;
        }
      });
    });

    const attendanceRate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
    const mealRate = totalDays > 0 ? Math.round((totalMeals / totalDays) * 100) : 0;

    return { attendanceRate, mealRate };
  };

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
        healthy++;
      }
    });
    
    return { healthy, atRisk, malnourished };
  };

  const getImmunizationStats = () => {
    let completed = 0, pending = 0, overdue = 0;
    
    students.forEach(student => {
      student.immunizationStatus?.forEach(vaccine => {
          // Simplification: Assume each vaccine counts once per student
        switch (vaccine.status) {
          case 'completed':
            completed++;
            break;
          case 'pending':
            pending++;
            break;
          case 'overdue':
            overdue++;
            break;
        }
      });
    });
    
    return { completed, pending, overdue };
  };

    // --- Chart Data Formatting ---

  const attendanceStats = getAttendanceStats();
  const nutritionStats = getNutritionStats();
  const immunizationStats = getImmunizationStats();
    
    // Prepare Attendance Rate data
    const absentRate = 100 - attendanceStats.attendanceRate;
    const attendanceData = [
        { name: t('present'), population: attendanceStats.attendanceRate, color: colors.success, legendFontColor: colors.text, legendFontSize: 14 },
        { name: t('absent'), population: absentRate, color: colors.danger, legendFontColor: colors.text, legendFontSize: 14 },
    ];
    
    // Prepare Nutrition Status data
    const nutritionData = [
        { name: t('healthy'), population: nutritionStats.healthy, color: colors.success, legendFontColor: colors.text, legendFontSize: 14 },
        { name: t('atRisk'), population: nutritionStats.atRisk, color: colors.warning, legendFontColor: colors.text, legendFontSize: 14 },
        { name: t('malnourished'), population: nutritionStats.malnourished, color: colors.danger, legendFontColor: colors.text, legendFontSize: 14 },
    ].filter(item => item.population > 0); // Filter out zero segments
    
    // Prepare Immunization Status data
    const immunizationData = [
        { name: 'पूर्ण', population: immunizationStats.completed, color: colors.success, legendFontColor: colors.text, legendFontSize: 14 },
        { name: 'बकाया', population: immunizationStats.pending, color: colors.warning, legendFontColor: colors.text, legendFontSize: 14 },
        { name: 'देर से', population: immunizationStats.overdue, color: colors.danger, legendFontColor: colors.text, legendFontSize: 14 },
    ].filter(item => item.population > 0); // Filter out zero segments


  const periods = [
    { key: 'week', label: 'सप्ताह' },
    { key: 'month', label: 'महीना' },
    { key: 'year', label: 'साल' },
  ];
    
    // Chart Configuration
    const chartConfig = {
        backgroundGradientFrom: colors.backgroundAlt,
        backgroundGradientTo: colors.backgroundAlt,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    if (isLoading) {
        return (
            <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[commonStyles.text, { marginTop: 10 }]}>{t('loading')}</Text>
            </View>
        );
    }
    
    if (students.length === 0) {
        return (
            <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Icon name="people-outline" size={64} color={colors.textSecondary} />
                <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 16 }]}>
                    छात्र डेटा उपलब्ध नहीं है।
                </Text>
            </View>
        );
    }


  return (
    <View style={commonStyles.container}>
      <Header title={t('reports')} />
      
      <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>रिपोर्ट अवधि</Text>
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  {
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    marginHorizontal: 4,
                    alignItems: 'center',
                  },
                  selectedPeriod === period.key
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.backgroundAlt, borderColor: colors.border }
                ]}
                onPress={() => setSelectedPeriod(period.key)}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: selectedPeriod === period.key ? '#FFFFFF' : colors.text,
                  fontWeight: 'bold'
                }}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 1. Attendance Report Chart */}
        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
            {t('attendanceReport')} ({attendanceStats.attendanceRate}% {t('present')})
          </Text>
            {attendanceData.length > 0 ? (
              <PieChart
                  data={attendanceData}
                  width={chartWidth}
                  height={200}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  absolute
              />
            ) : (
                <Text style={commonStyles.textSecondary}>कोई उपस्थिति डेटा नहीं है।</Text>
            )}
        </View>

        {/* 2. Nutrition Report Chart */}
        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
            {t('nutritionReport')} (कुल छात्र: {students.length})
          </Text>
            {nutritionData.length > 0 ? (
              <PieChart
                  data={nutritionData}
                  width={chartWidth}
                  height={200}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
              />
            ) : (
                <Text style={commonStyles.textSecondary}>कोई पोषण डेटा नहीं है।</Text>
            )}
        </View>

        {/* 3. Immunization Report Chart */}
        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginTop: 8, marginBottom: 12 }]}>
            {t('immunization')}
          </Text>
            {immunizationData.length > 0 ? (
              <PieChart
                  data={immunizationData}
                  width={chartWidth}
                  height={200}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
              />
            ) : (
                <Text style={commonStyles.textSecondary}>कोई टीकाकरण डेटा नहीं है।</Text>
            )}
        </View>


        {/* Export Options (Kept for completeness) */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>रिपोर्ट निर्यात</Text>
          <Text style={commonStyles.textSecondary}>
            रिपोर्ट को PDF या Excel फॉर्मेट में निर्यात करें
          </Text>
          
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity
              style={[
                commonStyles.card,
                {
                  flex: 1,
                  marginRight: 8,
                  alignItems: 'center',
                  paddingVertical: 16,
                  backgroundColor: colors.primary,
                }
              ]}
              activeOpacity={0.7}
            >
              <Icon name="document-text-outline" size={24} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', marginTop: 8, fontWeight: 'bold' }}>
                PDF
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                commonStyles.card,
                {
                  flex: 1,
                  marginLeft: 8,
                  alignItems: 'center',
                  paddingVertical: 16,
                  backgroundColor: colors.success,
                }
              ]}
              activeOpacity={0.7}
            >
              <Icon name="grid-outline" size={24} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', marginTop: 8, fontWeight: 'bold' }}>
                Excel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
