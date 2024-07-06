import axios from 'axios';
import { Task, UpdateTask } from './types';

const API_URL = 'http://localhost:5000/tasks';

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  const response = await axios.get(`${API_URL}?userId=${userId}`);
  return response.data;
};

export const addTask = async (task: Task): Promise<Task> => {
  const response = await axios.post(API_URL, task);
  return response.data;
};

export const updateTask = async ({ taskId, updatedTask }: UpdateTask): Promise<Task> => {
  const response = await axios.patch(`${API_URL}/${taskId}`, updatedTask);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
