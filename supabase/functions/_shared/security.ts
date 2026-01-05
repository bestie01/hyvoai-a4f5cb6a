// Shared security utilities for edge functions

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generic error messages for client - never expose internal errors
export const ErrorMessages = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  BAD_REQUEST: 'Invalid request parameters',
  NOT_FOUND: 'Resource not found',
  RATE_LIMITED: 'Too many requests, please try again later',
  INTERNAL_ERROR: 'An unexpected error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  AI_ERROR: 'AI processing failed, please try again',
  VALIDATION_ERROR: 'Validation failed',
};

// Safe error response - logs details server-side, returns generic message to client
export function safeErrorResponse(
  error: unknown,
  context: string,
  statusCode: number = 500,
  clientMessage: string = ErrorMessages.INTERNAL_ERROR
): Response {
  // Log full error details server-side for debugging
  console.error(`[${context}] Error:`, {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Return generic message to client
  return new Response(
    JSON.stringify({ 
      error: clientMessage,
      code: statusCode,
    }),
    { 
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// Safe JSON parsing with fallback
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

// Safe AI response parsing
export function parseAIResponse<T>(aiData: any, defaultValue: T): T {
  try {
    const content = aiData?.choices?.[0]?.message?.content;
    if (!content) {
      console.warn('[AI-PARSE] No content in AI response');
      return defaultValue;
    }
    return JSON.parse(content) as T;
  } catch (error) {
    console.error('[AI-PARSE] Failed to parse AI response:', error);
    return defaultValue;
  }
}

// Rate limiting helper (basic in-memory, consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Input validation helpers
export function validateRequired(fields: Record<string, any>): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      return `${key} is required`;
    }
  }
  return null;
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).trim();
}
