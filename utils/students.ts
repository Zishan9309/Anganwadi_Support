import api from './api';

export interface AttendanceRecord {
  id: string;
  date: string;
  present: boolean;
  mealProvided: boolean;
  activities: string[];
}

export interface Student {
  _id: string;  // Backend uses _id
  id?: string;  // Alias for your UI (student.id)
  profileId: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  parentName: string;
  weight?: number;
  height?: number;
  dateOfBirth?: string;
  address?: string;
  attendanceRecords: AttendanceRecord[];
  // Add other records as needed (nutrition, etc.)
  createdAt?: string;
  updatedAt?: string;
}

export const getStudents = async (): Promise<Student[]> => {
  const response = await api.get('/students');
  // Alias _id to id for your UI compatibility
  return response.data.map((s: Student) => ({ ...s, id: s._id }));
};

export const createStudent = async (student: Omit<Student, '_id' | 'id' | 'attendanceRecords' | 'createdAt' | 'updatedAt'> & { profileId: string }): Promise<Student> => {
  const response = await api.post('/students', {
    ...student,
    attendanceRecords: [],  // Initialize empty
  });
  return { ...response.data, id: response.data._id };
};

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<Student> => {
  const response = await api.put(`/students/${id}`, updates);
  return { ...response.data, id: response.data._id };
};

export const deleteStudent = async (id: string): Promise<void> => {
  await api.delete(`/students/${id}`);
};