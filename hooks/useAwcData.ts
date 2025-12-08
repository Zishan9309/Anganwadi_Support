import { useState, useEffect } from 'react'; // FIXED: Corrected import syntax
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export interface AWCRecord {
    _id: string;
    slNo: number;
    district: string;
    operationalAwc2024: number;
    children2024: number;
    // Add other year fields as needed
}

const STORAGE_KEY = '@anganwadi:awcdata';

export const useAwcData = () => {
    const [data, setData] = useState<AWCRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAwcData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            };
            
            // Hitting the new endpoint: /api/awcdata
            const res = await axios.get(`${API_URL}/awcdata`, config);
            const fetchedData: AWCRecord[] = res.data;
            setData(fetchedData);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedData));
            console.log(`✅ Fetched ${fetchedData.length} AWC records.`);
        } catch (err: any) {
            console.log('❌ Error fetching AWC data:', err);
            setError(err.message);
            // Load from cache on failure
            try {
                const localData = await AsyncStorage.getItem(STORAGE_KEY);
                if (localData) {
                    setData(JSON.parse(localData));
                    console.log('📱 Loaded AWC data from cache.');
                }
            } catch (cacheErr) {
                console.error('AWC Cache error:', cacheErr);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAwcData();
    }, []);

    return { awcData: data, isLoading, error, refetchAwcData: fetchAwcData };
};
