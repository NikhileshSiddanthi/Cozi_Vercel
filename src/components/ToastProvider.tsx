import { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface ToastContextType {
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
  showWarning: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastSystem = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastSystem must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const showSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  }, []);

  const showError = useCallback((message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
    });
  }, []);

  const showInfo = useCallback((message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  }, []);

  const showWarning = useCallback((message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  }, []);

  const value = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// Utility functions for common toast patterns
export const toastActions = {
  postPublished: () => toast.success('Post Published', {
    description: 'Your post has been published successfully!',
    duration: 4000,
  }),
  
  postSaved: () => toast.success('Post Saved', {
    description: 'Your changes have been saved.',
    duration: 3000,
  }),
  
  uploadFailed: (error?: string) => toast.error('Upload Failed', {
    description: error || 'There was an error uploading your file. Please try again.',
    duration: 6000,
  }),
  
  loginRequired: () => toast.warning('Login Required', {
    description: 'Please log in to perform this action.',
    duration: 4000,
  }),
  
  copied: () => toast.success('Copied!', {
    description: 'Link copied to clipboard.',
    duration: 2000,
  }),
  
  commentAdded: () => toast.success('Comment Added', {
    description: 'Your comment has been posted.',
    duration: 3000,
  }),
  
  reactionAdded: (type: string) => toast.success('Reaction Added', {
    description: `You reacted with ${type}`,
    duration: 2000,
  }),
};