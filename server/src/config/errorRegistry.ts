export interface ErrorCodeDefinition {
  code: string;
  httpStatus: number;
  title: string;
  category: string;
  explanation: string;
  causes: string[];
  resolutionSteps: string[];
  isRetryable: boolean;
}

export const ERROR_REGISTRY: Record<string, ErrorCodeDefinition> = {
  '400': {
    code: '400',
    httpStatus: 400,
    title: 'Bad Request',
    category: 'Client Error',
    explanation: 'The request could not be processed due to invalid syntax, missing parameters, or payload validation failure.',
    causes: [
      'Required fields in the request body were omitted.',
      'Data types do not match the expected schema (e.g. invalid string, number, or email format).',
      'Malformed JSON payload syntax.'
    ],
    resolutionSteps: [
      'Verify that all required form and query inputs are filled out.',
      'Inspect field types against validation errors.',
      'Check the request body format and try again.'
    ],
    isRetryable: false,
  },
  '401': {
    code: '401',
    httpStatus: 401,
    title: 'Unauthorized',
    category: 'Authentication',
    explanation: 'Authentication is required and has failed or has not been provided. Your session token is either missing or expired.',
    causes: [
      'Session token expired after prolonged inactivity.',
      'Attempting to perform user-only actions without an active account session.',
      'Invalid login credentials provided.'
    ],
    resolutionSteps: [
      'Log in again through the /login page.',
      'Confirm your email and password credentials.',
      'Ensure cookies or bearer tokens are transmitted properly.'
    ],
    isRetryable: true,
  },
  '403': {
    code: '403',
    httpStatus: 403,
    title: 'Forbidden',
    category: 'Authorization',
    explanation: 'The server understood the request, but your authenticated user lacks authorization to access or modify this resource.',
    causes: [
      'Attempting to join or view a private focus room without an invitation.',
      'Trying to edit or delete content created by another user.',
      'Attempting administrative actions without group creator privileges.'
    ],
    resolutionSteps: [
      'Verify that you are using the correct account.',
      'Request access from the circle or room host.',
      'Check room privacy settings in the Focus Rooms directory.'
    ],
    isRetryable: false,
  },
  '404': {
    code: '404',
    httpStatus: 404,
    title: 'Not Found',
    category: 'Lookup & Navigation',
    explanation: 'The requested resource, room, URL, or user profile could not be located on the server.',
    causes: [
      'The requested URL was typed incorrectly or changed.',
      'The focus room has ended, was deleted, or expired.',
      'The specific support ticket ID or challenge does not exist.'
    ],
    resolutionSteps: [
      'Check the address bar for typographical errors.',
      'Return to the Dashboard or Focus Rooms directory.',
      'Use the FAQ search to locate relevant resources.'
    ],
    isRetryable: false,
  },
  '429': {
    code: '429',
    httpStatus: 429,
    title: 'Too Many Requests',
    category: 'Rate Limiting',
    explanation: 'You have sent too many requests in a given amount of time. Social Detox applies rate limits to ensure fair usage and prevent spam.',
    causes: [
      'Sending too many prompts to the AI assistant in quick succession.',
      'Repeated support ticket submissions within a few minutes.',
      'Frequent automated polling of focus room endpoints.'
    ],
    resolutionSteps: [
      'Wait approximately 60 seconds before submitting another prompt or ticket.',
      'Throttle rapid clicks on interactive controls.',
      'Allow background sync to poll at normal intervals.'
    ],
    isRetryable: true,
  },
  '500': {
    code: '500',
    httpStatus: 500,
    title: 'Internal Server Error',
    category: 'Server Error',
    explanation: 'An unexpected condition was encountered on the server that prevented it from fulfilling the request.',
    causes: [
      'Unexpected server-side runtime exception.',
      'Database driver query interruption or syntax error.',
      'Uncaught asynchronous failure in backend processing.'
    ],
    resolutionSteps: [
      'Refresh your browser tab or retry the action.',
      'Check the /health status page to confirm backend service health.',
      'Submit a support ticket with your request ID if the error recurs.'
    ],
    isRetryable: true,
  },
  '503': {
    code: '503',
    httpStatus: 503,
    title: 'Service Unavailable',
    category: 'Service Health',
    explanation: 'The server is temporarily unable to handle the request due to maintenance, upstream service outage, or high load.',
    causes: [
      'Database service is unreachable or restarting.',
      'External third-party API (motivation quote or AI model) timed out.',
      'High concurrency spike during campus study sessions.'
    ],
    resolutionSteps: [
      'Wait 15 to 30 seconds and retry your request.',
      'Cached offline and solo timer modes remain available during upstream outages.',
      'Verify service connectivity via the Health page.'
    ],
    isRetryable: true,
  },
  'SD-001': {
    code: 'SD-001',
    httpStatus: 409,
    title: 'Focus Session Synchronization Failed',
    category: 'Focus Room Engine',
    explanation: 'The real-time focus timer drifted or lost WebSocket synchronization with the server master clock.',
    causes: [
      'Device network disconnected or switched Wi-Fi networks during an active session.',
      'Browser tab was placed into aggressive power-saving sleep by the operating system.',
      'Socket.IO connection heartbeat timed out between client and server.'
    ],
    resolutionSteps: [
      'Click the "Resync Timer" button inside the active focus room.',
      'Refresh the room page to re-establish the WebSocket connection.',
      'Keep the study tab active or pinned to prevent browser background throttling.'
    ],
    isRetryable: true,
  },
};

export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(code: string, customMessage?: string, details?: any) {
    const errorDef = ERROR_REGISTRY[code];
    super(customMessage || errorDef?.explanation || 'An unexpected error occurred.');
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = errorDef ? errorDef.httpStatus : 500;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
