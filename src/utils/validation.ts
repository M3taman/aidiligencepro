import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Report validation schemas
export const reportSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().optional(),
  financialMetrics: z.object({
    revenue: z.number().positive().optional(),
    growth: z.number().min(-100).max(100).optional(),
    profitMargin: z.number().min(0).max(100).optional(),
    cashFlow: z.number().optional(),
  }).optional(),
  risks: z.object({
    financial: z.array(z.string()).optional(),
    operational: z.array(z.string()).optional(),
    market: z.array(z.string()).optional(),
    regulatory: z.array(z.string()).optional(),
  }).optional(),
  recommendations: z.object({
    shortTerm: z.array(z.string()).optional(),
    longTerm: z.array(z.string()).optional(),
    critical: z.array(z.string()).optional(),
  }).optional(),
  marketAnalysis: z.object({
    competitors: z.array(z.string()).optional(),
    marketSize: z.string().optional(),
    trends: z.array(z.string()).optional(),
  }).optional(),
});

// Profile validation schema
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  role: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// Settings validation schema
export const settingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    reportUpdates: z.boolean(),
  }),
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
});

// Type inference
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
} 