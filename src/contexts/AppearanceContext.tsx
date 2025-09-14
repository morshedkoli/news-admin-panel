'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppearanceSettings {
  theme: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  customCSS: string;
  enableDarkMode: boolean;
  compactMode: boolean;
  showBreadcrumbs: boolean;
  sidebarCollapsed: boolean;
}

interface AppearanceContextType {
  appearance: AppearanceSettings;
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
  applyTheme: (theme: string) => void;
  applyPrimaryColor: (color: string) => void;
  loadAppearanceSettings: () => Promise<void>;
}

const defaultAppearance: AppearanceSettings = {
  theme: 'light',
  primaryColor: '#3b82f6',
  accentColor: '#10B981',
  logoUrl: '',
  faviconUrl: '',
  customCSS: '',
  enableDarkMode: true,
  compactMode: false,
  showBreadcrumbs: true,
  sidebarCollapsed: false,
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration - only load from localStorage after client-side hydration
  useEffect(() => {
    setIsHydrated(true);
    
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('appearanceSettings');
        if (savedSettings) {
          const localSettings = JSON.parse(savedSettings);
          console.log('Loading appearance state from localStorage after hydration:', localSettings);
          setAppearance(localSettings);
          return;
        }
        
        // Fallback to individual items
        const theme = localStorage.getItem('theme') || 'light';
        const primaryColor = localStorage.getItem('primaryColor') || '#3b82f6';
        const customCSS = localStorage.getItem('customCSS') || '';
        const faviconUrl = localStorage.getItem('faviconUrl') || '';
        
        const initialSettings = {
          ...defaultAppearance,
          theme,
          primaryColor,
          customCSS,
          faviconUrl,
        };
        
        console.log('Loading appearance state from individual items after hydration:', initialSettings);
        setAppearance(initialSettings);
      } catch (error) {
        console.error('Error loading appearance state after hydration:', error);
      }
    }
  }, []);

  const updateAppearance = (settings: Partial<AppearanceSettings>) => {
    setAppearance(prev => {
      const newSettings = { ...prev, ...settings };
      
      // Apply theme changes immediately
      if (settings.theme !== undefined) {
        applyTheme(settings.theme);
      }
      
      // Apply color changes immediately
      if (settings.primaryColor) {
        applyPrimaryColor(settings.primaryColor);
      }
      
      // Apply custom CSS immediately
      if (settings.customCSS !== undefined) {
        applyCustomCSS(settings.customCSS);
      }
      
      // Apply favicon immediately
      if (settings.faviconUrl !== undefined) {
        applyFavicon(settings.faviconUrl);
      }
      
      // Save all settings to localStorage for persistence
      try {
        localStorage.setItem('appearanceSettings', JSON.stringify(newSettings));
        
        // Also save individual items for backward compatibility
        if (settings.theme !== undefined) {
          localStorage.setItem('theme', settings.theme);
        }
        if (settings.primaryColor) {
          localStorage.setItem('primaryColor', settings.primaryColor);
        }
        if (settings.customCSS !== undefined) {
          localStorage.setItem('customCSS', settings.customCSS);
        }
        if (settings.faviconUrl !== undefined) {
          localStorage.setItem('faviconUrl', settings.faviconUrl);
        }
        
        console.log('Appearance settings saved to localStorage:', newSettings);
      } catch (error) {
        console.error('Failed to save appearance settings to localStorage:', error);
      }
      
      return newSettings;
    });
  };

  const applyTheme = (theme: string) => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (theme === 'auto') {
      // Auto theme - use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const effectiveTheme = prefersDark ? 'dark' : 'light';
      root.classList.add(effectiveTheme);
      
      // Also update the data attribute for better CSS targeting
      root.setAttribute('data-theme', effectiveTheme);
      root.style.colorScheme = effectiveTheme;
    } else {
      root.classList.add(theme);
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
    }
    
    // Store theme preference with error handling
    try {
      localStorage.setItem('theme', theme);
      console.log('Theme saved to localStorage:', theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  };

  const applyPrimaryColor = (color: string) => {
    const root = document.documentElement;
    
    // Convert hex to RGB for CSS variables
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Set CSS custom properties for primary color
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    
    // Update various shades
    root.style.setProperty('--primary-50', `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`);
    root.style.setProperty('--primary-100', `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`);
    root.style.setProperty('--primary-600', `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`);
    root.style.setProperty('--primary-700', `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`);
    
    // Store color preference with error handling
    try {
      localStorage.setItem('primaryColor', color);
      console.log('Primary color saved to localStorage:', color);
    } catch (error) {
      console.error('Failed to save primary color to localStorage:', error);
    }
  };

  const applyCustomCSS = (css: string) => {
    // Remove existing custom CSS
    const existingStyle = document.getElementById('custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Apply new custom CSS
    if (css.trim()) {
      const style = document.createElement('style');
      style.id = 'custom-css';
      style.textContent = css;
      document.head.appendChild(style);
    }
    
    // Store custom CSS with error handling
    try {
      localStorage.setItem('customCSS', css);
      console.log('Custom CSS saved to localStorage');
    } catch (error) {
      console.error('Failed to save custom CSS to localStorage:', error);
    }
  };

  const applyFavicon = (faviconUrl: string) => {
    if (!faviconUrl) return;
    
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }
    
    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
    
    // Store favicon URL with error handling
    try {
      localStorage.setItem('faviconUrl', faviconUrl);
      console.log('Favicon URL saved to localStorage:', faviconUrl);
    } catch (error) {
      console.error('Failed to save favicon URL to localStorage:', error);
    }
  };

  const loadAppearanceSettings = async () => {
    // Skip if we're on the server side
    if (typeof window === 'undefined') return;
    
    try {
      // First load from localStorage for immediate application
      const savedSettings = localStorage.getItem('appearanceSettings');
      if (savedSettings) {
        const localSettings = JSON.parse(savedSettings);
        console.log('Loaded appearance settings from localStorage:', localSettings);
        setAppearance(localSettings);
        // Theme should already be applied by the initial script, so don't reapply
        return localSettings;
      }
      
      // Then try to load from API to sync with server
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.appearance) {
            console.log('Loaded appearance settings from server:', data.appearance);
            setAppearance(data.appearance);
            
            // Only apply settings that might not be handled by the initial script
            if (data.appearance.customCSS) {
              applyCustomCSS(data.appearance.customCSS);
            }
            if (data.appearance.faviconUrl) {
              applyFavicon(data.appearance.faviconUrl);
            }
            
            // Update localStorage with server data
            localStorage.setItem('appearanceSettings', JSON.stringify(data.appearance));
            return data.appearance;
          }
        }
      } catch (apiError) {
        console.warn('Failed to load settings from API, using localStorage only:', apiError);
      }
      
      // Fallback to individual localStorage items if no saved settings object
      const theme = localStorage.getItem('theme') || 'light';
      const primaryColor = localStorage.getItem('primaryColor') || '#3b82f6';
      const customCSS = localStorage.getItem('customCSS') || '';
      const faviconUrl = localStorage.getItem('faviconUrl') || '';
      
      const fallbackSettings = {
        ...defaultAppearance,
        theme,
        primaryColor,
        customCSS,
        faviconUrl,
      };
      
      console.log('Using fallback appearance settings:', fallbackSettings);
      setAppearance(fallbackSettings);
      
      // Apply settings that might not be handled by the initial script
      if (customCSS) {
        applyCustomCSS(customCSS);
      }
      if (faviconUrl) {
        applyFavicon(faviconUrl);
      }
      
      // Save consolidated settings
      localStorage.setItem('appearanceSettings', JSON.stringify(fallbackSettings));
      return fallbackSettings;
    } catch (error) {
      console.error('Failed to load appearance settings:', error);
      // Return default settings without reapplying (initial script should handle)
      return defaultAppearance;
    }
  };

  // Load settings only after hydration to prevent mismatch
  useEffect(() => {
    if (!isHydrated) return;
    
    loadAppearanceSettings();
    
    // Listen for system theme changes when auto theme is selected
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (appearance.theme === 'auto') {
        applyTheme('auto');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isHydrated, appearance.theme]);

  return (
    <AppearanceContext.Provider 
      value={{ 
        appearance, 
        updateAppearance, 
        applyTheme, 
        applyPrimaryColor, 
        loadAppearanceSettings 
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}