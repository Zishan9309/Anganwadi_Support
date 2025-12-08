import api from './api';

export interface Profile {
  _id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  anganwadiCenterName: string;
  district: string;
  state: string;
  awwId: string;
  language: 'hindi' | 'english';
  createdAt?: string;
  updatedAt?: string;
}

export const createProfile = async (profile: Omit<Profile, '_id' | 'createdAt' | 'updatedAt'>): Promise<Profile> => {
  const response = await api.post('/profiles', profile);
  return response.data;
};

export const getProfile = async (id: string): Promise<Profile> => {
  const response = await api.get(`/profiles/${id}`);
  return response.data;
};

export const updateProfile = async (id: string, updates: Partial<Profile>): Promise<Profile> => {
  const response = await api.put(`/profiles/${id}`, updates);
  return response.data;
};