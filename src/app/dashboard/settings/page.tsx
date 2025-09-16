'use client';

import { useState, useEffect } from 'react';
import { useAppearance } from '@/contexts/AppearanceContext';
import { ThemeDebug } from '@/components/debug/ThemeDebug';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Settings2,
  Shield,
  Bell,
  Palette,
  Database,
  Mail,
  Globe,
  Users,
  FileText,
  Image,
  Server,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    newsPerPage: number;
    enableRegistration: boolean;
    enableComments: boolean;
    autoPublish: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    loginAttempts: number;
    enableCaptcha: boolean;
    allowedDomains: string;
    ipWhitelist: string;
  };
  notifications: {
    enablePushNotifications: boolean;
    enableEmailNotifications: boolean;
    defaultNotificationSound: string;
    notifyOnNewUser: boolean;
    notifyOnNewNews: boolean;
    notifyOnNewsUpdate: boolean;
    notifyOnComment: boolean;
    notificationSchedule: string;
    fcmServerKey: string;
  };
  appearance: {
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
  };
  system: {
    enableDebugMode: boolean;
    enableAnalytics: boolean;
    cacheExpiry: number;
    maxFileSize: number;
    allowedFileTypes: string;
    backupFrequency: string;
    enableMaintenanceMode: boolean;
    maintenanceMessage: string;
  };
}

export default function Settings() {
  const { appearance, updateAppearance } = useAppearance();
  const [settings, setSettings] = useState<Settings>({
    general: {
      siteName: 'News Admin Dashboard',
      siteDescription: 'Professional news management system',
      adminEmail: 'admin@newsapp.com',
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      newsPerPage: 10,
      enableRegistration: false,
      enableComments: true,
      autoPublish: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireEmailVerification: true,
      loginAttempts: 5,
      enableCaptcha: false,
      allowedDomains: '',
      ipWhitelist: '',
    },
    notifications: {
      enablePushNotifications: true,
      enableEmailNotifications: true,
      defaultNotificationSound: 'default',
      notifyOnNewUser: true,
      notifyOnNewNews: true,
      notifyOnNewsUpdate: false,
      notifyOnComment: true,
      notificationSchedule: 'instant',
      fcmServerKey: '',
    },
    appearance: appearance,
    system: {
      enableDebugMode: false,
      enableAnalytics: true,
      cacheExpiry: 3600,
      maxFileSize: 10,
      allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx',
      backupFrequency: 'daily',
      enableMaintenanceMode: false,
      maintenanceMessage: 'System under maintenance. Please try again later.',
    },
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showFCMKey, setShowFCMKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON');
      }
      
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save settings');
      }
    } catch (error) {
      setError('Network error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof Settings, key: string, value: unknown) => {
    if (section === 'appearance') {
      // Update appearance context immediately
      updateAppearance({ [key]: value });
      
      // For theme dropdown changes, save immediately
      if (key === 'theme') {
        try {
          localStorage.setItem('theme', value as string);
          console.log('Theme saved via dropdown:', value);
        } catch (error) {
          console.error('Failed to save theme:', error);
        }
      }
    }
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your news application settings and preferences
          </p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {saved && (
        <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700">
              Settings saved successfully!
            </span>
          </div>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Site Information
                </CardTitle>
                <CardDescription>
                  Basic information about your news website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    placeholder="Enter site name"
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    placeholder="Brief description of your website"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    onClick={saveSettings} 
                    disabled={saving}
                    className="flex items-center gap-2 w-full"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Site Information'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Settings
                </CardTitle>
                <CardDescription>
                  Configure how content is displayed and managed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.general.language} onValueChange={(value) => updateSetting('general', 'language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newsPerPage">News Per Page</Label>
                  <Input
                    id="newsPerPage"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.general.newsPerPage}
                    onChange={(e) => {
                      const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                      updateSetting('general', 'newsPerPage', value);
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Between 1 and 100 articles</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User & Content Options
              </CardTitle>
              <CardDescription>
                Enable or disable various features for users and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.general.enableRegistration}
                    onCheckedChange={(checked) => updateSetting('general', 'enableRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Comments</Label>
                    <p className="text-sm text-muted-foreground">Enable comments on news</p>
                  </div>
                  <Switch
                    checked={settings.general.enableComments}
                    onCheckedChange={(checked) => updateSetting('general', 'enableComments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto Publish</Label>
                    <p className="text-sm text-muted-foreground">Auto-publish news after creation</p>
                  </div>
                  <Switch
                    checked={settings.general.autoPublish}
                    onCheckedChange={(checked) => updateSetting('general', 'autoPublish', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Authentication
                </CardTitle>
                <CardDescription>
                  Configure user authentication and security measures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Require email verification for new users</p>
                  </div>
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Captcha</Label>
                    <p className="text-sm text-muted-foreground">Show captcha on login forms</p>
                  </div>
                  <Switch
                    checked={settings.security.enableCaptcha}
                    onCheckedChange={(checked) => updateSetting('security', 'enableCaptcha', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Policies
                </CardTitle>
                <CardDescription>
                  Set password and session security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="480"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => {
                      const value = Math.max(5, Math.min(480, parseInt(e.target.value) || 5));
                      updateSetting('security', 'sessionTimeout', value);
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Between 5 and 480 minutes</p>
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="4"
                    max="50"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => {
                      const value = Math.max(4, Math.min(50, parseInt(e.target.value) || 4));
                      updateSetting('security', 'passwordMinLength', value);
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Between 4 and 50 characters</p>
                </div>
                <div>
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    min="3"
                    max="20"
                    value={settings.security.loginAttempts}
                    onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Configure domain and IP access restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="allowedDomains">Allowed Email Domains (comma-separated)</Label>
                <Input
                  id="allowedDomains"
                  value={settings.security.allowedDomains}
                  onChange={(e) => updateSetting('security', 'allowedDomains', e.target.value)}
                  placeholder="example.com, company.org"
                />
                <p className="text-sm text-muted-foreground mt-1">Leave empty to allow all domains</p>
              </div>
              <div>
                <Label htmlFor="ipWhitelist">IP Whitelist (comma-separated)</Label>
                <Textarea
                  id="ipWhitelist"
                  value={settings.security.ipWhitelist}
                  onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
                  placeholder="192.168.1.1, 10.0.0.0/24"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">Leave empty to allow all IPs</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Types
                </CardTitle>
                <CardDescription>
                  Configure different types of notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send push notifications to users</p>
                  </div>
                  <Switch
                    checked={settings.notifications.enablePushNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'enablePushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.enableEmailNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'enableEmailNotifications', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="notificationSchedule">Notification Schedule</Label>
                  <Select value={settings.notifications.notificationSchedule} onValueChange={(value) => updateSetting('notifications', 'notificationSchedule', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Event Notifications
                </CardTitle>
                <CardDescription>
                  Choose which events trigger notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>New User Registration</Label>
                    <p className="text-sm text-muted-foreground">Notify when new users register</p>
                  </div>
                  <Switch
                    checked={settings.notifications.notifyOnNewUser}
                    onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnNewUser', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>New News Published</Label>
                    <p className="text-sm text-muted-foreground">Notify when news is published</p>
                  </div>
                  <Switch
                    checked={settings.notifications.notifyOnNewNews}
                    onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnNewNews', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>News Updates</Label>
                    <p className="text-sm text-gray-500">Notify when news is updated</p>
                  </div>
                  <Switch
                    checked={settings.notifications.notifyOnNewsUpdate}
                    onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnNewsUpdate', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>New Comments</Label>
                    <p className="text-sm text-gray-500">Notify when users comment</p>
                  </div>
                  <Switch
                    checked={settings.notifications.notifyOnComment}
                    onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnComment', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Firebase Configuration</CardTitle>
              <CardDescription>
                Configure Firebase Cloud Messaging for push notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fcmServerKey">FCM Server Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="fcmServerKey"
                    type={showFCMKey ? "text" : "password"}
                    value={settings.notifications.fcmServerKey}
                    onChange={(e) => updateSetting('notifications', 'fcmServerKey', e.target.value)}
                    placeholder="Enter Firebase server key"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFCMKey(!showFCMKey)}
                  >
                    {showFCMKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Get this key from your Firebase project settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme & Colors
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.appearance.theme} onValueChange={(value) => updateSetting('appearance', 'theme', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">Changes applied instantly</p>
                </div>
                
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Used for buttons, links, and highlights</p>
                </div>

                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.appearance.accentColor || '#10B981'}
                      onChange={(e) => updateSetting('appearance', 'accentColor', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={settings.appearance.accentColor || '#10B981'}
                      onChange={(e) => updateSetting('appearance', 'accentColor', e.target.value)}
                      placeholder="#10B981"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Used for success states and notifications</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch to dark theme interface</p>
                  </div>
                  <Switch
                    checked={settings.appearance.theme === 'dark'}
                    onCheckedChange={(checked) => {
                      const newTheme = checked ? 'dark' : 'light';
                      updateSetting('appearance', 'theme', newTheme);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Branding
                </CardTitle>
                <CardDescription>
                  Upload logos and customize branding elements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Logo</Label>
                  <FileUpload
                    label="Logo"
                    currentUrl={settings.appearance.logoUrl}
                    onUpload={(url) => updateSetting('appearance', 'logoUrl', url)}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                    description="Upload your logo (max 2MB)"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Displayed in the header and login page</p>
                </div>

                <div>
                  <Label>Favicon</Label>
                  <FileUpload
                    label="Favicon"
                    currentUrl={settings.appearance.faviconUrl}
                    onUpload={(url) => updateSetting('appearance', 'faviconUrl', url)}
                    accept="image/*"
                    maxSize={512 * 1024} // 512KB
                    description="Upload your favicon (max 512KB, preferably .ico or .png)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Shown in browser tabs and bookmarks</p>
                </div>

                {settings.appearance.logoUrl && (
                  <div>
                    <Label>Logo Preview</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                      <img 
                        src={settings.appearance.logoUrl} 
                        alt="Logo preview" 
                        className="max-h-16 max-w-32 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Theme Debug</h4>
                      <div className="text-xs space-y-1 p-3 rounded bg-muted">
                        <div>Current theme: <span className="font-mono">{settings.appearance.theme}</span></div>
                        <div>Enable dark mode: <span className="font-mono">{settings.appearance.enableDarkMode ? 'true' : 'false'}</span></div>
                        <div>HTML classes: <span className="font-mono" id="theme-debug-classes">-</span></div>
                        <div>Color scheme: <span className="font-mono" id="theme-debug-scheme">-</span></div>
                      </div>
                      <script
                        dangerouslySetInnerHTML={{
                          __html: `
                            setInterval(() => {
                              const classesEl = document.getElementById('theme-debug-classes');
                              const schemeEl = document.getElementById('theme-debug-scheme');
                              if (classesEl && schemeEl) {
                                classesEl.textContent = document.documentElement.className;
                                schemeEl.textContent = getComputedStyle(document.documentElement).colorScheme || 'none';
                              }
                            }, 1000);
                          `,
                        }}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Live Color Preview</h4>
                  <div className="space-y-2">
                    <div 
                      className="p-3 rounded border-l-4"
                      style={{ 
                        backgroundColor: settings.appearance.primaryColor + '15',
                        borderLeftColor: settings.appearance.primaryColor,
                        color: settings.appearance.primaryColor
                      }}
                    >
                      Primary color example
                    </div>
                    {settings.appearance.accentColor && (
                      <div 
                        className="p-3 rounded border-l-4"
                        style={{ 
                          backgroundColor: settings.appearance.accentColor + '15',
                          borderLeftColor: settings.appearance.accentColor,
                          color: settings.appearance.accentColor
                        }}
                      >
                        Accent color example
                      </div>
                    )}
                    <div className="text-center pt-2">
                      <button
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: settings.appearance.primaryColor }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Layout Options</CardTitle>
              <CardDescription>
                Configure the dashboard layout and navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-gray-500">Reduce padding and spacing</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Breadcrumbs</Label>
                    <p className="text-sm text-gray-500">Display navigation breadcrumbs</p>
                  </div>
                  <Switch
                    checked={settings.appearance.showBreadcrumbs}
                    onCheckedChange={(checked) => updateSetting('appearance', 'showBreadcrumbs', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Collapsed Sidebar</Label>
                    <p className="text-sm text-gray-500">Start with sidebar collapsed</p>
                  </div>
                  <Switch
                    checked={settings.appearance.sidebarCollapsed}
                    onCheckedChange={(checked) => updateSetting('appearance', 'sidebarCollapsed', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>
                Add custom CSS to personalize your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="customCSS">Custom CSS Code</Label>
                <Textarea
                  id="customCSS"
                  value={settings.appearance.customCSS}
                  onChange={(e) => updateSetting('appearance', 'customCSS', e.target.value)}
                  placeholder="/* Add your custom CSS here */"
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Use with caution. Invalid CSS may break the interface.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Performance
                </CardTitle>
                <CardDescription>
                  Configure system performance and caching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cacheExpiry">Cache Expiry (seconds)</Label>
                  <Input
                    id="cacheExpiry"
                    type="number"
                    min="60"
                    max="86400"
                    value={settings.system.cacheExpiry}
                    onChange={(e) => updateSetting('system', 'cacheExpiry', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500 mt-1">How long to cache data (60-86400 seconds)</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-500">Enable detailed error logging</p>
                  </div>
                  <Switch
                    checked={settings.system.enableDebugMode}
                    onCheckedChange={(checked) => updateSetting('system', 'enableDebugMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Analytics</Label>
                    <p className="text-sm text-gray-500">Collect usage analytics</p>
                  </div>
                  <Switch
                    checked={settings.system.enableAnalytics}
                    onCheckedChange={(checked) => updateSetting('system', 'enableAnalytics', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Management
                </CardTitle>
                <CardDescription>
                  Configure file upload and storage settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.system.maxFileSize}
                    onChange={(e) => {
                      const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                      updateSetting('system', 'maxFileSize', value);
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">Between 1 and 100 MB</p>
                </div>
                <div>
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.system.allowedFileTypes}
                    onChange={(e) => updateSetting('system', 'allowedFileTypes', e.target.value)}
                    placeholder="jpg,png,pdf,doc"
                  />
                  <p className="text-sm text-gray-500 mt-1">Comma-separated file extensions</p>
                </div>
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select value={settings.system.backupFrequency} onValueChange={(value) => updateSetting('system', 'backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Maintenance Mode
              </CardTitle>
              <CardDescription>
                Put the system in maintenance mode to perform updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Temporarily disable public access</p>
                </div>
                <Switch
                  checked={settings.system.enableMaintenanceMode}
                  onCheckedChange={(checked) => updateSetting('system', 'enableMaintenanceMode', checked)}
                />
              </div>
              {settings.system.enableMaintenanceMode && (
                <div>
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={settings.system.maintenanceMessage}
                    onChange={(e) => updateSetting('system', 'maintenanceMessage', e.target.value)}
                    placeholder="Enter message to display during maintenance"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Current system information and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600">Database</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600">Firebase</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600">Storage</span>
                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600">Environment</span>
                  <Badge className="bg-blue-100 text-blue-800">Development</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Theme Debug Component - Only show in development */}
      {process.env.NODE_ENV === 'development' && <ThemeDebug />}
    </div>
  );
}