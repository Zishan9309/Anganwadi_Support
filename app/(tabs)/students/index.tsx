
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { commonStyles, colors } from '../../../styles/commonStyles';
import { useLanguage } from '../../../hooks/useLanguage';
import { useStudents } from '../../../hooks/useStudents';
import Header from '../../../components/Header';
import StudentCard from '../../../components/StudentCard';
import Icon from '../../../components/Icon';

export default function StudentsScreen() {
  const { t } = useLanguage();
  const { students } = useStudents();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.parentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={commonStyles.container}>
      <Header 
        title={t('students')}
        rightAction={{
          icon: 'add',
          onPress: () => router.push('/students/add'),
        }}
      />
      
      <View style={{ padding: 20, flex: 1 }}>
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flex: 1, position: 'relative' }}>
            <TextInput
              style={[commonStyles.input, { paddingLeft: 40 }]}
              placeholder={t('search')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
            <Icon
              name="search-outline"
              size={20}
              color={colors.textSecondary}
              style={{ position: 'absolute', left: 12, top: 16 }}
            />
          </View>
        </View>

        {/* Students List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredStudents.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Icon name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 16 }]}>
                {searchQuery ? 'कोई छात्र नहीं मिला' : 'अभी तक कोई छात्र नहीं जोड़ा गया'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[commonStyles.card, { marginTop: 20, alignItems: 'center', paddingVertical: 20 }]}
                  onPress={() => router.push('/students/add')}
                  activeOpacity={0.7}
                >
                  <Icon name="add-circle-outline" size={32} color={colors.primary} />
                  <Text style={[commonStyles.text, { marginTop: 8, color: colors.primary }]}>
                    {t('addStudent')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
