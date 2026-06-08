
import db from './database';
import cyberbullyingDataset from '../data/cyberbullying-dataset.json';

// This is a simulated machine learning service
// In a real application, this would interface with a backend ML model

// Bullying keywords for our simple classifier
const bullyingKeywords = [
  'stupid', 'ugly', 'idiot', 'dumb', 'loser', 'hate', 'waste', 'nobody', 'fellow',
  'kill yourself', 'die', 'fat', 'pathetic', 'worthless',
  'nobody likes you', 'failure', 'retard', 'useless',
  'kill', 'suicide', 'hurt', 'ugly', 'fat', 'stupid',
  'nobody like', 'waste fellow' // Added phrases
];

// Categories of cyberbullying
const bullyingCategories = [
  { 
    name: 'personal_attack', 
    keywords: [
      'nobody likes', 'nobody like', 'stupid', 'idiot', 'dumb', 'loser', 'pathetic', 
      'failure', 'retard', 'useless', 'waste', 'waste fellow' // Added 'nobody like' and 'waste fellow'
    ]
  },
  { 
    name: 'appearance', 
    keywords: ['ugly', 'fat', 'hideous', 'gross', 'disgusting']
  },
  { 
    name: 'threat', 
    keywords: ['kill', 'die', 'hurt', 'suicide', 'kill yourself', 'hate you']
  },
  { 
    name: 'sexual', 
    keywords: ['slut', 'whore', 'bitch', 'sexual', 'pervert']
  },
  { 
    name: 'discrimination', 
    keywords: ['gay', 'lesbian', 'retard', 'race', 'racial', 'racist']
  }
];

// Populate categories with unique keywords from the dataset
cyberbullyingDataset?.dataset.forEach((entry) => {
  if (entry.isCyberbullying && entry.category) {
    const category = bullyingCategories.find((cat) => cat.name === entry.category);
    if (category) {
      const words = entry.content.toLowerCase().match(/\b\w+\b/g) || [];
      category.keywords.push(...words.filter((word) => !category.keywords.includes(word)));
    }
  }
});

// Function to calculate approximate match score
function calculateSimilarity(text: string, keywords: string[]): number {
  const textWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []);
  let matches = 0;
  let totalWeight = 0;

  keywords.forEach((keyword) => {
    if (textWords.has(keyword)) {
      matches += 1; // Exact match
    } else {
      // Approximate match: check for similar words (simplified overlap)
      const keywordWords = keyword.split(/\s+/);
      const overlap = keywordWords.filter((kw) => textWords.has(kw)).length;
      if (overlap > 0) {
        matches += overlap / keywordWords.length; // Partial credit for overlap
      }
    }
    totalWeight += 1; // Weight each keyword equally
  });

  return matches / totalWeight; // Normalized score (0 to 1)
}

// Function to calculate exact match presence
// Function to calculate exact match presence
function calculateMatchPresence(text: string, keywords: string[]): boolean {
  const textWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []);
  return keywords.some((keyword) => textWords.has(keyword));
}

// Enhanced category determination function
function determineCategory(text: string): string | undefined {
  const lowerText = text.toLowerCase();

  // Check each category for exact keyword matches
  for (const category of bullyingCategories) {
    if (calculateMatchPresence(lowerText, category.keywords)) {
      // Verify against dataset content for confirmation
      const matchingEntries = cyberbullyingDataset.dataset.filter(
        (entry) => entry.category === category.name && entry.isCyberbullying
      );
      for (const entry of matchingEntries) {
        const entryWords = new Set(entry.content.toLowerCase().match(/\b\w+\b/g) || []);
        if (Array.from(entryWords).some((word) => lowerText.includes(word))) {
          return category.name; // Return category if any dataset word matches
        }
      }
    }
  }

  return undefined; // No match found
}
// Improved sentiment function using dataset vocabulary
function calculateSentiment(text: string): number {
  const lowerText = text.toLowerCase();
  let negative = 0;
  const totalKeywords = new Set(bullyingCategories.flatMap(cat => cat.keywords)).size;

  // Count negative words from dataset vocabulary
  bullyingCategories.forEach((category) => {
    category.keywords.forEach((word) => {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        negative += matches.length;
      }
    });
  });

  // Normalize sentiment score (0 to 1) based on dataset vocabulary density
  const sentimentScore = Math.min(1, negative / (totalKeywords / 5)); // Cap at 1, adjust divisor for sensitivity
  return sentimentScore;
}

// Calculate various feature scores with dataset influence
function calculateFeatures(text: string) {
  const sentiment = calculateSentiment(text);
  
  // Simulate features with dataset-informed randomness
  return {
    sentimental: sentiment,
    sarcastic: Math.random() * 0.5 * (sentiment > 0.5 ? 1.2 : 0.8), // Higher sarcasm if sentiment is negative
    syntactic: Math.random() * 0.7 * (sentiment > 0.3 ? 0.9 : 1.1), // Adjust syntax based on sentiment
    semantic: sentiment * 0.8 + Math.random() * 0.2 * (1 - sentiment), // Semantics tied to sentiment
    social: Math.random() * 0.6 * (sentiment > 0.4 ? 0.7 : 1.3) // Social context influenced by negativity
  };
}

// Classify text as cyberbullying or not
function classifyText(text: string) {
  const features = calculateFeatures(text);
  
  // Weighted score with sentiment as primary indicator
  const score = 
    features.sentimental * 0.5 +
    features.sarcastic * 0.1 +
    features.syntactic * 0.1 +
    features.semantic * 0.2 +
    features.social * 0.1;
  
  // Classify as cyberbullying if score exceeds threshold
  const isCyberbullying = score > 0.3;
  const category = isCyberbullying ? determineCategory(text) : undefined;
  
  return {
    result: isCyberbullying,
    category,
    confidence: score,
    features
  };
}

// Analyze a message and store the results
async function analyzeMessage(messageId: string, source: string = 'user_input') {
  const message = db.getMessageById(messageId);
  
  if (!message) {
    throw new Error("Message not found");
  }
  
  const analysis = classifyText(message.content);
  
  // Save the report to the database
  const report = db.createReport(
    messageId,
    analysis.result,
    analysis.confidence,
    analysis.features,
    analysis.category
  );
  
  return report;
}

// Analyze text directly without saving
function analyzeText(text: string) {
  return classifyText(text);
}

export default {
  analyzeMessage,
  analyzeText
};