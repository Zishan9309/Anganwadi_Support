import { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export interface Profile {
  _id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  anganwadiCenterName: string;
  district: string;
  state: string;
  awwId: string;
  language: "hindi" | "english";
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = "@anganwadi:profile";

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthConfig = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getAuthConfig();
      const res = await axios.get(`${API_URL}/profiles`, config);
      const data: Profile = res.data;
      setProfile(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log("✅ Fetched profile:", data.name);
    } catch (err: any) {
      console.log("❌ Error fetching profile:", err);
      setError(err.response?.data?.error || "Failed to fetch profile");
      try {
        const localData = await AsyncStorage.getItem(STORAGE_KEY);
        if (localData) {
          setProfile(JSON.parse(localData));
          console.log("📱 Loaded profile from cache");
        }
      } catch (cacheErr) {
        console.error("Cache error:", cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (
    profileData: Omit<Profile, "_id" | "createdAt" | "updatedAt">
  ) => {
    setError(null);
    try {
      const config = await getAuthConfig();
      const res = await axios.post(`${API_URL}/profiles`, profileData, config);
      const saved: Profile = res.data;
      setProfile(saved);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      console.log("✅ Saved profile:", saved.name);
      return saved;
    } catch (err: any) {
      console.log("❌ Error saving profile:", err);
      setError(err.response?.data?.error || "Failed to save profile");
      const offlineProfile: Profile = {
        ...profileData,
        _id: `offline_${Date.now()}`,
        userId: "temp",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(offlineProfile);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(offlineProfile));
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, saveProfile, refetch: fetchProfile };
};
