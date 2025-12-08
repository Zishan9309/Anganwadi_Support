import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useLanguage } from '../hooks/useLanguage';
import Button from '../components/Button';

export default function WelcomeScreen() {
  const { t, isLoading: isLanguageLoading } = useLanguage();
  // We use null to indicate that the check has not yet started.
  const [isAuthAttempted, setIsAuthAttempted] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuthAndRedirect = async () => {
        try {
            const token = await AsyncStorage.getItem("auth_token");

            if (mounted) {
                if (token) {
                    // User is authenticated, go to home
                    router.replace('/(tabs)/home');
                } else {
                    // Not authenticated, go to login
                    router.replace('/login');
                }
            }
        } catch (error) {
            console.error("Auth check failed during splash:", error);
            if (mounted) router.replace('/login');
        } finally {
            if (mounted) setIsAuthAttempted(true);
        }
    };

    // Delay initialization slightly to let navigation stack fully mount
    // This is safer than trying to redirect on the very first frame.
    const timer = setTimeout(() => {
        checkAuthAndRedirect();
    }, 100); // 100ms delay is usually sufficient for stability

    return () => {
        mounted = false;
        clearTimeout(timer);
    };
  }, []);

  // If the language is still loading OR we are waiting for the auth check, show the loader.
  if (isLanguageLoading || isAuthAttempted === null) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.title}>आंगनवाड़ी</Text>
        <Text style={commonStyles.text}>{t('loading')}</Text>
      </View>
    );
  }

  // If we reach this point (i.e., auth check failed to redirect immediately,
  // possibly due to a deep error), we still show the splash screen.
  return (
    <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200&h=200&fit=crop&crop=center' }}
        style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 30 }}
        resizeMode="cover"
      />
      
      <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 10 }]}>
        आंगनवाड़ी सहायक ऐप
      </Text>
      
      <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 30 }]}>
        बच्चों के स्वास्थ्य और विकास के लिए आपका डिजिटल साथी
      </Text>
      
      <View style={{ width: '100%', maxWidth: 300 }}>
        <Button
          text="शुरू करें"
          onPress={() => router.replace('/(tabs)/home')}
          style={buttonStyles.primary}
        />
      </View>
      
      <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 20 }]}>
        स्वचालित रूप से होम स्क्रीन पर जा रहे हैं...
      </Text>
    </View>
  );
}
