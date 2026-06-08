// In-memory database for cyberbullying detection
import testUsers from '../data/test-users.json';
import cyberbullyingDataset from '../data/cyberbullying-dataset.json';
import twitterDataset from '../data/twitter-dataset.json';

// User interface
export interface User {
  id?: string;
  userId?:string;
  uid?:string;
  username: string;
  password: string; // In a real app, this would be hashed
  email: string;
  createdAt: Date;
}

// Tweet/Message interface
export interface Message {
  id: string;
  content: string;
  userId: string | null; // Optional for anonymous messages
  source: string;
  createdAt: Date;
  isCyberbullying: boolean | null; // null if not yet analyzed
  category?: string; // Type of cyberbullying if detected
  confidence?: number; // Confidence score of the detection
}

// Detection Report interface
export interface DetectionReport {
  id: string;
  messageId: string;
  result: boolean;
  category?: string;
  confidence: number;
  features: {
    sentimental?: number;
    sarcastic?: number;
    syntactic?: number;
    semantic?: number;
    social?: number;
  };
  createdAt: Date;
}

// Database class
class Database {
  private users: User[] = [];
  private messages: Message[] = [];
  private reports: DetectionReport[] = [];

  // Seed data for demonstration
  constructor() {
    this.seedData();
  }

  private seedData() {
    // Add users from test-users.json
    testUsers.users.forEach(user => {
      this.users.push({
        ...user,
        createdAt: new Date(user.createdAt)
      });
    });

    // Add messages from cyberbullying-dataset.json
    cyberbullyingDataset.dataset.forEach((msg, index) => {
      const message: Message = {
        id: msg.id,
        content: msg.content,
        userId: "1", // assign to first test user
        source: "dataset",
        createdAt: new Date(Date.now() - index * 86400000), // Each a day apart
        isCyberbullying: msg.isCyberbullying,
        category: msg.category,
        confidence: msg.confidence
      };
      
      this.messages.push(message);

      // Create reports for the messages
      if (message.isCyberbullying !== null) {
        this.reports.push({
          id: msg.id,
          messageId: message.id,
          result: message.isCyberbullying,
          category: message.category,
          confidence: message.confidence || 0,
          features: {
            sentimental: message.isCyberbullying ? 0.7 + Math.random() * 0.3 : 0.1 + Math.random() * 0.3,
            sarcastic: Math.random() * 0.5,
            syntactic: Math.random() * 0.5,
            semantic: message.isCyberbullying ? 0.6 + Math.random() * 0.4 : 0.1 + Math.random() * 0.2,
            social: Math.random() * 0.7
          },
          createdAt: new Date()
        });
      }
    });

    // Add Twitter-like data
    twitterDataset.tweets.forEach((tweet, index) => {
      const isBullying = tweet.username.includes('bully') || 
                        tweet.username.includes('hater') || 
                        tweet.username.includes('troll') || 
                        tweet.username.includes('mean');
      
      const message: Message = {
        id: (this.messages.length + index + 1).toString(),
        content: tweet.content,
        userId: null,
        source: "Twitter",
        createdAt: new Date(tweet.timestamp),
        isCyberbullying: isBullying ? true : false,
        category: isBullying ? this.determineBullyingCategory(tweet.content) : undefined,
        confidence: isBullying ? 0.75 + Math.random() * 0.2 : 0.1 + Math.random() * 0.1
      };
      
      this.messages.push(message);
      
      // Create reports for Twitter messages
      this.reports.push({
        id: (this.reports.length + index + 1).toString(),
        messageId: message.id,
        result: message.isCyberbullying || false,
        category: message.category,
        confidence: message.confidence || 0,
        features: {
          sentimental: message.isCyberbullying ? 0.7 + Math.random() * 0.3 : 0.1 + Math.random() * 0.3,
          sarcastic: Math.random() * 0.5,
          syntactic: Math.random() * 0.5,
          semantic: message.isCyberbullying ? 0.6 + Math.random() * 0.4 : 0.1 + Math.random() * 0.2,
          social: Math.random() * 0.7
        },
        createdAt: new Date()
      });
    });
  }

  private determineBullyingCategory(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('ugly') || lowerContent.includes('fat')) {
      return 'appearance';
    } else if (lowerContent.includes('kill') || lowerContent.includes('delete') || lowerContent.includes('die')) {
      return 'threat';
    } else if (lowerContent.includes('country') || lowerContent.includes('race')) {
      return 'discrimination';
    } else {
      return 'personal_attack';
    }
  }

  // User methods
  getAllUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  createUser(username: string, password: string, email: string): User {
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      username,
      password, // In a real app, this would be hashed
      email,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Message methods
  getAllMessages(): Message[] {
    return [...this.messages];
  }

  getMessageById(id: string): Message | undefined {
    return this.messages.find(message => message.id === id);
  }

  createMessage(content: string, userId: string | null, source: string): Message {
    const newMessage: Message = {
      id: (this.messages.length + 1).toString(),
      content,
      userId,
      source,
      createdAt: new Date(),
      isCyberbullying: null
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  updateMessageAnalysis(id: string, isCyberbullying: boolean, category?: string, confidence?: number): Message | undefined {
    const messageIndex = this.messages.findIndex(message => message.id === id);
    if (messageIndex === -1) return undefined;

    this.messages[messageIndex] = {
      ...this.messages[messageIndex],
      isCyberbullying,
      category,
      confidence
    };

    return this.messages[messageIndex];
  }

  // Report methods
  getAllReports(): DetectionReport[] {
    return [...this.reports];
  }

  getReportById(id: string): DetectionReport | undefined {
    return this.reports.find(report => report.id === id);
  }

  getReportByMessageId(messageId: string): DetectionReport | undefined {
    return this.reports.find(report => report.messageId === messageId);
  }

  createReport(
    messageId: string, 
    result: boolean, 
    confidence: number,
    features: {
      sentimental?: number;
      sarcastic?: number;
      syntactic?: number;
      semantic?: number;
      social?: number;
    },
    category?: string
  ): DetectionReport {
    const newReport: DetectionReport = {
      id: (this.reports.length + 1).toString(),
      messageId,
      result,
      category,
      confidence,
      features,
      createdAt: new Date()
    };
    this.reports.push(newReport);

    // Also update the message
    this.updateMessageAnalysis(messageId, result, category, confidence);

    return newReport;
  }

  // Statistics methods
  getStatistics() {
    const totalMessages = this.messages.length;
    const analyzedMessages = this.messages.filter(m => m.isCyberbullying !== null).length;
    const bullyingMessages = this.messages.filter(m => m.isCyberbullying === true).length;
    
    const categoryData: Record<string, number> = {};
    this.messages
      .filter(m => m.isCyberbullying === true && m.category)
      .forEach(message => {
        if (message.category) {
          categoryData[message.category] = (categoryData[message.category] || 0) + 1;
        }
      });

    const sourceData: Record<string, number> = {};
    this.messages.forEach(message => {
      sourceData[message.source] = (sourceData[message.source] || 0) + 1;
    });

    return {
      totalMessages,
      analyzedMessages,
      bullyingMessages,
      bullyingPercentage: analyzedMessages > 0 ? (bullyingMessages / analyzedMessages) * 100 : 0,
      categoryData,
      sourceData
    };
  }
}

// Create and export a singleton instance
const db = new Database();
export default db;
