import { supabase } from './supabase';

export async function uploadFileToSupabase(
  bucket: string,
  filePath: string,
  base64Data: string,
  contentType: string
): Promise<string> {
  // Convert base64 to Blob
  const base64Parts = base64Data.split(',');
  const mimeMatch = base64Parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : contentType;
  const rawData = window.atob(base64Parts[1] || base64Parts[0]);
  const uInt8Array = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    uInt8Array[i] = rawData.charCodeAt(i);
  }
  
  const blob = new Blob([uInt8Array], { type: mimeType });

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      upsert: true,
      contentType: mimeType
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
