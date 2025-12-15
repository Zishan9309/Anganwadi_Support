import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { API_URL } from '../../config/api';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Icon from '../../components/Icon';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    
    const [lastImage, setLastImage] = useState<any>(null); // For viewing previous image
    const [capturedImage, setCapturedImage] = useState<string | null>(null); // For preview URI
    const [capturedBase64, setCapturedBase64] = useState<string | null>(null); // For upload data
    
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchLatestImage();
    }, []);

    const fetchLatestImage = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const res = await axios.get(`${API_URL}/images/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLastImage(res.data);
        } catch (error) {
            console.log("Error fetching image", error);
        } finally {
            setIsLoading(false);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                // Request base64 explicitly
                const photo = await cameraRef.current.takePictureAsync({ 
                    base64: true, 
                    quality: 0.5 
                });
                
                if (photo) {
                    setCapturedImage(photo.uri);
                    // Store the base64 string for upload
                    setCapturedBase64(photo.base64 || null);
                    setIsCameraOpen(false); // Close camera view to show preview
                }
            } catch (error) {
                Alert.alert("Error", "Failed to take picture.");
            }
        }
    };

    const uploadImage = async () => {
        if (!capturedBase64) {
             Alert.alert("Error", "No image data found. Please retake the photo.");
             return;
        }

        setIsUploading(true);
        try {
            const token = await AsyncStorage.getItem('auth_token');
            
            // Format the base64 string for the backend (standard data URI format)
            const base64Data = `data:image/jpeg;base64,${capturedBase64}`; 

            await axios.post(`${API_URL}/images/upload`, {
                imageData: base64Data,
                capturedAt: new Date(),
                notes: "Anganwadi Visit"
            }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            Alert.alert("Success", "Image uploaded successfully!");
            
            // Reset state
            setCapturedImage(null);
            setCapturedBase64(null);
            
            // Refresh the view to show the new image
            fetchLatestImage(); 
        } catch (error) {
            console.error("Upload failed", error);
            Alert.alert("Error", "Upload failed. Check your connection.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isCameraOpen) {
        if (!permission?.granted) {
            return (
                <View style={styles.permissionContainer}>
                    <Text style={styles.text}>Camera permission is required.</Text>
                    <Button text="Grant Permission" onPress={requestPermission} style={buttonStyles.primary} />
                    <Button text="Cancel" onPress={() => setIsCameraOpen(false)} style={[buttonStyles.secondary, {marginTop: 10}]} />
                </View>
            );
        }
        return (
            <View style={styles.fullScreen}>
                <CameraView style={styles.camera} ref={cameraRef}>
                    {/* Controls Overlay (Sibling, NOT Child) */}
                    <View style={styles.cameraControls}>
                         <TouchableOpacity onPress={() => setIsCameraOpen(false)} style={styles.closeBtn}>
                            <Icon name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    }

    return (
        <View style={commonStyles.container}>
            <Header title="Image Upload" showBack />
            
            <ScrollView style={{ flex: 1, padding: 20 }}>
                {/* 1. Preview Captured Image (If taking a new one) */}
                {capturedImage ? (
                    <View style={styles.card}>
                         <Text style={styles.label}>New Capture Preview:</Text>
                         <View style={{position: 'relative'}}>
                            <Image source={{ uri: capturedImage }} style={styles.image} />
                            <View style={styles.overlay}>
                                <Text style={styles.overlayText}>{new Date().toLocaleString()}</Text>
                            </View>
                         </View>
                         <View style={styles.row}>
                            <Button text="Retake" onPress={() => { setCapturedImage(null); setCapturedBase64(null); setIsCameraOpen(true); }} style={[buttonStyles.secondary, {flex:1, marginRight:5}]} />
                            <Button 
                                text={isUploading ? "Uploading..." : "Upload"} 
                                onPress={uploadImage} 
                                style={[buttonStyles.primary, {flex:1, marginLeft:5}]} 
                            />
                         </View>
                    </View>
                ) : (
                    <>
                        {/* 2. Show Previous Image */}
                        <View style={styles.card}>
                            <Text style={styles.label}>Previous Upload:</Text>
                            {isLoading ? (
                                <ActivityIndicator size="large" color={colors.primary} />
                            ) : lastImage ? (
                                <>
                                    <Image source={{ uri: lastImage.imageData }} style={styles.image} />
                                    <View style={styles.infoContainer}>
                                        <Text style={styles.dateText}>📅 {new Date(lastImage.capturedAt).toLocaleString()}</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.placeholder}>
                                    <Icon name="image-outline" size={50} color={colors.textSecondary} />
                                    <Text style={commonStyles.textSecondary}>No image uploaded yet.</Text>
                                </View>
                            )}
                        </View>

                        {/* 3. Upload Button at Bottom */}
                        <View style={{ marginTop: 20 }}>
                            <Button 
                                text="Click to Upload Image" 
                                onPress={() => setIsCameraOpen(true)} 
                                style={buttonStyles.primary} 
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreen: { flex: 1, backgroundColor: 'black' },
    camera: { flex: 1 },
    // Controls overlay logic (Absolute positioning)
    cameraControls: { 
        position: 'absolute', 
        bottom: 50, 
        left: 0, 
        right: 0, 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 10 
    },
    captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
    closeBtn: { position: 'absolute', top: -500, right: 20, zIndex: 20 }, // Adjusted based on layout
    permissionContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
    card: { backgroundColor: 'white', borderRadius: 10, padding: 15, elevation: 3, marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
    image: { width: '100%', height: 250, borderRadius: 8, backgroundColor: '#eee', resizeMode: 'cover' },
    placeholder: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8 },
    infoContainer: { marginTop: 10 },
    dateText: { color: colors.textSecondary, fontSize: 12, marginBottom: 2 },
    row: { flexDirection: 'row', marginTop: 15 },
    overlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    overlayText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    text: { fontSize: 16, color: colors.text, marginBottom: 20, textAlign: 'center' }
});