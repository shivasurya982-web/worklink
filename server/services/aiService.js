const axios = require('axios');

/**
 * Worklyn AI Assistant Logic
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
   * Get recommended workers for a customer
   */
  async getRecommendedWorkers({ lat, lng, limit = 6 }) {
    const Worker = require('../models/Worker');
    const LocationService = require('./locationService');

    try {
      // 1. Get approved and available workers
      let workers = await Worker.find({
        approvalStatus: 'approved',
        isAvailable: true
      }).populate('category', 'name icon').lean();

      // 2. Filter by distance if location is available
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        workers = LocationService.filterByDistance(workers, parseFloat(lat), parseFloat(lng), 50);
      }

      // 3. Score them using basic criteria
      const scored = await this.matchWorkers({}, workers);

      return scored.slice(0, limit);
    } catch (error) {
      console.error('getRecommendedWorkers error:', error);
      return [];
    }
  }

  /**
   * Generate AI Assistant Responses for Chatbot
   */
  generateAssistantResponse(message) {
    const msg = message.toLowerCase();

    const patterns = [
      {
        keys: ['how', 'book', 'service'],
        response: 'To book a service on Worklyn AI: 1) Search for the professional you need, 2) View their profile and rates, 3) Click "Book Now" and select your preferred date/time.'
      },
      {
        keys: ['become', 'worker', 'join'],
        response: 'To become a Worklyn AI professional: 1) Click "Become a Worker" on the homepage, 2) Fill in your details and upload your ID proof, 3) Wait for admin approval (usually under 24 hours).'
      },
      {
        keys: ['verify', 'safe'],
        response: 'All workers on Worklyn AI go through a rigorous verification process: 1) Government Identity check, 2) Skill certificate review, 3) Background verification by our admin team.'
      },
      {
        keys: ['pay', 'cost', 'money'],
        response: 'Worklyn AI uses a transparent pricing model. You can see the hourly rates of every professional upfront. Payment is settled directly with the worker after successful job completion.'
      },
      {
        keys: ['help', 'support', 'contact'],
        response: 'Our support team is here for you! You can email us at support@worklynai.com or reach out via the "Complaints" section in your dashboard.'
      }
    ];

    for (const p of patterns) {
      if (p.keys.every(k => msg.includes(k)) || (p.keys.some(k => msg.includes(k)) && msg.length < 50)) {
        return { message: p.response };
      }
    }

    return {
      message: "I'm the Worklyn AI Assistant! I can help you find local workers, book services, track your bookings, or explain how our platform works. What can I help you with today?"
    };
  }
}

module.exports = new AIService();
