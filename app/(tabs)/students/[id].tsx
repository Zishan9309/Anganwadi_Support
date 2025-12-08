import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'; // Added TouchableOpacity back
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../../styles/commonStyles';
import { useLanguage } from '../../../hooks/useLanguage';
import { useStudents } from '../../../hooks/useStudents';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import Icon from '../../../components/Icon';
import { Student } from '../../../types';

export default function StudentDetailScreen() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStudentById, deleteStudent, isLoading } = useStudents();

  const student = id ? getStudentById(id) : null;

  const handleDelete = () => {
    Alert.alert(
      'छात्र हटाएं',
      'क्या आप वाकई इस छात्र को हटाना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'हटाएं',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteStudent(id);
              router.back();
            }
          },
        },
      ]
    );
  };

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
    if (student?.nutritionRecords && student.nutritionRecords.length > 0) {
      const latest = student.nutritionRecords[student.nutritionRecords.length - 1];
      return latest.nutritionStatus;
    }
    return 'healthy';
  };

  const getAttendanceStats = () => {
    if (!student?.attendanceRecords) return { total: 0, present: 0, percentage: 0 };

    const total = student.attendanceRecords.length;
    const present = student.attendanceRecords.filter(record => record.present).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, percentage };
  };

  if (isLoading) {
    return (
      <View style={commonStyles.container}>
        <Header title={t('loading')} showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={commonStyles.text}>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={commonStyles.container}>
        <Header title="छात्र नहीं मिला" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="person-outline" size={64} color={colors.textSecondary} />
          <Text style={[commonStyles.text, { marginTop: 16 }]}>
            छात्र की जानकारी नहीं मिली
          </Text>
        </View>
      </View>
    );
  }

  const nutritionStatus = getLatestNutritionStatus();
  const attendanceStats = getAttendanceStats();

  return (
    <View style={commonStyles.container}>
      <Header
        title={student.name}
        showBack
        rightAction={{
          icon: 'trash-outline',
          onPress: handleDelete,
        }}
      />

      <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={commonStyles.card}>
          <View style={commonStyles.row}>
            <Icon name="person-circle-outline" size={48} color={colors.primary} />
            <View style={[commonStyles.column, { marginLeft: 16 }]}>
              <Text style={commonStyles.title}>{student.name}</Text>
              <Text style={commonStyles.textSecondary}>
                {t('age')}: {student.age} वर्ष | {t('gender')}: {t(student.gender)}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={commonStyles.textSecondary}>{t('parentName')}</Text>
            <Text style={commonStyles.text}>{student.parentName}</Text>
          </View>

          {student.address && (
            <View style={{ marginTop: 12 }}>
              <Text style={commonStyles.textSecondary}>{t('address')}</Text>
              <Text style={commonStyles.text}>{student.address}</Text>
            </View>
          )}

          {student.dateOfBirth && (
            <View style={{ marginTop: 12 }}>
              <Text style={commonStyles.textSecondary}>{t('dateOfBirth')}</Text>
              <Text style={commonStyles.text}>{student.dateOfBirth}</Text>
            </View>
          )}
        </View>

        {/* Health Information */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>स्वास्थ्य जानकारी</Text>

          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={commonStyles.textSecondary}>{t('weight')}</Text>
              <Text style={commonStyles.text}>{student.weight || 'N/A'} kg</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={commonStyles.textSecondary}>{t('height')}</Text>
              <Text style={commonStyles.text}>{student.height || 'N/A'} cm</Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={commonStyles.textSecondary}>{t('nutritionStatus')}</Text>
            <View
              style={{
                backgroundColor: getNutritionStatusColor(nutritionStatus),
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                alignSelf: 'flex-start',
                marginTop: 4,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                {t(nutritionStatus)}
              </Text>
            </View>
          </View>
        </View>

        {/* Attendance Statistics */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>{t('attendance')}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.primary }]}>
                {attendanceStats.percentage}%
              </Text>
              <Text style={commonStyles.textSecondary}>उपस्थिति दर</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.success }]}>
                {attendanceStats.present}
              </Text>
              <Text style={commonStyles.textSecondary}>उपस्थित दिन</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.textSecondary }]}>
                {attendanceStats.total}
              </Text>
              <Text style={commonStyles.textSecondary}>कुल दिन</Text>
            </View>
          </View>
        </View>

        {/* Immunization Status */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>{t('immunization')}</Text>

          {student.immunizationStatus && student.immunizationStatus.length > 0 ? (
            student.immunizationStatus.map((vaccine) => (
              <View key={vaccine.id} style={[commonStyles.row, { marginTop: 12 }]}>
                <View style={commonStyles.column}>
                  <Text style={commonStyles.text}>{vaccine.vaccineName}</Text>
                  <Text style={commonStyles.textSecondary}>
                    दिया गया: {new Date(vaccine.dateGiven).toLocaleDateString('hi-IN')}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor:
                      vaccine.status === 'completed'
                        ? colors.success
                        : vaccine.status === 'pending'
                        ? colors.warning
                        : colors.danger,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                    {vaccine.status === 'completed' ? 'पूर्ण' : vaccine.status === 'pending' ? 'बकाया' : 'देर से'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
              कोई टीकाकरण रिकॉर्ड नहीं मिला
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Button
            text="विवरण संपादित करें"
            onPress={() => {
              router.push({
                pathname: '/students/add',
                params: { editId: student.id },
              });
            }}
            style={buttonStyles.primary}
          />

          <Button
            text="उपस्थिति दर्ज करें"
            onPress={() => router.push('/attendance')}
            style={[buttonStyles.primary, { marginTop: 10 }]}
          />

          <Button
            text="टीकाकरण रिकॉर्ड जोड़ें" // Corrected text
            onPress={() => {
              // FIX: Link to the immunization entry screen
              router.push({
                  pathname: '/students/immunization', 
                  params: { studentId: student.id } 
              });
            }}
            style={[buttonStyles.primary, { marginTop: 10 }]}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
