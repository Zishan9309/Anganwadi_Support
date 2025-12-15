import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router'; // Import useFocusEffect
import { commonStyles, colors } from '../../styles/commonStyles';
import Header from '../../components/Header';
import { API_URL } from '../../config/api';

export default function ImageGalleryScreen() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Use useFocusEffect to refresh the list every time you navigate to this screen
    // This ensures that after you upload a photo in Camera screen and come here, 
    // the new photo appears immediately.
    useFocusEffect(
        useCallback(() => {
            fetchImages();
        }, [])
    );

    const fetchImages = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('auth_token');
            // Ensure this endpoint matches your backend route for "Get All Images"
            const res = await axios.get(`${API_URL}/images`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setImages(res.data);
        } catch (error) {
            console.error("Error fetching gallery:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={commonStyles.container}>
            <Header title="Gallery" showBack />
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={colors.primary}/></View>
            ) : (
                <FlatList 
                    data={images}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image source={{ uri: item.imageData }} style={styles.image} />
                            <View style={styles.info}>
                                <Text style={styles.date}>{new Date(item.capturedAt).toLocaleString()}</Text>
                                {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.center}>
                             <Text style={styles.empty}>No images uploaded yet.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    card: { marginHorizontal: 20, marginTop: 20, backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', elevation: 3 },
    image: { width: '100%', height: 250 },
    info: { padding: 10 },
    date: { color: colors.text, fontWeight: 'bold', fontSize: 14 },
    notes: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
    empty: { textAlign: 'center', color: colors.textSecondary, fontSize: 16 }
});