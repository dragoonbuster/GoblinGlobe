import express from 'express';
import cors from 'cors';
import { promises as dns } from 'dns';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import whois from 'whois';
import { calculateDomainQualityScore, getQualityGrade, sortDomainsByQuality } from './domain-scoring.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

async function checkDomainAvailability(domain, prompt = '') {
  // Calculate quality score
  const qualityScore = calculateDomainQualityScore(domain, prompt);
  const qualityGrade = getQualityGrade(qualityScore.overall);
  
  try {
    // First try DNS lookup (faster)
    await dns.resolve4(domain);
    return { domain, available: false, method: 'dns', qualityScore, qualityGrade };
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      // Double-check with WHOIS for accuracy
      try {
        return new Promise((resolve) => {
          whois.lookup(domain, (err, data) => {
            if (err || !data) {
              resolve({ domain, available: true, method: 'whois-error', qualityScore, qualityGrade });
              return;
            }
            
            const lowerData = data.toLowerCase();
            const isAvailable = 
              lowerData.includes('no match') ||
              lowerData.includes('not found') ||
              lowerData.includes('no data found') ||
              lowerData.includes('no entries found');
            
            resolve({ domain, available: isAvailable, method: 'whois', qualityScore, qualityGrade });
          });
        });
      } catch {
        return { domain, available: true, method: 'dns-only', qualityScore, qualityGrade };
      }
    }
    return { domain, available: false, method: 'error', qualityScore, qualityGrade };
  }
}

async function generateDomainNames(prompt, count = 10) {
  const systemPrompt = `You are a creative domain name generator. Generate exactly ${count} domain names based on the user's request. 
  Return ONLY the domain names (without extensions) as a JSON array of strings. 
  Make them memorable, brandable, and relevant to the request.
  Example output: ["fishbunny", "octopusgiraffe", "pandashark"]`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.9,
    max_tokens: 500
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    // Fallback: extract words that look like domain names
    const content = response.choices[0].message.content;
    const matches = content.match(/[a-zA-Z][a-zA-Z0-9-]{2,}/g) || [];
    return matches.slice(0, count);
  }
}

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, count = 10, extensions = ['.com'] } = req.body;
    
    // Generate domain name ideas
    const names = await generateDomainNames(prompt, count);
    
    // Check availability for each name with each extension
    const checks = [];
    for (const name of names) {
      for (const ext of extensions) {
        checks.push(checkDomainAvailability(name + ext, prompt));
      }
    }
    
    const results = await Promise.all(checks);
    
    // Group by availability and sort by quality
    const available = sortDomainsByQuality(results.filter(r => r.available));
    const taken = sortDomainsByQuality(results.filter(r => !r.available));
    
    res.json({
      success: true,
      prompt,
      generated: names,
      results: {
        available,
        taken
      },
      summary: {
        total: results.length,
        available: available.length,
        taken: taken.length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/check', async (req, res) => {
  try {
    const { domains } = req.body;
    
    if (!Array.isArray(domains)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Domains must be an array' 
      });
    }
    
    const results = await Promise.all(
      domains.map(domain => checkDomainAvailability(domain, ''))
    );
    
    const sortedResults = sortDomainsByQuality(results);
    
    res.json({
      success: true,
      results: sortedResults
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Domain Finder API running on http://localhost:${PORT}`);
});