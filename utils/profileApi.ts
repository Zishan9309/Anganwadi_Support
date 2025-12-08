// Anganwadi/utils/profileApi.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { AWWProfile } from '../types'; // Ensure this type is available

// Helper to get Auth config
export const getAuthConfig = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    };
};

// Renamed from 'fetchProfile' to 'getProfileAPI' to match the screen's import.
// This is used in app/profile.tsx to fetch an existing profile by its server ID.
export const getProfileAPI = async (id: string): Promise<AWWProfile> => {
    const config = await getAuthConfig();
    const res = await axios.get(`${API_URL}/profiles/${id}`, config);
    return res.data;
};

// Renamed from 'saveProfile' to 'createProfileAPI' to match the screen's import.
// This is used for the initial creation of the profile.
export const createProfileAPI = async (profileData: Partial<AWWProfile>): Promise<AWWProfile> => {
    const config = await getAuthConfig();
    const res = await axios.post(`${API_URL}/profiles`, profileData, config);
    return res.data;
};

// Added/Renamed update function to match the screen's import.
// This is used for updating an existing profile.
export const updateProfileAPI = async (id: string, updates: Partial<AWWProfile>): Promise<AWWProfile> => {
    const config = await getAuthConfig();
    const res = await axios.put(`${API_URL}/profiles/${id}`, updates, config);
    return res.data;
};