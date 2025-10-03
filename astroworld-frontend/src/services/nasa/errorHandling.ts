// src/services/nasa/errorHandling.ts
import { AxiosError } from 'axios';

export interface NASAAPIError {
  message: string;
  code?: string;
  details?: any;
  isRetryable: boolean;
}

export const handleNASAAPIError = (error: AxiosError): NASAAPIError => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data as any;
    
    switch (status) {
      case 400:
        return {
          message: data?.detail || 'Invalid request parameters',
          code: 'INVALID_REQUEST',
          details: data,
          isRetryable: false,
        };
      
      case 401:
        return {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          details: data,
          isRetryable: false,
        };
      
      case 403:
        return {
          message: 'Access forbidden',
          code: 'FORBIDDEN',
          details: data,
          isRetryable: false,
        };
      
      case 404:
        return {
          message: 'Requested data not found',
          code: 'NOT_FOUND',
          details: data,
          isRetryable: false,
        };
      
      case 429:
        return {
          message: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMITED',
          details: data,
          isRetryable: true,
        };
      
      case 500:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          details: data,
          isRetryable: true,
        };
      
      case 503:
        return {
          message: 'Service temporarily unavailable',
          code: 'SERVICE_UNAVAILABLE',
          details: data,
          isRetryable: true,
        };
      
      default:
        return {
          message: data?.detail || 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
          details: data,
          isRetryable: true,
        };
    }
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      details: error.request,
      isRetryable: true,
    };
  } else {
    // Request setup error
    return {
      message: 'Request configuration error',
      code: 'REQUEST_ERROR',
      details: error.message,
      isRetryable: false,
    };
  }
};

export const formatErrorMessage = (error: NASAAPIError): string => {
  return error.message;
};

export const shouldRetryError = (error: NASAAPIError): boolean => {
  return error.isRetryable;
};