'use client';

import { useAppearance } from '@/contexts/AppearanceContext';
import { useEffect, useState } from 'react';

export function ThemeDebug() {
  const { appearance } = useAppearance();
  const [localStorageTheme, setLocalStorageTheme] = useState<string>('');
  const [localStorageSettings, setLocalStorageSettings] = useState<string>('');
  const [domClasses, setDomClasses] = useState<string>('');
  const [dataTheme, setDataTheme] = useState<string>('');

  useEffect(() => {
    // Check localStorage values
    const theme = localStorage.getItem('theme') || 'not set';
    const settings = localStorage.getItem('appearanceSettings') || 'not set';
    
    setLocalStorageTheme(theme);
    setLocalStorageSettings(settings !== 'not set' ? 'stored' : 'not set');
    
    // Check DOM values
    if (typeof window !== 'undefined') {
      setDomClasses(document.documentElement.className);
      setDataTheme(document.documentElement.getAttribute('data-theme') || 'not set');
    }
  }, [appearance]);

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
      <h4 className="font-semibold mb-2 text-foreground">🎨 Theme Debug Info</h4>
      <div className="space-y-1 text-muted-foreground">
        <div>
          <strong>Context Theme:</strong> <span className="text-foreground">{appearance.theme}</span>
        </div>
        <div>
          <strong>LocalStorage Theme:</strong> <span className="text-foreground">{localStorageTheme}</span>
        </div>
        <div>
          <strong>Primary Color:</strong> <span className="text-foreground">{appearance.primaryColor}</span>
        </div>
        <div>
          <strong>DOM Classes:</strong> <span className="text-foreground text-xs break-all">{domClasses}</span>
        </div>
        <div>
          <strong>Data Theme:</strong> <span className="text-foreground">{dataTheme}</span>
        </div>
        <div>
          <strong>Settings Stored:</strong> <span className="text-foreground">{localStorageSettings}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-border">
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
          >
            Test Refresh
          </button>
        </div>
      </div>
    </div>
  );
}