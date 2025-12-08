import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    StyleSheet,
    Platform 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import { commonStyles, colors, buttonStyles } from '../../../styles/commonStyles';
import { useLanguage } from '../../../hooks/useLanguage';
import { useStudents } from '../../../hooks/useStudents';
import Header from '../../../components/Header';
import Button from '../../../components/Button';
import { ImmunizationRecord, Student } from '../../../types';

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).replace(/\//g, '/');
};

const VACCINE_LIST = [
    { name: "BCG", due: "Birth" },
    { name: "OPV 0", due: "Birth" },
    { name: "Hepatitis B", due: "Birth" },
    { name: "Pentavalent 1", due: "6 weeks" },
    { name: "PCV 1", due: "6 weeks" },
    { name: "Rotavirus 1", due: "6 weeks" },
    { name: "Pentavalent 2", due: "10 weeks" },
    { name: "OPV 2", due: "10 weeks" },
    { name: "Pentavalent 3", due: "14 weeks" },
    { name: "OPV 3", due: "14 weeks" },
    { name: "Measles 1", due: "9 months" },
    { name: "DPT Booster", due: "16-24 months" },
];

export default function ImmunizationScreen() {
    const { t } = useLanguage();
    const { studentId } = useLocalSearchParams<{ studentId: string }>();
    const { getStudentById, updateStudent } = useStudents();
    
    const [student, setStudent] = useState<Student | null>(null);
    
    // Added 'status' field to state
    const [newVaccine, setNewVaccine] = useState({
        vaccineName: '',
        dateGiven: formatDate(new Date()),
        status: 'pending' as 'completed' | 'pending', // Default to pending for planning
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    useEffect(() => {
        if (studentId) {
            const foundStudent = getStudentById(studentId);
            setStudent(foundStudent || null);
            if (foundStudent) {
                const nextPending = VACCINE_LIST.find(v => !foundStudent.immunizationStatus?.some(rec => rec.vaccineName === v.name));
                if (nextPending) {
                    setNewVaccine(prev => ({ ...prev, vaccineName: nextPending.name }));
                }
            }
        }
    }, [studentId]);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios' ? true : false); 
        if (selectedDate) {
            setNewVaccine(prev => ({ 
                ...prev, 
                dateGiven: formatDate(selectedDate) 
            }));
        }
    };

    const handleAddVaccine = async () => {
        if (!newVaccine.vaccineName || !newVaccine.dateGiven || !student) {
            Alert.alert(t('error'), 'कृपया सभी आवश्यक फ़ील्ड भरें।');
            return;
        }

        const newRecord: ImmunizationRecord = {
            id: Date.now().toString(),
            vaccineName: newVaccine.vaccineName,
            dateGiven: newVaccine.dateGiven,
            status: newVaccine.status, // Use selected status
        };
        
        const isDuplicate = student.immunizationStatus?.some(r => r.vaccineName === newRecord.vaccineName);
        if (isDuplicate) {
             Alert.alert(t('error'), `${newRecord.vaccineName} पहले ही दर्ज किया जा चुका है।`);
             return;
        }

        try {
            const updatedRecords = [...(student.immunizationStatus || []), newRecord];
            await updateStudent(student.id, { immunizationStatus: updatedRecords });
            Alert.alert(t('success'), 'रिकॉर्ड सफलतापूर्वक जोड़ा गया।');
            router.back();
        } catch (error) {
            console.error('Error updating immunization:', error);
            Alert.alert(t('error'), 'रिकॉर्ड सेव करने में त्रुटि हुई।');
        }
    };

    if (!student) return null;
    
    const givenVaccines = student.immunizationStatus?.map(v => v.vaccineName) || [];
    const pendingVaccines = VACCINE_LIST.filter(v => !givenVaccines.includes(v.name));

    return (
        <View style={commonStyles.container}>
            <Header title={`टीकाकरण: ${student.name}`} showBack />

            <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                
                {/* Add New Vaccine Form */}
                <View style={commonStyles.card}>
                    <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>नया टीका शेड्यूल करें</Text>
                    
                    {/* Vaccine Picker */}
                    <Text style={commonStyles.textSecondary}>टीके का नाम *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={newVaccine.vaccineName}
                            onValueChange={(itemValue: string) => setNewVaccine(prev => ({ ...prev, vaccineName: itemValue }))}
                            style={styles.picker}
                        >
                            <Picker.Item label="टीका चुनें" value="" style={{ color: colors.textSecondary }} />
                            {VACCINE_LIST.map((v) => (
                                <Picker.Item 
                                    key={v.name} 
                                    label={v.name} 
                                    value={v.name} 
                                    enabled={!givenVaccines.includes(v.name)}
                                />
                            ))}
                        </Picker>
                    </View>

                    {/* Status Picker - NEW */}
                    <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>स्थिति (Status) *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={newVaccine.status}
                            onValueChange={(itemValue: string) => setNewVaccine(prev => ({ ...prev, status: itemValue as any }))}
                            style={styles.picker}
                        >
                            <Picker.Item label="बकाया (Pending)" value="pending" />
                            <Picker.Item label="पूर्ण (Completed)" value="completed" />
                        </Picker>
                    </View>

                    {/* Date Picker */}
                    <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>तिथि (देय/दी गई) *</Text>
                    <TouchableOpacity 
                        style={styles.dateTouchable}
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={{ color: newVaccine.dateGiven ? colors.text : colors.textSecondary }}>
                            {newVaccine.dateGiven || "तिथि चुनें (DD/MM/YYYY)"}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}
                </View>

                <View style={{ marginTop: 20, marginBottom: 40 }}>
                    <Button 
                        text={t('confirm') || 'पुष्टि करें'} 
                        onPress={handleAddVaccine} 
                        style={buttonStyles.primary} 
                    />
                </View>
                
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.backgroundAlt,
        marginVertical: 8,
        overflow: 'hidden',
    },
    picker: { height: 50, width: '100%', color: colors.text },
    dateTouchable: {
        ...commonStyles.input,
        justifyContent: 'center',
    }
});