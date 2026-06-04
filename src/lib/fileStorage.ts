import { supabase } from './supabase';

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/webm',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const uploadFile = async (file: File, userId: string): Promise<{ path: string; error?: Error } | null> => {
  if (file.size > MAX_FILE_SIZE) {
    return { path: '', error: new Error('File too large. Max 50MB.') };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { path: '', error: new Error('File type not allowed.') };
  }

  const path = `${userId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('note-attachments')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) {
    return { path: '', error };
  }

  return { path };
};

export const downloadFile = async (storagePath: string): Promise<Blob | null> => {
  const { data, error } = await supabase.storage
    .from('note-attachments')
    .download(storagePath);

  if (error) {
    console.error('Download error:', error);
    return null;
  }

  return data;
};

export const getPublicUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('note-attachments')
    .getPublicUrl(storagePath);

  return data.publicUrl;
};

export const deleteFile = async (storagePath: string): Promise<boolean> => {
  const { error } = await supabase.storage
    .from('note-attachments')
    .remove([storagePath]);

  return !error;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
