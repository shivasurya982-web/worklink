// Application constants

const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  WORKER: 'worker',
};

const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ON_THE_WAY: 'on_the_way',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  APPROVAL: 'approval',
  CHAT: 'chat',
  REVIEW: 'review',
  SYSTEM: 'system',
  PAYMENT: 'payment',
};

const COMPLAINT_STATUS = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  LOCATION: 'location',
  BOOKING: 'booking',
};

const DEFAULT_CATEGORIES = [
  { name: 'Electrician', icon: 'Zap', description: 'Electrical repairs, wiring, installations' },
  { name: 'Plumber', icon: 'Droplets', description: 'Pipe repairs, installations, drainage' },
  { name: 'Carpenter', icon: 'Hammer', description: 'Furniture, woodwork, repairs' },
  { name: 'Painter', icon: 'Paintbrush', description: 'Interior & exterior painting' },
  { name: 'AC Technician', icon: 'Snowflake', description: 'AC repair, installation, servicing' },
  { name: 'Mechanic', icon: 'Wrench', description: 'Vehicle repair & maintenance' },
  { name: 'Driver', icon: 'Car', description: 'Personal & commercial driving' },
  { name: 'Tutor', icon: 'GraduationCap', description: 'Home tutoring & education' },
  { name: 'Cleaner', icon: 'Sparkles', description: 'Home & office cleaning' },
  { name: 'Photographer', icon: 'Camera', description: 'Event & portrait photography' },
  { name: 'Gardener', icon: 'Flower2', description: 'Garden maintenance & landscaping' },
  { name: 'Welder', icon: 'Flame', description: 'Metal welding & fabrication' },
  { name: 'Mobile Repair', icon: 'Smartphone', description: 'Mobile phone repair & servicing' },
  { name: 'Computer Repair', icon: 'Monitor', description: 'Computer & laptop repair' },
  { name: 'Pest Control', icon: 'Bug', description: 'Pest removal & prevention' },
];

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// AI recommendation weights
const AI_WEIGHTS = {
  DISTANCE: 0.35,
  RATING: 0.25,
  EXPERIENCE: 0.15,
  COMPLETED_JOBS: 0.10,
  AVAILABILITY: 0.10,
  SUCCESS_RATE: 0.05,
};

module.exports = {
  ROLES,
  APPROVAL_STATUS,
  BOOKING_STATUS,
  NOTIFICATION_TYPES,
  COMPLAINT_STATUS,
  MESSAGE_TYPES,
  DEFAULT_CATEGORIES,
  PAGINATION,
  AI_WEIGHTS,
};
