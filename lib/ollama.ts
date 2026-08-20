import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'digicbt-alcohol-recovery/ollama-settings/v1';

export interface OllamaSettings {
  host: string; // e.g. http://localhost:11434
  model: string; // e.g. qwen2.5:7b-instruct
}

const DEFAULT_SETTINGS: OllamaSettings = {
  host: 'http://localhost:11434',
  model: 'qwen2.5:7b-instruct',
};

export async function loadOllamaSettings(): Promise<OllamaSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveOllamaSettings(settings: OllamaSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage failures are non-fatal — settings just won't persist across reloads.
  }
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function normalizeHost(host: string): string {
  return host.trim().replace(/\/+$/, '');
}

export async function listOllamaModels(host: string): Promise<string[]> {
  const res = await fetch(`${normalizeHost(host)}/api/tags`);
  if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
  const data = await res.json();
  return (data.models ?? []).map((m: { name: string }) => m.name);
}

export async function chatWithOllama(settings: OllamaSettings, messages: OllamaChatMessage[]): Promise<string> {
  const res = await fetch(`${normalizeHost(settings.host)}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.model,
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama error ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  const content = data?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Ollama returned an empty response');
  }
  return content.trim();
}
