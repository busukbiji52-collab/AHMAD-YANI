
import { GoogleGenAI, Type } from "@google/genai";
import { ComicConfig, ColoringConfig, Panel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateComicPanels = async (config: ComicConfig, pageNumber: number, previousContext: string = "") => {
  const prompt = `Anda adalah "NAEZAK AI STUDIO", AI Comic Architect.
Tugas: Buat deskripsi visual dan naskah untuk 4 PANEL komik (Halaman ${pageNumber}).
Topik: ${config.topic}
Karakter Utama & Deskripsi Fisik: ${config.character}
Gaya: ${config.style}
Mood: ${config.mood}
Bahasa: ${config.language}
Konteks Cerita Sejauh Ini: ${previousContext}

PENTING: Pastikan deskripsi visual untuk setiap panel secara konsisten menyebutkan fitur fisik karakter (${config.character}) agar AI Image Generator dapat menghasilkan gambar yang sama.

Hasilkan data dalam format JSON murni:
{
  "panels": [
    { 
      "description": "deskripsi visual detail untuk panel ini, termasuk posisi dan aksi karakter", 
      "dialog": "teks narasi atau dialog karakter" 
    }
  ],
  "summary": "ringkasan singkat kejadian di halaman ini untuk menjaga alur cerita",
  "isTamat": false
}
Hasilkan tepat 4 panel.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateImageForPanel = async (description: string, style: string, characterDescription: string) => {
  const prompt = `Comic book art, ${style} style. 
CHARACTER REFERENCE: ${characterDescription}.
SCENE: ${description}.
High quality, consistent character design, cinematic lighting, sharp professional comic lines.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateColoringBook = async (config: ColoringConfig) => {
  const prompt = `Anda adalah "NAEZAK AI STUDIO", AI Creative Suite All-in-One.
Buatlah kode SVG sederhana untuk buku mewarnai anak.
Objek: ${config.object}
Target Usia: ${config.age}

Syarat SVG:
1. Background transparan (fill="none").
2. Stroke hitam tebal (stroke="black" stroke-width="2").
3. Hanya garis luar (outlines).
4. Viewbox minimalis (contoh: 0 0 500 500).
5. Berikan HANYA kode SVG mentah tanpa penjelasan apapun.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  
  let text = response.text || '';
  const match = text.match(/<svg[\s\S]*<\/svg>/);
  return match ? match[0] : text;
};

export const generateCaricature = async (description: string, imageBase64?: string) => {
  const parts: any[] = [{ text: `Anda adalah "NAEZAK AI STUDIO", AI Creative Suite All-in-One.
Lakukan Analisis Wajah mendalam berdasarkan input user, lalu ubah menjadi Deskripsi Karakter 3D/Kartun (Mini Me) yang sangat detail, lucu, dan menonjolkan fitur unik (exaggerated features). 

Input User: ${description}` }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType: 'image/jpeg'
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
  });
  return response.text;
};

export const generateGenericContent = async (mode: string, input: string) => {
  const prompt = `Anda adalah "NAEZAK AI STUDIO", AI Creative Suite All-in-One.
Mode: ${mode}
User Input: ${input}
Berikan respon profesional, kreatif, dan terstruktur sesuai dengan mode yang dipilih. Gunakan Bahasa Indonesia yang luwes dan canggih. Gunakan emoji yang relevan.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text;
};
