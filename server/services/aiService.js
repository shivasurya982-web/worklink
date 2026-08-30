const axios = require('axios');

/**
 * WorkLink AI Assistant Logic
 * This service handles intelligent matching and natural language search processing.
 */
class AIService {
  /**
   * Process Natural Language Search Query
   * e.g., "Emergency plumber under 1000 rupees in Malad"
   */
  async parseSearchQuery(queryString) {
    const query = queryString.toLowerCase();
    const result = {
      categoryName: null,
      maxPrice: null,
      urgent: false,
    };

    // Keyword mappings
    const categories = ['plumber', 'electrician', 'carpenter', 'mechanic', 'cleaner', 'tutor'];
    for (const cat of categories) {
      if (query.includes(cat)) result.categoryName = cat;
    }

    if (query.includes('emergency') || query.includes('urgent') || query.includes('now')) {
      result.urgent = true;
    }

    // Price extraction
    const priceMatch = query.match(/(?:under|below|within|rs|₹)\s*(\d+)/);
    if (priceMatch) {
      result.maxPrice = parseInt(priceMatch[1]);
    }

    return result;
  }

  /**
   * AI-Driven Worker Matching Algorithm
   */
  async matchWorkers(searchCriteria, workersList) {
    const scoredWorkers = workersList.map(worker => {
      let score = 0;

      // 1. Skill Match
      if (searchCriteria.categoryName && worker.profession.toLowerCase().includes(searchCriteria.categoryName)) {
        score += 40;
      }

      // 2. Rating Bonus
      score += (worker.rating || 0) * 5;

      // 3. Experience Bonus
      score += Math.min((worker.experience || 0), 10);

      // 4. Availability
      if (worker.isAvailable) score += 15;

      // 5. Verification Bonus
      if (worker.isVerified) score += 10;

      const workerObj = worker.toObject ? worker.toObject() : worker;

      return {
        ...workerObj,
        matchPercentage: Math.min(Math.round((score / 85) * 100), 99),
      };
    });

    return scoredWorkers.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  }

  /**
   * Generate AI Assistant Responses for Chatbot
   */
  generateAssistantResponse(message) {
    const msg = message.toLowerCase();

    const patterns = [
      {
        keys: ['how', 'book', 'service'],
        response: 'To book a service on WorkLink AI: 1) Search for the professional you need, 2) View their profile and rates, 3) Click "Book Now" and select your preferred date/time.'
      },
      {
        keys: ['become', 'worker', 'join'],
        response: 'To become a WorkLink AI professional: 1) Click "Become a Worker" on the homepage, 2) Fill in your details and upload your ID proof, 3) Wait for admin approval (usually under 24 hours).'
      },
      {
        keys: ['verify', 'safe'],
        response: 'All workers on WorkLink AI go through a rigorous verification process: 1) Government Identity check, 2) Skill certificate review, 3) Background verification by our admin team.'
      },
      {
        keys: ['pay', 'cost', 'money'],
        response: 'WorkLink AI uses a transparent pricing model. You can see the hourly rates of every professional upfront. Payment is settled directly with the worker after successful job completion.'
      },
      {
        keys: ['help', 'support', 'contact'],
        response: 'Our support team is here for you! You can email us at support@worklinkai.com or reach out via the "Complaints" section in your dashboard.'
      }
    ];

    for (const p of patterns) {
      if (p.keys.every(k => msg.includes(k)) || (p.keys.some(k => msg.includes(k)) && msg.length < 50)) {
        return { message: p.response };
      }
    }

    return {
      message: "I'm the WorkLink AI Assistant! I can help you find local workers, book services, track your bookings, or explain how our platform works. What can I help you with today?"
    };
  }
}

module.exports = new AIService();
