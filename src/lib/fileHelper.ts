import { MessageAttachment } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function detectAttachmentCategory(file: File): 'image' | 'audio' | 'video' | 'document' | 'other' {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg') || name.endsWith('.m4a')) return 'audio';
  if (mime.startsWith('video/') || name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov')) return 'video';
  if (
    mime.startsWith('text/') ||
    mime.includes('pdf') ||
    mime.includes('json') ||
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    name.endsWith('.txt') ||
    name.endsWith('.md') ||
    name.endsWith('.pdf') ||
    name.endsWith('.py') ||
    name.endsWith('.ts') ||
    name.endsWith('.tsx') ||
    name.endsWith('.js') ||
    name.endsWith('.jsx') ||
    name.endsWith('.json') ||
    name.endsWith('.csv') ||
    name.endsWith('.html') ||
    name.endsWith('.css') ||
    name.endsWith('.doc') ||
    name.endsWith('.docx')
  ) {
    return 'document';
  }
  return 'other';
}

export async function processFileToAttachment(file: File): Promise<MessageAttachment> {
  const category = detectAttachmentCategory(file);
  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let dataBase64: string | undefined;
  let textSnippet: string | undefined;

  // Pour les documents texte / code : extraction directe du contenu textuel si < 1MB
  if (
    category === 'document' &&
    !file.type.includes('pdf') &&
    file.size < 1024 * 1024
  ) {
    try {
      const txt = await file.text();
      textSnippet = txt.slice(0, 10000); // 10 000 caractères max pour rester agile et pertinent
    } catch (e) {
      console.warn('Impossible de lire le texte:', e);
    }
  }

  // Pour les images, audio, vidéos, pdf : conversion en Base64
  if (file.size <= 20 * 1024 * 1024) { // Jusqu'à 20 Mo
    try {
      dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (e) {
      console.warn('Erreur lecture Base64:', e);
    }
  }

  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    category,
    dataBase64,
    textSnippet
  };
}
