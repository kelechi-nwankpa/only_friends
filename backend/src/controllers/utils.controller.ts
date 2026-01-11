import type { RequestHandler } from 'express';
import { AppError } from '../utils/errors.js';

// URL metadata extraction using metascraper
// Note: These will be dynamically imported due to ESM compatibility
let metascraper: any;
let metascraperTitle: any;
let metascraperImage: any;
let metascraperDescription: any;
let metascraperUrl: any;

async function initMetascraper() {
  if (!metascraper) {
    const [ms, title, image, description, url] = await Promise.all([
      import('metascraper'),
      import('metascraper-title'),
      import('metascraper-image'),
      import('metascraper-description'),
      import('metascraper-url'),
    ]);
    metascraper = ms.default([
      title.default(),
      image.default(),
      description.default(),
      url.default(),
    ]);
  }
  return metascraper;
}

/**
 * Extract metadata from a URL
 */
export const extractUrlMetadata: RequestHandler = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      throw AppError.badRequest('URL is required');
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw AppError.badRequest('Invalid URL format');
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WishlistBot/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw AppError.badRequest('Failed to fetch URL');
    }

    const html = await response.text();

    // Extract metadata
    const scraper = await initMetascraper();
    const metadata = await scraper({ html, url });

    // Try to extract price (basic pattern matching)
    let price: number | null = null;
    let currency = 'USD';

    // Common price patterns
    const pricePatterns = [
      /\$([0-9,]+\.?\d*)/,
      /USD\s*([0-9,]+\.?\d*)/i,
      /price["\s:]+\$?([0-9,]+\.?\d*)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        price = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    res.json({
      success: true,
      data: {
        title: metadata.title || null,
        image: metadata.image || null,
        description: metadata.description || null,
        url: metadata.url || url,
        price,
        currency,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      // URL extraction can fail for many reasons, return partial data
      res.json({
        success: true,
        data: {
          title: null,
          image: null,
          description: null,
          url: req.body.url,
          price: null,
          currency: 'USD',
          error: 'Could not extract metadata from this URL',
        },
      });
    }
  }
};

/**
 * Get AI gift suggestions
 * Premium feature
 */
export const getGiftSuggestions: RequestHandler = async (req, res, next) => {
  try {
    const { description, budgetMin, budgetMax, count = 5 } = req.body;

    if (!description) {
      throw AppError.badRequest('Description is required');
    }

    // Check if OpenAI is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw AppError.internal('AI service not configured');
    }

    // Dynamically import OpenAI
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const budgetText = budgetMin && budgetMax
      ? `Budget: $${budgetMin} - $${budgetMax}.`
      : budgetMin
        ? `Budget: at least $${budgetMin}.`
        : budgetMax
          ? `Budget: up to $${budgetMax}.`
          : '';

    const prompt = `You are a helpful gift suggestion assistant. Generate ${count} unique, thoughtful gift ideas based on this description:

"${description}"

${budgetText}

For each gift, provide:
1. A specific product name/title
2. A brief description of why it would be a good gift
3. An approximate price range
4. A general search term to find it online

Format your response as a JSON array with objects containing: title, description, priceRange, searchTerm

Only respond with the JSON array, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw AppError.internal('No response from AI');
    }

    // Parse the JSON response
    let suggestions;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      suggestions = JSON.parse(cleanContent);
    } catch {
      throw AppError.internal('Failed to parse AI response');
    }

    res.json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    next(error);
  }
};
