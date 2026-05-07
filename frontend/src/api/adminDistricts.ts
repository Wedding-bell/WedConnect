import { apiClient } from "./client";

export interface District {
  id: number;
  name: string;
  state: number;
  state_name?: string;
}

export const fetchDistricts = async (): Promise<District[]> => {
  const { data } = await apiClient.get<District[]>('api/v1/vendors/districts/');
  return data;
};
