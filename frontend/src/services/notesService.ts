import api from './api';
import { Note } from '@/lib/type';

export const notesService = {
  getNotes: (subdomain: string) => 
    api.get<Note[]>(`/notes/${subdomain}`),
  
  createNote: (data: Partial<Note>) => 
    api.post<Note>('/notes', data),
  
  updateNote: (id: string, data: Partial<Note>) => 
    api.patch<Note>(`/notes/${id}`, data),
  
  updatePosition: (id: string, position: { x: number, y: number }) =>
    api.patch<Note>(`/notes/${id}/position`, position),
  
  markAsRead: (id: string) => 
    api.patch<Note>(`/notes/${id}/read`),
  
  deleteNote: (id: string) => 
    api.delete(`/notes/${id}`),
};

