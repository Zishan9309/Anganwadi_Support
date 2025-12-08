
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { commonStyles, colors } from '../../styles/commonStyles';
import { useLanguage } from '../../hooks/useLanguage';
import Header from '../../components/Header';
import Icon from '../../components/Icon';
import { ChatMessage } from '../../types';

export default function ChatScreen() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: language === 'hindi' 
        ? 'नमस्ते! मैं आपका आंगनवाड़ी सहायक हूं। मैं आपकी सरकारी योजनाओं, पोषण, स्वास्थ्य और शिक्षा संबंधी सहायता कर सकता हूं।'
        : 'Hello! I am your Anganwadi Assistant. I can help you with government schemes, nutrition, health, and education related queries.',
      isUser: false,
      timestamp: new Date().toISOString(),
      language: language,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Hindi responses
    if (language === 'hindi') {
      if (lowerMessage.includes('पोषण') || lowerMessage.includes('खाना') || lowerMessage.includes('भोजन')) {
        return 'बच्चों के लिए संतुलित आहार बहुत महत्वपूर्ण है। दाल, चावल, सब्जी, फल और दूध शामिल करें। 6 महीने बाद ठोस आहार शुरू करें। कुपोषण के लक्षण दिखने पर तुरंत डॉक्टर से संपर्क करें।';
      }
      
      if (lowerMessage.includes('टीका') || lowerMessage.includes('वैक्सीन') || lowerMessage.includes('इम्यूनाइजेशन')) {
        return 'टीकाकरण बच्चों के लिए अत्यंत आवश्यक है। जन्म के समय BCG, OPV, Hepatitis B दें। 6 सप्ताह में DPT, OPV, Hib दें। 9 महीने में खसरा का टीका दें। टीकाकरण चार्ट का पालन करें।';
      }
      
      if (lowerMessage.includes('योजना') || lowerMessage.includes('स्कीम') || lowerMessage.includes('सरकारी')) {
        return 'मुख्य सरकारी योजनाएं: 1) ICDS - एकीकृत बाल विकास सेवा 2) पोषण अभियान - कुपोषण मुक्ति 3) मध्याह्न भोजन योजना 4) जननी सुरक्षा योजना 5) आयुष्मान भारत। अधिक जानकारी के लिए अपने सुपरवाइजर से संपर्क करें।';
      }
      
      if (lowerMessage.includes('उपस्थिति') || lowerMessage.includes('अटेंडेंस')) {
        return 'नियमित उपस्थिति बच्चों के विकास के लिए जरूरी है। रोज उपस्थिति दर्ज करें। अनुपस्थित बच्चों के माता-पिता से संपर्क करें। उपस्थिति रिकॉर्ड को सुरक्षित रखें और मासिक रिपोर्ट तैयार करें।';
      }
      
      if (lowerMessage.includes('स्वास्थ्य') || lowerMessage.includes('हेल्थ')) {
        return 'बच्चों की नियमित स्वास्थ्य जांच कराएं। वजन और लंबाई मापें। बीमारी के लक्षण दिखने पर तुरंत चिकित्सक से संपर्क करें। साफ-सफाई का विशेष ध्यान रखें। हाथ धोने की आदत डलवाएं।';
      }
      
      return 'मैं आपकी सहायता करने के लिए यहां हूं। आप मुझसे पोषण, टीकाकरण, सरकारी योजनाओं, स्वास्थ्य और शिक्षा के बारे में पूछ सकते हैं।';
    }
    
    // English responses
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('food') || lowerMessage.includes('meal')) {
      return 'Balanced nutrition is crucial for children. Include dal, rice, vegetables, fruits, and milk. Start solid food after 6 months. Consult doctor immediately if signs of malnutrition appear.';
    }
    
    if (lowerMessage.includes('vaccine') || lowerMessage.includes('immunization')) {
      return 'Vaccination is essential for children. Give BCG, OPV, Hepatitis B at birth. Give DPT, OPV, Hib at 6 weeks. Give measles vaccine at 9 months. Follow the immunization chart.';
    }
    
    if (lowerMessage.includes('scheme') || lowerMessage.includes('government')) {
      return 'Main government schemes: 1) ICDS - Integrated Child Development Services 2) POSHAN Abhiyan 3) Mid Day Meal Scheme 4) Janani Suraksha Yojana 5) Ayushman Bharat. Contact your supervisor for more information.';
    }
    
    return 'I am here to help you. You can ask me about nutrition, vaccination, government schemes, health, and education.';
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
      language: language,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText.trim()),
        isUser: false,
        timestamp: new Date().toISOString(),
        language: language,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={{
              alignSelf: message.isUser ? 'flex-end' : 'flex-start',
              backgroundColor: message.isUser ? colors.primary : colors.card,
              padding: 12,
              borderRadius: 16,
              marginVertical: 4,
              maxWidth: '80%',
              borderWidth: message.isUser ? 0 : 1,
              borderColor: colors.border,
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
              fontSize: 12,
              marginTop: 4,
            }}>
              {new Date(message.timestamp).toLocaleTimeString('hi-IN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        ))}
        
        {isTyping && (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.card,
              padding: 12,
              borderRadius: 16,
              marginVertical: 4,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>
              टाइप कर रहा है...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={{
        flexDirection: 'row',
        padding: 20,
        backgroundColor: colors.backgroundAlt,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'flex-end',
      }}>
        <TextInput
          style={[
            commonStyles.input,
            {
              flex: 1,
              marginVertical: 0,
              marginRight: 12,
              maxHeight: 100,
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('askQuestion')}
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
        
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={sendMessage}
          activeOpacity={0.7}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
