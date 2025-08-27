import { z } from "zod";

// Character types
export const CharacterType = z.enum([
  'strategist',
  'explorer', 
  'guardian',
  'maverick',
  'artist',
  'visionary',
  'healer',
  'rebel',
  'dreamer',
  'connector'
]);

export const Gender = z.enum(['male', 'female']);

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(2).max(30),
  college: z.string(),
  character: CharacterType.optional(),
  gender: Gender.optional(),
  profileComplete: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  connections: z.array(z.string()).default([]),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });

// Post schema
export const postSchema = z.object({
  id: z.string(),
  userId: z.string(),
  content: z.string().min(1).max(500),
  imageUrl: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  isPoll: z.boolean().default(false),
  pollOptions: z.array(z.object({
    text: z.string(),
    votes: z.number().default(0)
  })).optional(),
  likes: z.array(z.string()).default([]),
  comments: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: z.date(),
    isAnonymous: z.boolean().default(false)
  })).default([]),
  createdAt: z.date().default(() => new Date()),
});

export const insertPostSchema = postSchema.omit({ id: true, createdAt: true, likes: true, comments: true });

// Quiz schema
export const quizResponseSchema = z.object({
  userId: z.string(),
  responses: z.array(z.object({
    questionId: z.string(),
    answer: z.string()
  })),
  calculatedCharacter: CharacterType,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = z.infer<typeof postSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type QuizResponse = z.infer<typeof quizResponseSchema>;
export type CharacterTypeValue = z.infer<typeof CharacterType>;
export type GenderValue = z.infer<typeof Gender>;

// Character definitions
export const CHARACTERS = {
  // Male characters
  strategist: { emoji: '🧠', name: 'Strategist', traits: ['logical', 'planner', 'analytical'], gender: 'male' as const },
  explorer: { emoji: '🌍', name: 'Explorer', traits: ['adventurous', 'curious', 'open-minded'], gender: 'male' as const },
  guardian: { emoji: '🛡️', name: 'Guardian', traits: ['reliable', 'protective', 'loyal'], gender: 'male' as const },
  maverick: { emoji: '🔥', name: 'Maverick', traits: ['bold', 'daring', 'independent'], gender: 'male' as const },
  artist: { emoji: '🎨', name: 'Artist', traits: ['creative', 'emotional', 'expressive'], gender: 'male' as const },
  
  // Female characters
  visionary: { emoji: '🌟', name: 'Visionary', traits: ['ambitious', 'leader', 'inspiring'], gender: 'female' as const },
  healer: { emoji: '💙', name: 'Healer', traits: ['kind', 'empathetic', 'caring'], gender: 'female' as const },
  rebel: { emoji: '⚡', name: 'Rebel', traits: ['fearless', 'outspoken', 'revolutionary'], gender: 'female' as const },
  dreamer: { emoji: '☁️', name: 'Dreamer', traits: ['imaginative', 'hopeful', 'visionary'], gender: 'female' as const },
  connector: { emoji: '🤝', name: 'Connector', traits: ['social', 'friendly', 'collaborative'], gender: 'female' as const },
};

// Quiz questions for character assignment
export const QUIZ_QUESTIONS = [
  {
    id: '1',
    question: 'In a group project, you typically:',
    options: [
      { text: 'Take charge and organize the timeline', value: 'strategist,visionary' },
      { text: 'Research new approaches and possibilities', value: 'explorer,dreamer' },
      { text: 'Make sure everyone feels included', value: 'guardian,healer' },
      { text: 'Challenge conventional methods', value: 'maverick,rebel' },
      { text: 'Focus on the creative aspects', value: 'artist,connector' }
    ]
  },
  {
    id: '2', 
    question: 'Your ideal weekend involves:',
    options: [
      { text: 'Planning your week ahead', value: 'strategist,visionary' },
      { text: 'Exploring a new place or activity', value: 'explorer,dreamer' },
      { text: 'Spending quality time with loved ones', value: 'guardian,healer' },
      { text: 'Taking on an exciting challenge', value: 'maverick,rebel' },
      { text: 'Working on a creative project', value: 'artist,connector' }
    ]
  },
  {
    id: '3',
    question: 'When facing a difficult decision, you:',
    options: [
      { text: 'Analyze all possible outcomes', value: 'strategist,visionary' },
      { text: 'Seek new perspectives and information', value: 'explorer,dreamer' },
      { text: 'Consider how it affects others', value: 'guardian,healer' },
      { text: 'Trust your instincts and take action', value: 'maverick,rebel' },
      { text: 'Look for creative solutions', value: 'artist,connector' }
    ]
  },
  {
    id: '4',
    question: 'In social situations, you:',
    options: [
      { text: 'Lead conversations and discussions', value: 'strategist,visionary' },
      { text: 'Ask questions and learn about others', value: 'explorer,dreamer' },
      { text: 'Make sure everyone feels comfortable', value: 'guardian,healer' },
      { text: 'Share bold ideas and opinions', value: 'maverick,rebel' },
      { text: 'Connect people with similar interests', value: 'artist,connector' }
    ]
  },
  {
    id: '5',
    question: 'Your biggest strength is:',
    options: [
      { text: 'Strategic thinking and planning', value: 'strategist,visionary' },
      { text: 'Curiosity and adaptability', value: 'explorer,dreamer' },
      { text: 'Loyalty and dependability', value: 'guardian,healer' },
      { text: 'Courage and determination', value: 'maverick,rebel' },
      { text: 'Creativity and empathy', value: 'artist,connector' }
    ]
  }
];

// College domains for verification
export const COLLEGE_DOMAINS = [
  'iitd.ac.in',
  'iitb.ac.in', 
  'iitm.ac.in',
  'iitk.ac.in',
  'iitr.ac.in',
  'vit.ac.in',
  'srmist.edu.in',
  'christuniversity.in',
  'loyolacollege.edu',
  'annauniv.edu'
];
