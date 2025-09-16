import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import { TitleProvider } from "@/components/providers/title-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "News App Admin Dashboard",
  description: "Admin dashboard for managing news articles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  console.log('🎨 Theme script executing...');
                  
                  // Get theme from localStorage or default to light
                  var theme = localStorage.getItem('theme') || 'light';
                  var appearanceSettings = localStorage.getItem('appearanceSettings');
                  
                  console.log('📱 Initial theme from localStorage:', theme);
                  console.log('⚙️ Appearance settings available:', !!appearanceSettings);
                  
                  if (appearanceSettings) {
                    try {
                      var settings = JSON.parse(appearanceSettings);
                      if (settings.theme) {
                        theme = settings.theme;
                        console.log('🔄 Theme updated from appearance settings:', theme);
                      }
                      
                      // Apply primary color if available
                      if (settings.primaryColor) {
                        var hex = settings.primaryColor.replace('#', '');
                        var r = parseInt(hex.substr(0, 2), 16);
                        var g = parseInt(hex.substr(2, 2), 16);
                        var b = parseInt(hex.substr(4, 2), 16);
                        
                        document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
                        document.documentElement.style.setProperty('--primary-rgb', r + ', ' + g + ', ' + b);
                        console.log('🎨 Primary color applied:', settings.primaryColor);
                      }
                    } catch (parseError) {
                      console.warn('⚠️ Failed to parse appearance settings:', parseError);
                    }
                  }
                  
                  // Apply theme immediately to prevent FOUC
                  var root = document.documentElement;
                  
                  // Clear any existing theme classes
                  root.classList.remove('light', 'dark');
                  
                  var effectiveTheme = theme;
                  
                  if (theme === 'auto') {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    effectiveTheme = prefersDark ? 'dark' : 'light';
                    console.log('🌙 Auto theme resolved to:', effectiveTheme);
                  }
                  
                  // Apply the theme
                  root.classList.add(effectiveTheme);
                  root.setAttribute('data-theme', effectiveTheme);
                  root.style.colorScheme = effectiveTheme;
                  
                  console.log('✅ Theme applied successfully:', effectiveTheme);
                  console.log('📋 DOM classes:', root.className);
                  console.log('🏷️ Data theme:', root.getAttribute('data-theme'));
                  
                } catch (e) {
                  console.error('❌ Error applying theme:', e);
                  // Fallback to light theme
                  var root = document.documentElement;
                  root.classList.remove('light', 'dark');
                  root.classList.add('light');
                  root.setAttribute('data-theme', 'light');
                  root.style.colorScheme = 'light';
                  console.log('🔄 Fallback to light theme applied');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppearanceProvider>
          <AuthProvider>
            <TitleProvider>
              {children}
            </TitleProvider>
          </AuthProvider>
        </AppearanceProvider>
      </body>
    </html>
  );
}
