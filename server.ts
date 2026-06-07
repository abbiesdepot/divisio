import 'dotenv/config';
import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const parseAIResponse = <T>(text: string, endpoint: string): T => {
    const normalized = text
      .replace(/```(?:json)?/g, '')
      .trim();

    const candidates = [normalized];
    const match = normalized.match(/({[\s\S]*}|\[[\s\S]*\])/);
    if (match) {
      candidates.unshift(match[0]);
    }

    for (const candidate of candidates) {
      try {
        return JSON.parse(candidate) as T;
      } catch {
        // continue to next candidate
      }
    }

    throw new Error(`Unable to parse AI response as JSON for ${endpoint}: ${text}`);
  };

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing VITE_GEMINI_API_KEY environment variable. Please set it in .env or your environment.');
    process.exit(1);
  }

  // Gemini Setup
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json", 
    }
  });

  // API Routes
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { task, members, history } = req.body;
      
      const prompt = `
        Sebagai asisten AI manajemen tim, berikan rekomendasi anggota tim terbaik untuk tugas berikut:
        
        Kebutuhan Tugas:
        - Nama: ${task.name}
        - Deskripsi: ${task.description}
        - Kategori: ${task.category || 'Umum'}
        - Prioritas: ${task.difficulty}
        
        Anggota Tim Tersedia (dengan data Skill & Expertise):
        ${JSON.stringify(members.map((m: any) => ({ 
          id: m.id, 
          name: m.name, 
          role: m.role, 
          expertise: m.expertise, 
          skills: m.skills,
          workloadPoints: history?.filter((h: any) => h.assigneeId === m.id).length || 0 
        })))}
        
        Instruksi:
        1. COCOKKAN Kategori dan Deskripsi tugas dengan Keterampilan (skills) dan Keahlian (expertise) anggota.
        2. Berikan skor (0-100) yang mencerminkan tingkat kecocokan teknis (70%) dan ketersediaan beban kerja (30%).
        3. Jelaskan secara singkat dalam Bahasa Indonesia mengapa mereka cocok (misal: "Memiliki keahlian spesifik di ${task.category}", "Sangat berpengalaman dengan React", "Beban kerja rendah").
        4. Kembalikan dalam format JSON murni:
        [
          { "memberId": "...", "memberName": "...", "score": 85, "explanation": "..." }
        ]
        Hanya kembalikan JSON.
      `;


      const result = await model.generateContent(prompt);
      const responseText = String(result.response.text());
      try {
        res.json(parseAIResponse(responseText, '/api/recommendations'));
      } catch (parseError) {
        console.error("AI Recommendation Parse Error:", parseError, responseText);
        throw parseError;
      }
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });


  
  app.post("/api/workload-insights", async (req, res) => {
    try {
      const { members, tasks } = req.body;
      
      const prompt = `
        Analisis beban kerja tim berikut dan berikan wawasan (insights) singkat untuk setiap anggota.
        
        Anggota: ${JSON.stringify(members)}
        Tugas Aktif: ${JSON.stringify(tasks)}
        
        Berikan wawasan tentang:
        - Siapa yang terlalu sibuk (overloaded).
        - Siapa yang memiliki kapasitas lebih.
        - Saran penyeimbangan beban kerja.
        
        Format JSON:
        {
          "overallStatus": "Sehat / Tertekan / Kritis",
          "insights": [
             { "memberId": "...", "status": "Optimalkan / Normal / Sibuk", "message": "..." }
          ]
        }
        Bahasa Indonesia. Tanpa markdown.
      `;


      const result = await model.generateContent(prompt);
      const responseText = String(result.response.text());
      try {
        res.json(parseAIResponse(responseText, '/api/workload-insights'));
      } catch (parseError) {
        console.error("AI Workload Parse Error:", parseError, responseText);
        throw parseError;
      }
  
    } catch (error) {
      console.error("AI Workload Error:", error);
      res.status(500).json({ error: "Failed to generate workload insights" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
