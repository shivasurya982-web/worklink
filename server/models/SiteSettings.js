const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'WorkLink AI' },
    announcementText: { type: String, default: 'Verified Local Service Marketplace' },
    heroBannerImage: { type: String, default: '' },
    heroTitle: { type: String, default: 'Find & Book Trusted Local Experts In Seconds' },
    heroSubtitle: {
      type: String,
      default:
        'WorkLink AI connects you with verified electricians, plumbers, carpenters, mechanics, and technicians nearby — powered by intelligent AI matching.',
    },
    heroSearchPlaceholder: { type: String, default: 'Find an electrician, plumber, AC tech...' },
    quickSearchTags: {
      type: [String],
      default: ['Electrician near me', 'Plumber today', 'AC repair', 'Carpenter', 'Cleaner'],
    },
    categorySectionTitle: { type: String, default: 'Popular Service Categories' },
    categorySectionSubtitle: { type: String, default: 'Browse top rated local experts by specialization' },
    howItWorksTitle: { type: String, default: 'How WorkLink AI Works' },
    howItWorksSubtitle: { type: String, default: 'Get your home or office repairs solved in 4 simple steps' },
    howItWorksSteps: [
      {
        step: String,
        title: String,
        description: String,
      },
    ],
    aiSectionTitle: { type: String, default: 'Powered By Artificial Intelligence' },
    aiSectionSubtitle: {
      type: String,
      default: 'WorkLink AI brings intelligent operating system capabilities to local services',
    },
    aiFeaturesList: [
      {
        title: String,
        description: String,
      },
    ],
    statsCounters: [
      {
        num: String,
        label: String,
      },
    ],
    contactPhone: { type: String, default: '1800-000-0000' },
    contactEmail: { type: String, default: 'support@worklinkai.com' },
    stayUpdatedText: {
      type: String,
      default: 'Get updates on new service categories and special discounts near you.',
    },
    footerCopyrightText: { type: String, default: 'WorkLink AI. All rights reserved.' },
    platformFeePercentage: { type: Number, default: 5 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
