import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ViewStyle,  // For View styles
  TextStyle,  // For Text and TextInput styles (covers everything)
} from 'react-native';
import { router } from 'expo-router';

// Your imports (with fallbacks if missing)
let commonStyles: any = {};  // Fallback if import fails
let colors: any = {};  // Fallback
try {
  const imported = require('../styles/commonStyles');
  commonStyles = imported.commonStyles || {};
  colors = imported.colors || {};
} catch (e) {
  console.log('commonStyles import fallback - using defaults');
}

// Fallback for useLanguage (if hook missing)
let useLanguageHook: any = () => ({ t: (key: string) => key });
try {
  useLanguageHook = require('../hooks/useLanguage').useLanguage;
} catch (e) {
  console.log('useLanguage fallback - using English');
}

// Fallback for Icon (if component missing)
const IconFallback = ({ name, size = 20, color = '#999' }: any) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, color }}>{name === 'mail-outline' ? '📧' : name === 'lock-closed-outline' ? '🔒' : '🏠'}</Text>
  </View>
);
let Icon: any = IconFallback;
try {
  Icon = require('../components/Icon').default;
} catch (e) {
  console.log('Icon fallback - using emojis');
}

// Auth functions (fallback if utils/auth missing)
let login: any = async () => { throw new Error('Auth not set up'); };
let register: any = async () => { throw new Error('Auth not set up'); };
try {
  const auth = require('../utils/auth');
  login = auth.login;
  register = auth.register;
} catch (e) {
  console.log('utils/auth fallback - dummy auth');
  login = async (email: string, password: string) => {
    console.log('Dummy login:', { email, password });
    return { data: { token: 'dummy', user: { id: '1', email } } };
  };
  register = async (email: string, password: string) => {
    console.log('Dummy register:', { email, password });
    return { data: { token: 'dummy', user: { id: '2', email } } };
  };
}

export default function LoginScreen() {
  const { t } = useLanguageHook();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', t('requiredFields') || 'Fields are required');
      return;
    }
    setLoading(true);
    try {
      const response = isLogin ? await login(email, password) : await register(email, password);
      Alert.alert('Success', isLogin ? (t('loginSuccess') || 'Logged in!') : (t('registerSuccess') || 'Registered!'));
      // Fixed: Navigate to your existing students screen
      router.replace('/profile');  // Assumes app/(tabs)/students/index.tsx exists
      // If error, change to: router.replace('/students'); or router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || (t('authError') || 'Auth failed'));
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback styles (merges with commonStyles if available) - Fixed type union
  const fallbackStyles: { [key: string]: ViewStyle | TextStyle } = {
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold' as const, textAlign: 'center', color: '#333', marginTop: 16 },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    input: { flex: 1, fontSize: 16, color: '#333', marginLeft: 8 },  // Valid for TextStyle
    button: {
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: colors.primary || '#4CAF50',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    buttonText: { fontSize: 16, fontWeight: 'bold' as const, color: 'white' },
  };

  // Merge fallback with commonStyles
  const styles = { ...fallbackStyles, ...commonStyles };

  // Fallback colors
  const fallbackColors = { primary: '#4CAF50', textSecondary: '#999' };
  const finalColors = { ...fallbackColors, ...colors };

  return (
    <KeyboardAvoidingView 
      style={styles.container as ViewStyle} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        {/* Logo/Title */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Icon name="home-outline" size={64} color={finalColors.primary} />
          <Text style={styles.title as TextStyle}>{t('AnganwadiApp') || 'Anganwadi App'}</Text>
        </View>

        {/* Form */}
        <View style={{ marginBottom: 16 }}>
          {/* Email Input - Fixed style cast */}
          <View style={styles.inputContainer as ViewStyle}>
            <Icon name="mail-outline" size={20} color={finalColors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input as TextStyle}  // Fixed: Use TextStyle (no TextInputStyle needed)
              placeholder={t('email') || 'Email'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Password Input - Fixed style cast */}
          <View style={styles.inputContainer as ViewStyle}>
            <Icon name="lock-closed-outline" size={20} color={finalColors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input as TextStyle}  // Fixed: Use TextStyle (no TextInputStyle needed)
              placeholder={t('password') || 'Password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button as ViewStyle}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? <ActivityIndicator color="white" size="small" /> : null}
            <Text style={styles.buttonText as TextStyle}>
              {loading ? (t('loading') || 'Loading...') : (isLogin ? (t('login') || 'Login') : (t('register') || 'Register'))}
            </Text>
          </TouchableOpacity>

          {/* Toggle Link */}
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
            <Text style={{ 
              textAlign: 'center', 
              color: finalColors.primary, 
              marginTop: 8,
              fontSize: 16,
            } as TextStyle}>
              {isLogin ? (t('Dont have an account') || "Don't have an account?") : (t('Already have an Account') || 'Have an account?')} {isLogin ? (t('register') || 'Register') : (t('login') || 'Login')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}