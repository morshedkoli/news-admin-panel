'use client';

import { useEffect, useState } from 'react';

interface TitleProviderProps {
  children: React.ReactNode;
}

export function TitleProvider({ children }: TitleProviderProps) {
  const [siteName, setSiteName] = useState<string>('News App Admin Dashboard');

  useEffect(() => {
    const loadSiteName = async () => {
      try {
        const response = await fetch('/api/settings');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON');
        }
        
        const data = await response.json();
        if (data.general?.siteName) {
          setSiteName(data.general.siteName);
          // Update document title
          document.title = data.general.siteName;
        }
      } catch (error) {
        console.warn('Failed to load site name for title:', error);
        // Keep default title
      }
    };

    loadSiteName();
  }, []);

  return <>{children}</>;
}
