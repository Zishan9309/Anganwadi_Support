import { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Student, ImmunizationRecord } from "../types"; // ✅ Fixed: Imported ImmunizationRecord
import { API_URL } from "../config/api";
import { useProfile } from "./useProfile"; 
import { router } from 'expo-router'; 

const STORAGE_KEY = '@anganwadi:students';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false); 

  const { profile, loading: profileLoading } = useProfile();

  // Helper: Add auth token to Axios config
  const getAuthConfig = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  };

  // ✅ Fetch all students
  const loadStudents = async () => {
    if (hasLoaded) return; // Prevent infinite loops if data is already loaded

    if (!profile?._id) { 
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const config = await getAuthConfig();
      const res = await axios.get(`${API_URL}/students`, config);
      // Explicitly type 'data' as Student[] to match state
      const data: Student[] = res.data.map((s: any) => ({ ...s, id: s._id })); 
      setStudents(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('✅ Fetched students from API:', data.length);
    } catch (error: any) {
      // Silent error log to prevent console spam
      setError(error.response?.data?.error || 'Failed to fetch students');
      
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 404) {
          // Only clear if it's a hard auth/validation error
          await AsyncStorage.removeItem(STORAGE_KEY);
      }

      try {
        const localData = await AsyncStorage.getItem(STORAGE_KEY);
        if (localData) {
          const cached = JSON.parse(localData);
          setStudents(cached);
        }
      } catch (cacheErr) {
        console.error('Cache error:', cacheErr);
      }
    } finally {
      setIsLoading(false);
      setHasLoaded(true); // This flag prevents the loop
    }
  };

  useEffect(() => {
    if (!profileLoading && profile?._id && !hasLoaded) { 
      loadStudents();
    }
  }, [profile, profileLoading, hasLoaded]);


  // ✅ NEW: Confirm Vaccination Function (Fixed Red Underlines)
  const confirmVaccination = async (studentId: string, vaccineId: string) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const currentImmunization = student.immunizationStatus || [];

      // FIX 1: Explicitly type the array and use 'as const' for the literal type
      // This tells TypeScript: "Trust me, 'confirmed' is a valid status string"
      const updatedImmunization: ImmunizationRecord[] = currentImmunization.map(record => 
          record.id === vaccineId 
            ? { ...record, status: 'confirmed' as const } 
            : record
      );

      // FIX 2: Cast the payload to Partial<Student> to satisfy TypeScript
      await updateStudent(studentId, { immunizationStatus: updatedImmunization } as Partial<Student>);
  };


  // ✅ Add student
  const addStudent = async (student: Omit<Student, "id" | "createdAt" | "updatedAt">) => {
    if (!profile?._id) throw new Error("Profile missing");
    const profileId = profile._id;

    try {
      const config = await getAuthConfig();
      const studentWithProfile = { ...student, profileId };
      const res = await axios.post(`${API_URL}/students`, studentWithProfile, config);
      const saved = { ...res.data, id: res.data._id };
      
      setStudents((prev) => {
        const newStudents = [...prev, saved];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStudents));
        return newStudents;
      });
      return saved;
    } catch (error: any) {
      console.log("❌ Error adding student:", error);
      setError(error.response?.data?.error || 'Failed to add student');
      
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 404) {
          await AsyncStorage.multiRemove([STORAGE_KEY, 'auth_token', 'user']);
          router.replace('/login');
      }
      throw error;
    }
  };

  // ✅ Update student
  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const config = await getAuthConfig();
      const res = await axios.put(`${API_URL}/students/${id}`, updates, config);
      const updated = { ...res.data, id: res.data._id };
      
      setStudents((prev) => {
        const newStudents = prev.map((s) => (s.id === id ? updated : s));
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStudents));
        return newStudents;
      });
      return updated;
    } catch (error: any) {
      console.log("❌ Error updating student:", error);
      setError(error.response?.data?.error || 'Failed to update student');
      
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 404) {
          await AsyncStorage.multiRemove([STORAGE_KEY, 'auth_token', 'user']);
          router.replace('/login');
      }
      throw error;
    }
  };

  // ✅ Delete student
  const deleteStudent = async (id: string) => {
    try {
      const config = await getAuthConfig();
      await axios.delete(`${API_URL}/students/${id}`, config);
      
      setStudents((prev) => {
        const newStudents = prev.filter((s) => s.id !== id);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStudents));
        return newStudents;
      });
    } catch (error: any) {
      console.log("❌ Error deleting student:", error);
      setError(error.response?.data?.error || 'Failed to delete student');
      
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 404) {
          await AsyncStorage.multiRemove([STORAGE_KEY, 'auth_token', 'user']);
          router.replace('/login');
      }
      throw error;
    }
  };

  const getStudentById = (id: string) => students.find((s) => s.id === id);

  return {
    students,
    isLoading: isLoading || profileLoading, 
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    refreshStudents: () => { setHasLoaded(false); loadStudents(); }, // Manual refresh resets the flag
    confirmVaccination, // ✅ Exported correctly
  };
};