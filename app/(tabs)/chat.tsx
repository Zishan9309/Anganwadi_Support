import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { useLanguage } from '../../hooks/useLanguage';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import { ChatMessage } from '../../types';

// 🔑 API CONFIGURATION
// REPLACE THIS STRING WITH YOUR ACTUAL GROQ API KEY
const GROQ_API_KEY = "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"; 
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `
You are Anganwadi Sahayak, an expert AI assistant for Anganwadi Workers (AWWs) in India.
Your goal is to provide accurate, simple, and actionable advice on:
1. Maternal & Child Health (Nutrition, Immunization, ANC/PNC).
2. Government Schemes (Poshan Abhiyaan, PMMVY, ICDS).
3. Early Childhood Care & Education (ECCE).
4. Daily Operations (Register maintenance, Growth monitoring).

Tone: Respectful, Encouraging, Professional, and Simple.
Language: Reply in the same language as the user (English, Hindi, or Hinglish).
Important: If you don't know an answer, say "Please consult your supervisor or MO." Do not make up medical advice.
`;

export default function ChatScreen() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasInitialized = useRef(false);

  // Initialize Greeting
  useEffect(() => {
    if (!hasInitialized.current) {
        const initialMessage: ChatMessage = {
            id: '1',
            text: language === 'hindi' 
                ? 'नमस्ते! मैं आपकी आंगनवाड़ी सहायिका हूँ। पोषण, टीकाकरण या योजनाओं के बारे में कुछ भी पूछें।'
                : 'Namaste! I am your Anganwadi Sahayak. Ask me about nutrition, immunization, or schemes.',
            isUser: false,
            timestamp: new Date().toISOString(),
            language: language,
        };
        setMessages([initialMessage]);
        hasInitialized.current = true;
    }
  }, [language]);

  useEffect(() => {
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // 🤖 AI FETCH FUNCTION
  const fetchAIResponse = async (userQuery: string) => {
    try {
        console.log("Sending request to Groq..."); // Debug Log

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Using the model from your HTML file
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    // Pass conversation history for context (last 5 messages)
                    ...messages.slice(-5).map(m => ({ 
                        role: m.isUser ? "user" : "assistant", 
                        content: m.text 
                    })),
                    { role: "user", content: userQuery }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();

        // Check for API errors specifically
        if (!response.ok) {
            console.error("Groq API Error Response:", data);
            return `⚠️ Error: ${data.error?.message || "Unknown API error"}`;
        }

        if (data.error) {
            console.error("API returned error object:", data.error);
            return "⚠️ तकनीकी समस्या आ रही है (Technical Issue). Please check API Key.";
        }

        return data.choices?.[0]?.message?.content || "No response received.";

    } catch (error) {
        console.error("Network/Fetch Error:", error);
        return "⚠️ नेटवर्क त्रुटि (Network Error). Please check your internet connection.";
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessageText = inputText.trim();
    const currentLanguage = language;

    // 1. Add User Message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date().toISOString(),
      language: currentLanguage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // 2. Fetch AI Response
    const aiText = await fetchAIResponse(userMessageText);

    // 3. Add AI Message
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: aiText,
      isUser: false,
      timestamp: new Date().toISOString(),
      language: currentLanguage,
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  return (
    <KeyboardAvoidingView 
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title={t('chatAssistantTitle')} />
      
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, padding: 20 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={{
              alignSelf: message.isUser ? 'flex-end' : 'flex-start',
              backgroundColor: message.isUser ? colors.primary : '#E3F2FD', 
              padding: 12,
              borderRadius: 16,
              marginVertical: 6,
              maxWidth: '80%',
              borderBottomRightRadius: message.isUser ? 0 : 16,
              borderBottomLeftRadius: message.isUser ? 16 : 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text style={{
              color: message.isUser ? '#FFFFFF' : colors.text,
              fontSize: 16,
              lineHeight: 22,
            }}>
              {message.text}
            </Text>
            <Text style={{
              color: message.isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary,
              fontSize: 10,
              marginTop: 4,
              alignSelf: 'flex-end'
            }}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.typingText}>Anganwadi Sahayak is typing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('askQuestion')}
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
        
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          activeOpacity={0.7}
          disabled={isTyping}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 10
    },
    typingText: {
        marginLeft: 8,
        color: colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic'
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center', 
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        color: colors.text,
        marginRight: 10,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: colors.border
    },
    sendButton: {
        backgroundColor: colors.primary,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    }
});
