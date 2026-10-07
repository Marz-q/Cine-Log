import axios from 'axios';
import { movieService } from './movieService';
import { userService } from './userService';

const GROQ_API_KEY =
  import.meta.env.VITE_GROQ_API_KEY ||
  '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';

const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

// Helper to normalize strings for comparison
const normalizeTitle = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\(\d{4}\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const chatbotService = {
  /**
   * Loads both watched and watchlist movies for the current user,
   * returning normalized exclusion maps and lists.
   */
  async getUserExclusions(username) {
    if (!username) {
      return { titles: [], watchedCount: 0, watchlistCount: 0, watchedSet: new Set(), watchlistSet: new Set() };
    }

    try {
      const [watched, watchlist] = await Promise.all([
        userService.getUserWatched(username).catch(() => []),
        userService.getUserWatchlist(username).catch(() => []),
      ]);

      const watchedTitles = (watched || []).map((m) => m.title).filter(Boolean);
      const watchlistTitles = (watchlist || []).map((m) => m.title).filter(Boolean);

      const allTitles = Array.from(new Set([...watchedTitles, ...watchlistTitles]));
      const watchedSet = new Set(watchedTitles.map(normalizeTitle));
      const watchlistSet = new Set(watchlistTitles.map(normalizeTitle));

      return {
        titles: allTitles,
        watchedCount: watchedTitles.length,
        watchlistCount: watchlistTitles.length,
        watchedSet,
        watchlistSet,
      };
    } catch (err) {
      console.warn('Could not load user movie exclusions:', err);
      return { titles: [], watchedCount: 0, watchlistCount: 0, watchedSet: new Set(), watchlistSet: new Set() };
    }
  },

  /**
   * Sends a message to the Groq AI Chatbot with strict exclusion rules.
   */
  async sendMessage({ messages, excludedTitles = [], watchedSet = new Set(), watchlistSet = new Set() }) {
    let exclusionClause = '';
    if (excludedTitles && excludedTitles.length > 0) {
      const sample = excludedTitles.slice(0, 100);
      exclusionClause = `\n\nCRITICAL EXCLUSION RULE (HIGHEST PRIORITY):
The user has ALREADY watched or saved the following ${sample.length} films:
${sample.map((t) => `- ${t}`).join('\n')}

DO NOT SUGGEST, RECOMMEND, OR LIST ANY OF THE ABOVE FILMS UNDER ANY CIRCUMSTANCES. If the user asks for suggestions in a genre, recommend other remarkable, acclaimed, or hidden-gem films in that genre that are NOT in the excluded list above.`;
    }

    const systemPrompt = `You are CineBot, the ultimate AI Film Curator for Cine-Log, an aesthetic social journal for cinephiles.
Your goal is to converse with film lovers and provide inspiring, tailored movie recommendations based on the genres, moods, eras, or tropes they ask about.

GUIDELINES FOR RECOMMENDATIONS:
1. When asked for movie suggestions for a genre/mood, suggest 2 to 4 distinctive, memorable films.
2. For each recommended film, format its title as **Movie Title (Year)** on its own line or bold header.
3. Provide a vivid 1-2 sentence hook explaining why it's a must-watch and highlight its unique flavor (e.g., "Atmospheric Neo-Noir", "Mind-bending Sci-Fi", "Bittersweet character drama").
4. Maintain a warm, cultured, and passionate cinephile tone.
5. If the user simply chats, ask them what genre or mood they are in the mood for.${exclusionClause}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    let replyText = '';

    // Attempt Groq API with primary model, then fallback model
    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: PRIMARY_MODEL,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 900,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000,
        }
      );
      replyText = res.data?.choices?.[0]?.message?.content || '';
    } catch (err) {
      console.warn(`Primary model ${PRIMARY_MODEL} failed, attempting ${FALLBACK_MODEL}...`, err?.message);
      try {
        const fallbackRes = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: FALLBACK_MODEL,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 900,
          },
          {
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 25000,
          }
        );
        replyText = fallbackRes.data?.choices?.[0]?.message?.content || '';
      } catch (fbErr) {
        throw new Error(
          fbErr?.response?.data?.error?.message ||
            fbErr?.message ||
            'Unable to connect to CineBot AI service.'
        );
      }
    }

    // Extract potential movie titles from markdown: **Title (Year)** or **Title**
    const rawMatches = Array.from(replyText.matchAll(/\*\*([^*]+?)(?:\s*\((\d{4})\))?\*\*/g));
    const extractedList = [];

    for (const match of rawMatches) {
      const rawTitle = match[1]?.trim();
      const year = match[2]?.trim() || '';
      if (!rawTitle || rawTitle.length < 2) continue;

      // Filter out non-movie bold headers (e.g., "Key themes:", "Vibe:", "Why you'll love it:")
      const lower = rawTitle.toLowerCase();
      if (
        lower.includes('key theme') ||
        lower.includes('vibe') ||
        lower.includes('why watch') ||
        lower.includes('themes') ||
        lower.includes('note') ||
        lower.includes('genre')
      ) {
        continue;
      }

      // STRICT EXCLUSION CHECK:
      // Verify programmatically that the title is NOT in user's watched or watchlist
      const norm = normalizeTitle(rawTitle);
      if (watchedSet.has(norm) || watchlistSet.has(norm)) {
        console.info(`[CineBot Guardrail] Excluded already logged movie from card display: ${rawTitle}`);
        continue;
      }

      if (!extractedList.some((item) => normalizeTitle(item.title) === norm)) {
        extractedList.push({ title: rawTitle, year });
      }
    }

    // Limit to top 4 recommendations for TMDB card enrichment
    const topCandidates = extractedList.slice(0, 4);
    const enrichedMovies = [];

    for (const item of topCandidates) {
      try {
        const searchResults = await movieService.searchMovies(item.title);
        if (searchResults && searchResults.length > 0) {
          // If year specified, prefer matching release year
          let match = searchResults[0];
          if (item.year) {
            const yearMatch = searchResults.find(
              (m) => m.releaseDate && m.releaseDate.startsWith(item.year)
            );
            if (yearMatch) match = yearMatch;
          }

          // Double check the matched TMDB movie title against excluded set
          const normMatch = normalizeTitle(match.title);
          if (!watchedSet.has(normMatch) && !watchlistSet.has(normMatch)) {
            enrichedMovies.push(match);
          }
        }
      } catch (searchErr) {
        // Continue if TMDB lookup fails for a specific film
        console.debug('TMDB lookup failed for film:', item.title, searchErr);
      }
    }

    return {
      reply: replyText,
      recommendedMovies: enrichedMovies,
    };
  },
};
