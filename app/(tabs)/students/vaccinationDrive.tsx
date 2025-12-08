import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    StyleSheet, 
    Linking, 
    Platform, 
    RefreshControl 
} from 'react-native';
import { useFocusEffect } from 'expo-router'; 

import { commonStyles, colors } from '../../../styles/commonStyles';
import { useStudents } from '../../../hooks/useStudents';
import Header from '../../../components/Header';
import Icon from '../../../components/Icon';
import { API_URL } from '../../../config/api';

export default function VaccinationDriveScreen() {
    const { students, refreshStudents, isLoading } = useStudents();
    const [refreshing, setRefreshing] = useState(false);
    const [messagesSent, setMessagesSent] = useState<{ [key: string]: boolean }>({});

    useFocusEffect(
        useCallback(() => {
            refreshStudents();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshStudents();
        setRefreshing(false);
    };

    // Filter students who have ANY relevant activity
    const studentsWithPendingVaccines = students.filter(s => 
        s.immunizationStatus && s.immunizationStatus.some(v => v.status === 'pending' || v.status === 'overdue' || v.status === 'confirmed')
    );

    const handleSendMessage = async (studentId: string, vaccineId: string, parentPhone: string | undefined, studentName: string, vaccineName: string) => {
        if (!parentPhone || parentPhone.trim() === '') {
            Alert.alert(
                "मोबाइल नंबर नहीं मिला", 
                "इस छात्र का मोबाइल नंबर उपलब्ध नहीं है। कृपया छात्र प्रोफाइल अपडेट करें।"
            );
            return;
        }

        const baseUrl = API_URL.replace(/\/api\/?$/, ''); 
        const verificationLink = `${baseUrl}/verify-view/${studentId}/${vaccineId}`;

        const message = `नमस्ते, ${studentName} के लिए ${vaccineName} का टीका लगवाना बाकी है। कृपया आंगनवाड़ी आएं। पुष्टि करने के लिए यहाँ क्लिक करें: ${verificationLink}`;

        const separator = Platform.OS === 'ios' ? '&' : '?';
        const smsUrl = `sms:${parentPhone}${separator}body=${encodeURIComponent(message)}`;

        try {
            await Linking.openURL(smsUrl);
            setMessagesSent(prev => ({ ...prev, [`${studentId}-${vaccineId}`]: true }));
        } catch (err) {
            Alert.alert("Error", "SMS ऐप नहीं खुल सका।");
        }
    };

    return (
        <View style={commonStyles.container}>
            <Header title="टीकाकरण ड्राइव" showBack />
            <ScrollView 
                style={{ flex: 1, padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
            >
                <View style={styles.infoBox}>
                    <Icon name="information-circle-outline" size={24} color={colors.primary} />
                    <Text style={styles.infoText}>
                        नीचे दी गई सूची में "SMS भेजें" पर क्लिक करें। (प्राथमिकता: बकाया टीके)
                    </Text>
                </View>

                {studentsWithPendingVaccines.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={commonStyles.text}>कोई भी टीका बकाया नहीं है।</Text>
                    </View>
                ) : (
                    studentsWithPendingVaccines.map(student => {
                        // First, try to find a vaccine that needs action (Pending or Overdue)
                        let targetVaccine = student.immunizationStatus.find(v => v.status === 'pending' || v.status === 'overdue');
                        
                        // If no pending vaccine found, THEN look for a confirmed one to show success
                        if (!targetVaccine) {
                            targetVaccine = student.immunizationStatus.find(v => v.status === 'confirmed');
                        }

                        // If still nothing found (shouldn't happen due to filter), skip
                        if (!targetVaccine) return null;

                        // FIX: Fallback to '_id' if 'id' is undefined (handles MongoDB records correctly)
                        const vaccineId = targetVaccine.id || (targetVaccine as any)._id;

                        const messageKey = `${student.id}-${vaccineId}`;
                        const isMsgSent = messagesSent[messageKey];
                        const isConfirmed = targetVaccine.status === 'confirmed';
                        const hasPhone = student.parentPhoneNumber && student.parentPhoneNumber.length > 0;

                        return (
                            <View key={student.id} style={[styles.card, isConfirmed && styles.cardConfirmed]}>
                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.name}>{student.name}</Text>
                                        <Text style={styles.detail}>टीका: {targetVaccine.vaccineName}</Text>
                                        <Text style={styles.detail}>
                                            संपर्क: <Text style={{ fontWeight: 'bold', color: hasPhone ? colors.text : colors.danger }}>
                                                {hasPhone ? student.parentPhoneNumber : "N/A"}
                                            </Text>
                                        </Text>
                                        {/* Show status label for clarity */}
                                        <Text style={[styles.statusLabel, isConfirmed ? {color: colors.success} : {color: colors.warning}]}>
                                            स्थिति: {isConfirmed ? "पूर्ण (Verified)" : "बकाया (Pending)"}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.actionArea}>
                                        {isConfirmed ? (
                                            // ✅ STATE 3: VERIFIED
                                            <View style={styles.confirmedBadge}>
                                                <Icon name="checkbox" size={32} color={colors.success} />
                                            </View>
                                        ) : isMsgSent ? (
                                            // ⏳ STATE 2: SENT
                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={styles.waitingText}>संदेश भेजा गया</Text>
                                                <TouchableOpacity onPress={() => handleSendMessage(student.id, vaccineId, student.parentPhoneNumber, student.name, targetVaccine!.vaccineName)}>
                                                    <Text style={styles.resendLink}>पुनः भेजें</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            // ✉️ STATE 1: READY
                                            <TouchableOpacity 
                                                style={[styles.sendButton, !hasPhone && styles.disabledButton]} 
                                                onPress={() => handleSendMessage(student.id, vaccineId, student.parentPhoneNumber, student.name, targetVaccine!.vaccineName)}
                                                disabled={!hasPhone}
                                            >
                                                <Icon name="chatbox-ellipses-outline" size={20} color="#FFF" />
                                                <Text style={styles.sendButtonText}>SMS भेजें</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    infoBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 10, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
    infoText: { flex: 1, marginLeft: 10, color: colors.text, fontSize: 12 },
    emptyState: { alignItems: 'center', marginTop: 50 },
    card: { backgroundColor: colors.card, padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: colors.border, elevation: 2 },
    cardConfirmed: { borderColor: colors.success, backgroundColor: '#F1F8E9' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    detail: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    statusLabel: { fontSize: 12, marginTop: 4, fontWeight: '600' },
    actionArea: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 100 },
    sendButton: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 5 },
    disabledButton: { backgroundColor: '#BDBDBD' },
    sendButtonText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
    waitingText: { color: colors.accent, fontSize: 12, fontStyle: 'italic', marginBottom: 5 },
    confirmedBadge: { flexDirection: 'column', alignItems: 'center' },
    confirmedText: { color: colors.success, fontWeight: 'bold', fontSize: 12, marginTop: 2 },
    resendLink: { fontSize: 10, color: 'blue', textDecorationLine: 'underline' }
});