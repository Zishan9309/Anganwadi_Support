import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import { commonStyles, colors, buttonStyles } from '../../../styles/commonStyles';
import { useLanguage } from '../../../hooks/useLanguage';
import { useStudents } from '../../../hooks/useStudents';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import { Student } from '../../../types';

// Helper to format Date object to DD/MM/YYYY string
const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).replace(/\//g, '/');
};

// Specific styles for the date input area
const localStyles = StyleSheet.create({
    dateTouchable: {
        ...commonStyles.input,
        justifyContent: 'center',
        minHeight: 50, // Ensure touch target size
    },
    genderContainer: {
        flexDirection: 'row',
        marginVertical: 8,
    },
    genderButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    genderButtonSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    genderButtonUnselected: {
        backgroundColor: colors.backgroundAlt,
        borderColor: colors.border,
    }
});

export default function AddStudentScreen() {
  const { t } = useLanguage();
  // Destructure all needed functions from the hook
  const { addStudent, updateStudent, getStudentById, refreshStudents } = useStudents();
  const params = useLocalSearchParams();
  const editId = params.editId as string | undefined;
  
  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    age: undefined,
    gender: 'male',
    parentName: '',
    parentPhoneNumber: '',
    weight: undefined,
    height: undefined,
    dateOfBirth: '',
    address: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!editId);

  // Load data if in Edit Mode
  useEffect(() => {
    if (editId) {
        const existingStudent = getStudentById(editId);
        if (existingStudent) {
            setFormData({
                ...existingStudent,
                age: existingStudent.age,
                weight: existingStudent.weight || undefined,
                height: existingStudent.height || undefined,
                parentPhoneNumber: existingStudent.parentPhoneNumber || '',
            });
            setIsEditMode(true);
        } else {
            Alert.alert(t('error'), 'छात्र की जानकारी नहीं मिली।');
            router.back();
        }
    }
  }, [editId]);
    
  // Handle Date Picker Selection
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios' ? true : false); 
    if (selectedDate) {
      setFormData(prev => ({ 
        ...prev, 
        dateOfBirth: formatDate(selectedDate) 
      }));
    }
  };
    
  // Save Handler with VALIDATION
  const handleSave = async () => {
    const { name, age, parentName, dateOfBirth, parentPhoneNumber } = formData;

    // 1. Required Fields Check
    if (!name?.trim() || !parentName?.trim() || !age || !dateOfBirth?.trim() || !parentPhoneNumber?.trim()) {
      Alert.alert(t('error'), 'कृपया सभी आवश्यक फ़ील्ड भरें (नाम, माता-पिता, मोबाइल नंबर, उम्र, जन्म तिथि)।');
      return;
    }
    
    // 2. Name Validation (String only, no numbers)
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        Alert.alert(t('error'), 'नाम में केवल अक्षर और स्थान ही अनुमत हैं।');
        return;
    }
    
    // 3. Age Validation (Positive integer)
    const numericAge = Number(age);
    if (isNaN(numericAge) || numericAge <= 0 || !Number.isInteger(numericAge)) {
        Alert.alert(t('error'), 'कृपया मान्य उम्र (पूर्ण संख्या) दर्ज करें।');
        return;
    }

    // 4. Phone Validation (Exactly 10 digits)
    if (!/^\d{10}$/.test(parentPhoneNumber)) {
        Alert.alert(t('error'), 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।');
        return;
    }
    
    // 5. Weight/Height Validation (Numeric)
    const numericWeight = formData.weight ? Number(formData.weight) : undefined;
    const numericHeight = formData.height ? Number(formData.height) : undefined;
    
    if ((formData.weight && isNaN(Number(formData.weight))) || (formData.height && isNaN(Number(formData.height)))) {
        Alert.alert(t('error'), 'वजन और लंबाई संख्यात्मक होने चाहिए।');
        return;
    }
    
    setIsLoading(true);
    
    // Prepare Data Object
    const studentData: Partial<Student> = {
        ...formData,
        age: numericAge,
        weight: numericWeight,
        height: numericHeight,
        name: name.trim(),
        parentName: parentName.trim(),
        parentPhoneNumber: parentPhoneNumber.trim(),
        dateOfBirth: dateOfBirth,
        gender: formData.gender || 'male',
        address: formData.address || '',
        immunizationStatus: formData.immunizationStatus || [],
        attendanceRecords: formData.attendanceRecords || [],
        nutritionRecords: formData.nutritionRecords || [],
        healthRecords: formData.healthRecords || [],
    } as Partial<Student>;

    try {
        if (isEditMode && editId) {
            // Update Existing
            await updateStudent(editId, studentData);
            Alert.alert(t('success'), 'छात्र का विवरण सफलतापूर्वक अपडेट हुआ');
        } else {
            // Create New
            await addStudent(studentData as Omit<Student, "id" | "createdAt" | "updatedAt" | "profileId">);
            Alert.alert(t('success'), 'छात्र सफलतापूर्वक जोड़ा गया');
        }
        
      // Refresh global list and go back
      await refreshStudents();
      router.back();
    } catch (error) {
      console.log('Error saving student:', error);
      Alert.alert(t('error'), 'त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <Header title={isEditMode ? 'छात्र संपादित करें' : t('addStudent')} showBack />
      <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        <View style={commonStyles.card}>
          
          {/* Name Input */}
          <Text style={commonStyles.subtitle}>{t('studentName')} *</Text>
          <TextInput 
            style={commonStyles.input} 
            value={formData.name} 
            onChangeText={(text) => setFormData({ ...formData, name: text })} 
            placeholder="छात्र का नाम (केवल अक्षर)" 
            placeholderTextColor={colors.textSecondary}
          />

          {/* Parent Name Input */}
          <Text style={commonStyles.subtitle}>{t('parentName')} *</Text>
          <TextInput 
            style={commonStyles.input} 
            value={formData.parentName} 
            onChangeText={(text) => setFormData({ ...formData, parentName: text })} 
            placeholder="माता/पिता का नाम" 
            placeholderTextColor={colors.textSecondary}
          />

          {/* Parent Phone Number */}
          <Text style={commonStyles.subtitle}>अभिभावक का मोबाइल नंबर *</Text>
          <TextInput 
            style={commonStyles.input} 
            value={formData.parentPhoneNumber} 
            onChangeText={(text) => setFormData({ ...formData, parentPhoneNumber: text.replace(/[^0-9]/g, '') })} 
            placeholder="10 अंकों का मोबाइल नंबर" 
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric" 
            maxLength={10} 
          />

          {/* Age Input */}
          <Text style={commonStyles.subtitle}>{t('age')} (वर्षों में) *</Text>
          <TextInput 
            style={commonStyles.input} 
            value={formData.age?.toString() || ''} 
            onChangeText={(text) => setFormData({ ...formData, age: text ? Number(text.replace(/[^0-9]/g, '')) : undefined })} 
            placeholder="उम्र" 
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric" 
            maxLength={2} 
          />
          
          {/* Date of Birth Picker */}
          <Text style={commonStyles.subtitle}>{t('dateOfBirth')} *</Text>
          <TouchableOpacity 
              style={localStyles.dateTouchable}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
          >
              <Text style={{ color: formData.dateOfBirth ? colors.text : colors.textSecondary }}>
                  {formData.dateOfBirth || "जन्म तिथि चुनें (DD/MM/YYYY)"}
              </Text>
          </TouchableOpacity>
          
          {/* Render DatePicker conditionally */}
          {showDatePicker && (
              <DateTimePicker
                  value={formData.dateOfBirth ? new Date(formData.dateOfBirth.split('/').reverse().join('-')) : new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={onDateChange}
              />
          )}

          {/* Gender Selection */}
          <Text style={commonStyles.subtitle}>{t('gender')} *</Text>
          <View style={localStyles.genderContainer}>
            {['male', 'female'].map((g) => (
                <TouchableOpacity 
                    key={g} 
                    style={[
                        localStyles.genderButton, 
                        formData.gender === g ? localStyles.genderButtonSelected : localStyles.genderButtonUnselected,
                        g === 'male' ? { marginRight: 8 } : { marginLeft: 8 }
                    ]} 
                    onPress={() => setFormData({ ...formData, gender: g as any })}
                >
                    <Text style={{ 
                        color: formData.gender === g ? '#FFFFFF' : colors.text,
                        fontWeight: 'bold' 
                    }}>
                        {g === 'male' ? t('male') : t('female')}
                    </Text>
                </TouchableOpacity>
            ))}
          </View>

          {/* Weight Input */}
          <Text style={commonStyles.subtitle}>{t('weight')} (kg)</Text>
          <TextInput 
            style={commonStyles.input} 
            value={formData.weight?.toString() || ''} 
            onChangeText={(text) => setFormData({ ...formData, weight: text ? Number(text.replace(/[^0-9.]/g, '')) : undefined })} 
            placeholder="वजन (उदा. 12.5)" 
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric" 
          />

          {/* Height Input */}
          <Text style={commonStyles.subtitle}>{t('height')} (cm)</Text>
          <TextInput 
            style={commonStyles.input} 
            value={formData.height?.toString() || ''} 
            onChangeText={(text) => setFormData({ ...formData, height: text ? Number(text.replace(/[^0-9.]/g, '')) : undefined })} 
            placeholder="लंबाई (उदा. 95.0)" 
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric" 
          />

          {/* Address Input */}
          <Text style={commonStyles.subtitle}>{t('address')}</Text>
          <TextInput 
            style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]} 
            value={formData.address} 
            onChangeText={(text) => setFormData({ ...formData, address: text })} 
            placeholder="पूरा पता" 
            placeholderTextColor={colors.textSecondary}
            multiline 
          />
        </View>

        {/* Action Buttons */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Button 
            text={isLoading ? t('loading') : (isEditMode ? 'अपडेट करें' : t('save'))} 
            onPress={handleSave} 
            style={buttonStyles.primary} 
          />
          <Button 
            text={t('cancel')} 
            onPress={() => router.back()} 
            style={[buttonStyles.backButton, { marginTop: 10 }]} 
            textStyle={{ color: colors.text }} 
          />
        </View>
      </ScrollView>
    </View>
  );
}