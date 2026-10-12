import { GoogleGenAI } from '@google/genai';

export interface ChatAttachmentPayload {
  name: string;
  type: string; // MIME type (e.g. 'image/jpeg', 'audio/mp3', 'application/pdf', 'text/plain')
  category: 'image' | 'audio' | 'video' | 'document' | 'other';
  dataBase64?: string; // base64 string
  textSnippet?: string; // extracted text content
  size?: number;
}

export interface CameraSnapshotPayload {
  imageBase64: string;
  source: 'webcam' | 'smartphone' | 'ros_camera';
}

export interface MultiProviderRequest {
  provider?: 'gemini' | 'openai' | 'anthropic' | 'mistral' | 'groq' | 'deepseek' | 'custom_ollama';
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
  systemInstruction: string;
  prompt: string;
  temperature?: number;
  attachments?: ChatAttachmentPayload[];
  cameraSnapshot?: CameraSnapshotPayload;
  isProjectCollaboration?: boolean;
}

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(customKey?: string): GoogleGenAI | null {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!geminiClient || customKey) {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return geminiClient;
}

function normalizeGeminiModel(modelName?: string): string {
  if (!modelName) return 'gemini-3.8-flash';
  const deprecated = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-2.0-flash',
    'gemini-2.0-pro',
    'gemini-2.0-flash-thinking',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];
  if (deprecated.includes(modelName) || modelName.startsWith('gemini-1.') || modelName.startsWith('gemini-2.')) {
    return 'gemini-3.8-flash';
  }
  return modelName;
}

export async function executeMultiProviderChat(req: MultiProviderRequest): Promise<string> {
  const provider = req.provider || 'gemini';
  const temperature = req.temperature ?? 0.8;

  // 1. Google Gemini (Standard ou Clé fournie)
  if (provider === 'gemini') {
    const ai = getGeminiClient(req.apiKey);
    if (!ai) {
      throw new Error("Clé API Gemini non configurée (GEMINI_API_KEY ou clé personnalisée requise).");
    }

    const primaryModel = normalizeGeminiModel(req.modelName);
    const candidateModels: string[] = [primaryModel];
    if (!candidateModels.includes('gemini-3.8-flash')) {
      candidateModels.push('gemini-3.8-flash');
    }
    if (!candidateModels.includes('gemini-flash-latest')) {
      candidateModels.push('gemini-flash-latest');
    }
    if (!candidateModels.includes('gemini-3.1-flash-lite')) {
      candidateModels.push('gemini-3.1-flash-lite');
    }

    // Construction des contenus multimodaux (texte + images + fichiers + snapshot caméra)
    const contentsList: any[] = [];

    // Snapshot caméra si présent
    if (req.cameraSnapshot?.imageBase64) {
      let rawB64 = req.cameraSnapshot.imageBase64;
      if (rawB64.includes('base64,')) {
        rawB64 = rawB64.split('base64,')[1];
      }
      contentsList.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: rawB64
        }
      });
      contentsList.push({
        text: `[PERCEPTION VISUELLE CAMÉRA DIRECTE - Source: ${req.cameraSnapshot.source.toUpperCase()}] : L'image transmise ci-dessus est la capture instantanée de la caméra de l'utilisateur. Regarde attentivement son visage, ses yeux, son expression, sa présence physique, son décor ambiant ou tout objet présenté devant l'objectif. Identifie précisément ton interlocuteur pour confirmer son identité.`
      });
    }

    // Fichiers joints et médias partagés
    if (req.attachments && req.attachments.length > 0) {
      for (const att of req.attachments) {
        if (att.dataBase64) {
          let rawB64 = att.dataBase64;
          if (rawB64.includes('base64,')) {
            rawB64 = rawB64.split('base64,')[1];
          }
          const mime = att.type || (att.category === 'image' ? 'image/jpeg' : att.category === 'audio' ? 'audio/mp3' : att.category === 'video' ? 'video/mp4' : 'application/pdf');
          contentsList.push({
            inlineData: {
              mimeType: mime,
              data: rawB64
            }
          });
          contentsList.push({
            text: `[FICHIER MÉDIA TRANSMIS : "${att.name}" (${att.category} - ${mime})] : Analyse ce contenu avec sensibilité, écoute et discernement.`
          });
        } else if (att.textSnippet) {
          contentsList.push({
            text: `[DOCUMENT / ÉCRIT PARTAGÉ PAR L'UTILISATEUR : "${att.name}"] :\n\`\`\`\n${att.textSnippet}\n\`\`\`\n(Analyse ce document partagé pour enrichir vos échanges et ta connaissance de l'utilisateur)`
          });
        }
      }
    }

    // Prompt textuel principal
    contentsList.push({ text: req.prompt });

    const contentsPayload = contentsList.length === 1 ? req.prompt : contentsList;

    let lastError: any = null;
    for (const model of candidateModels) {
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents: contentsPayload,
          config: {
            systemInstruction: req.systemInstruction,
            responseMimeType: 'application/json',
            temperature
          }
        });

        // Timeout de sécurité de 35 secondes par tentative pour les fichiers multimédias
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout génération modèle ${model} après 35s`)), 35000)
        );

        const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
        return (response.text || '{}').trim();
      } catch (err: any) {
        lastError = err;
        console.warn(`Modèle Gemini ${model} a échoué (${err?.message}), essai avec le modèle suivant...`);
      }
    }
    throw lastError || new Error("Erreur génération Gemini.");
  }

  // 2. OpenAI ou fournisseurs compatibles OpenAI (Groq, Mistral, DeepSeek, Ollama)
  if (provider === 'openai' || provider === 'groq' || provider === 'mistral' || provider === 'deepseek' || provider === 'custom_ollama') {
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    let defaultModel = 'gpt-4o-mini';

    if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      defaultModel = 'llama-3.3-70b-versatile';
    } else if (provider === 'mistral') {
      endpoint = 'https://api.mistral.ai/v1/chat/completions';
      defaultModel = 'mistral-small-latest';
    } else if (provider === 'deepseek') {
      endpoint = 'https://api.deepseek.com/v1/chat/completions';
      defaultModel = 'deepseek-chat';
    } else if (provider === 'custom_ollama') {
      endpoint = (req.baseUrl || 'http://localhost:11434/v1').replace(/\/$/, '') + '/chat/completions';
      defaultModel = 'llama3.2';
    }

    const apiKey = req.apiKey || (provider === 'openai' ? process.env.OPENAI_API_KEY : '');
    const model = req.modelName || defaultModel;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    let userMessageContent: any = req.prompt;
    const hasImages = req.cameraSnapshot?.imageBase64 || req.attachments?.some(a => a.dataBase64 && a.category === 'image');
    if (hasImages) {
      const parts: any[] = [];
      if (req.cameraSnapshot?.imageBase64) {
        const b64 = req.cameraSnapshot.imageBase64.includes('base64,') ? req.cameraSnapshot.imageBase64.split('base64,')[1] : req.cameraSnapshot.imageBase64;
        parts.push({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${b64}` }
        });
      }
      if (req.attachments) {
        for (const att of req.attachments) {
          if (att.dataBase64 && att.category === 'image') {
            const b64 = att.dataBase64.includes('base64,') ? att.dataBase64.split('base64,')[1] : att.dataBase64;
            parts.push({
              type: 'image_url',
              image_url: { url: `data:${att.type || 'image/jpeg'};base64,${b64}` }
            });
          }
        }
      }
      parts.push({ type: 'text', text: req.prompt });
      userMessageContent = parts;
    }

    const body = {
      model,
      messages: [
        { role: 'system', content: req.systemInstruction + "\nIMPORTANT: Tu dois STRICTEMENT répondre en JSON valide." },
        { role: 'user', content: userMessageContent }
      ],
      temperature,
      response_format: { type: 'json_object' }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erreur API ${provider.toUpperCase()} (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return (data.choices?.[0]?.message?.content || '{}').trim();
  }

  // 3. Anthropic Claude
  if (provider === 'anthropic') {
    const apiKey = req.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Clé API Anthropic non configurée.");
    }
    const model = req.modelName || 'claude-3-5-haiku-20241022';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: req.systemInstruction + "\nIMPORTANT: Tu dois STRICTEMENT répondre au format JSON valide uniquement.",
        messages: [{ role: 'user', content: req.prompt }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erreur API Anthropic (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    const contentText = data.content?.[0]?.text || '{}';
    return contentText.trim();
  }

  throw new Error(`Fournisseur non supporté : ${provider}`);
}
