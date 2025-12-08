import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { AWWProfile } from '../types';
import { getProfileAPI, createProfileAPI, updateProfileAPI } from '../utils/profileApi'; 

const PROFILE_STORAGE_KEY = 'aww_profile';
const SERVER_PROFILE_ID_KEY = 'aww_server_profile_id';

export default function ProfileScreen() {
  const { t, language, changeLanguage } = useLanguage();
  const [profile, setProfile] = useState<AWWProfile>({
    id: '1',
    name: '',
    phoneNumber: '',
    anganwadiCenterName: '',
    district: '',
    state: '',
    awwId: '',
    language: 'hindi',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode if profile is likely empty

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const serverId = await AsyncStorage.getItem(SERVER_PROFILE_ID_KEY);
      if (serverId) {
        const serverProfile = await getProfileAPI(serverId);
        if (serverProfile) {
          setProfile({
            id: (serverProfile as any)._id || serverProfile.id || '1',
            name: serverProfile.name || '',
            phoneNumber: serverProfile.phoneNumber || '',
            anganwadiCenterName: serverProfile.anganwadiCenterName || '',
            district: serverProfile.district || '',
            state: serverProfile.state || '',
            awwId: serverProfile.awwId || '',
            language: serverProfile.language || 'hindi',
          });
          setIsEditing(false); // If profile loaded, switch to viewing mode
          return;
        }
      }

      const savedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      Alert.alert(t('error'), 'कृपया अपना नाम दर्ज करें');
      return;
    }

    setIsLoading(true);
    let creationSuccessful = false;

    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

      const serverId = await AsyncStorage.getItem(SERVER_PROFILE_ID_KEY);

      if (serverId) {
        await updateProfileAPI(serverId, {
          name: profile.name,
          phoneNumber: profile.phoneNumber,
          anganwadiCenterName: profile.anganwadiCenterName,
          district: profile.district,
          state: profile.state,
          awwId: profile.awwId,
          language: profile.language,
        });
        Alert.alert(t('success'), 'प्रोफाइल सफलतापूर्वक अपडेट हुआ');
      } else {
        const created = await createProfileAPI({
          name: profile.name,
          phoneNumber: profile.phoneNumber,
          anganwadiCenterName: profile.anganwadiCenterName,
          district: profile.district,
          state: profile.state,
          awwId: profile.awwId,
          language: profile.language,
        });

        if (created && (created as any)._id) {
          await AsyncStorage.setItem(SERVER_PROFILE_ID_KEY, (created as any)._id); 
          creationSuccessful = true;
        }
        Alert.alert(t('success'), 'प्रोफाइल सफलतापूर्वक सेव की गई');
      }

      setIsEditing(false);
      
      // CRITICAL FIX: After ANY successful save (update or creation), redirect 
      // the user to the main app dashboard using router.replace.
      // This prevents the GO_BACK error.
      router.replace('/(tabs)/home'); 
      
    } catch (error: any) {
      console.log('Error saving profile to server:', error?.message || error);
      Alert.alert(t('error'), 'प्रोफाइल सेव करने में त्रुटि हुई — यह स्थानीय रूप से सेव की गई है।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage: 'hindi' | 'english') => {
    await changeLanguage(newLanguage);
    setProfile(prev => ({ ...prev, language: newLanguage }));
  };

  return (
    <View style={commonStyles.container}>
      <Header
        title={t('profile')}
        showBack
        rightAction={{
          icon: isEditing ? 'close' : 'create-outline',
          onPress: () => setIsEditing(!isEditing),
        }}
      />

      <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={commonStyles.card}>
          <View style={commonStyles.row}>
            <Icon name="person-circle-outline" size={32} color={colors.primary} />
            <Text style={[commonStyles.subtitle, { marginLeft: 12 }]}>{t('personalInfo')}</Text>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={commonStyles.textSecondary}>नाम</Text>
            {isEditing ? (
              <TextInput
                style={commonStyles.input}
                value={profile.name}
                onChangeText={text => setProfile({ ...profile, name: text })}
                placeholder="आपका पूरा नाम"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={commonStyles.text}>{profile.name || 'नाम दर्ज नहीं किया गया'}</Text>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={commonStyles.textSecondary}>फोन नंबर</Text>
            {isEditing ? (
              <TextInput
                style={commonStyles.input}
                value={profile.phoneNumber}
                onChangeText={text => setProfile({ ...profile, phoneNumber: text })}
                placeholder="मोबाइल नंबर"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={commonStyles.text}>{profile.phoneNumber || 'फोन नंबर दर्ज नहीं किया गया'}</Text>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={commonStyles.textSecondary}>AWW ID</Text>
            {isEditing ? (
              <TextInput
                style={commonStyles.input}
                value={profile.awwId}
                onChangeText={text => setProfile({ ...profile, awwId: text })}
                placeholder="आंगनवाड़ी कार्यकर्ता ID"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={commonStyles.text}>{profile.awwId || 'AWW ID दर्ज नहीं की गई'}</Text>
            )}
          </View>
        </View>

        {/* Anganwadi Information */}
        <View style={commonStyles.card}>
          <View style={commonStyles.row}>
            <Icon name="business-outline" size={32} color={colors.primary} />
            <Text style={[commonStyles.subtitle, { marginLeft: 12 }]}>{t('anganwadiInfo')}</Text>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={commonStyles.textSecondary}>{t('centerName')}</Text>
            {isEditing ? (
              <TextInput
                style={commonStyles.input}
                value={profile.anganwadiCenterName}
                onChangeText={text => setProfile({ ...profile, anganwadiCenterName: text })}
                placeholder="आंगनवाड़ी केंद्र का नाम"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={commonStyles.text}>{profile.anganwadiCenterName || 'केंद्र का नाम दर्ज नहीं किया गया'}</Text>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={commonStyles.textSecondary}>{t('district')}</Text>
            {isEditing ? (
              <TextInput
                style={commonStyles.input}
                value={profile.district}
                onChangeText={text => setProfile({ ...profile, district: text })}
                placeholder="जिला"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={commonStyles.text}>{profile.district || 'जिला दर्ज नहीं किया गया'}</Text>
            )}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={commonStyles.textSecondary}>{t('state')}</Text>
            {isEditing ? (
              <TextInput
                style={commonStyles.input}
                value={profile.state}
                onChangeText={text => setProfile({ ...profile, state: text })}
                placeholder="राज्य"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={commonStyles.text}>{profile.state || 'राज्य दर्ज नहीं किया गया'}</Text>
            )}
          </View>
        </View>

        {/* Language Settings */}
        <View style={commonStyles.card}>
          <View style={commonStyles.row}>
            <Icon name="language-outline" size={32} color={colors.primary} />
            <Text style={[commonStyles.subtitle, { marginLeft: 12 }]}>{t('language')}</Text>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity
              style={[
                { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, marginRight: 8, alignItems: 'center' },
                language === 'hindi'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
              ]}
              onPress={() => handleLanguageChange('hindi')}
              activeOpacity={0.7}
            >
              <Text style={{ color: language === 'hindi' ? '#FFFFFF' : colors.text, fontWeight: 'bold' }}>
                हिंदी
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, marginLeft: 8, alignItems: 'center' },
                language === 'english'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
              ]}
              onPress={() => handleLanguageChange('english')}
              activeOpacity={0.7}
            >
              <Text style={{ color: language === 'english' ? '#FFFFFF' : colors.text, fontWeight: 'bold' }}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={{ marginTop: 20, marginBottom: 40 }}>
            <Button text={isLoading ? t('loading') : t('save')} onPress={saveProfile} style={buttonStyles.primary} />
          </View>
        )}

        <View style={{ height: 40 }} />

        {/* Debug API */}
        <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
          API: {Platform.OS === 'android' ? '10.0.2.2:5000' : 'localhost:5000'}
        </Text>
      </ScrollView>
    </View>
  );
}
