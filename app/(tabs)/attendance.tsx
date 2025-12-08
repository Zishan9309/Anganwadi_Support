
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useLanguage } from '../../hooks/useLanguage';
import { useStudents } from '../../hooks/useStudents';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { AttendanceRecord } from '../../types';

export default function AttendanceScreen() {
  const { t } = useLanguage();
  const { students, updateStudent } = useStudents();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: {present: boolean, mealProvided: boolean}}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing attendance for selected date
    const dateAttendance: {[key: string]: {present: boolean, mealProvided: boolean}} = {};
    
    students.forEach(student => {
      const existingRecord = student.attendanceRecords?.find(record => record.date === selectedDate);
      dateAttendance[student.id] = {
        present: existingRecord?.present || false,
        mealProvided: existingRecord?.mealProvided || false,
      };
    });
    
    setAttendanceData(dateAttendance);
  }, [selectedDate, students]);

  const toggleAttendance = (studentId: string, field: 'present' | 'mealProvided') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: !prev[studentId]?.[field],
      }
    }));
  };

  const saveAttendance = async () => {
    setIsLoading(true);
    
    try {
      for (const student of students) {
        const attendance = attendanceData[student.id];
        if (!attendance) continue;

        // Remove existing record for this date
        const updatedRecords = student.attendanceRecords?.filter(record => record.date !== selectedDate) || [];
        
        // Add new record
        const newRecord: AttendanceRecord = {
          id: `${student.id}_${selectedDate}`,
          date: selectedDate,
          present: attendance.present,
          mealProvided: attendance.mealProvided,
          activities: [],
        };
        
        updatedRecords.push(newRecord);
        
        await updateStudent(student.id, {
          attendanceRecords: updatedRecords,
        });
      }
      
      Alert.alert(t('success'), 'उपस्थिति सफलतापूर्वक सेव की गई');
    } catch (error) {
      console.log('Error saving attendance:', error);
      Alert.alert(t('error'), 'उपस्थिति सेव करने में त्रुटि हुई');
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayStats = () => {
    let present = 0, meals = 0;
    Object.values(attendanceData).forEach(data => {
      if (data?.present) present++;
      if (data?.mealProvided) meals++;
    });
    return { present, meals };
  };

  const stats = getTodayStats();

  return (
    <View style={commonStyles.container}>
      <Header title={t('attendance')} />
      
      <View style={{ padding: 20, flex: 1 }}>
        {/* Date and Stats */}
        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>
            {new Date(selectedDate).toLocaleDateString('hi-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.success }]}>{stats.present}</Text>
              <Text style={commonStyles.textSecondary}>{t('present')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.accent }]}>{stats.meals}</Text>
              <Text style={commonStyles.textSecondary}>{t('mealProvided')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.textSecondary }]}>{students.length - stats.present}</Text>
              <Text style={commonStyles.textSecondary}>{t('absent')}</Text>
            </View>
          </View>
        </View>

        {/* Students List */}
        <ScrollView style={{ flex: 1, marginTop: 20 }} showsVerticalScrollIndicator={false}>
          {students.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Icon name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 16 }]}>
                कोई छात्र नहीं मिला
              </Text>
            </View>
          ) : (
            students.map((student) => {
              const attendance = attendanceData[student.id] || { present: false, mealProvided: false };
              
              return (
                <View key={student.id} style={commonStyles.card}>
                  <View style={commonStyles.row}>
                    <View style={commonStyles.column}>
                      <Text style={commonStyles.subtitle}>{student.name}</Text>
                      <Text style={commonStyles.textSecondary}>
                        {t('age')}: {student.age} | {t('gender')}: {t(student.gender)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', marginTop: 12, justifyContent: 'space-around' }}>
                    <TouchableOpacity
                      style={[
                        {
                          flex: 1,
                          padding: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          marginRight: 8,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        },
                        attendance.present
                          ? { backgroundColor: colors.success, borderColor: colors.success }
                          : { backgroundColor: colors.backgroundAlt, borderColor: colors.border }
                      ]}
                      onPress={() => toggleAttendance(student.id, 'present')}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={attendance.present ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={20}
                        color={attendance.present ? '#FFFFFF' : colors.textSecondary}
                      />
                      <Text style={{
                        color: attendance.present ? '#FFFFFF' : colors.text,
                        marginLeft: 8,
                        fontWeight: 'bold'
                      }}>
                        {t('present')}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        {
                          flex: 1,
                          padding: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          marginLeft: 8,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        },
                        attendance.mealProvided
                          ? { backgroundColor: colors.accent, borderColor: colors.accent }
                          : { backgroundColor: colors.backgroundAlt, borderColor: colors.border }
                      ]}
                      onPress={() => toggleAttendance(student.id, 'mealProvided')}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={attendance.mealProvided ? 'restaurant' : 'restaurant-outline'}
                        size={20}
                        color={attendance.mealProvided ? '#FFFFFF' : colors.textSecondary}
                      />
                      <Text style={{
                        color: attendance.mealProvided ? '#FFFFFF' : colors.text,
                        marginLeft: 8,
                        fontWeight: 'bold'
                      }}>
                        भोजन
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Save Button */}
        {students.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Button
              text={isLoading ? t('loading') : t('saveAttendance')}
              onPress={saveAttendance}
              style={buttonStyles.primary}
            />
          </View>
        )}
      </View>
    </View>
  );
}
