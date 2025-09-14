'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Shield,
  UserPlus,
  Settings
} from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']),
  permissions: z.array(z.string()).optional(),
  emailVerified: z.boolean().optional()
});

type UserFormData = z.infer<typeof userSchema>;

interface UserData {
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  emailVerified: Date | null;
  permissions: string[];
}

interface UserFormProps {
  user?: UserData;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'news.create', label: 'Create News', description: 'Can create new news articles' },
  { id: 'news.edit', label: 'Edit News', description: 'Can edit existing news articles' },
  { id: 'news.delete', label: 'Delete News', description: 'Can delete news articles' },
  { id: 'news.publish', label: 'Publish News', description: 'Can publish/unpublish news articles' },
  { id: 'categories.manage', label: 'Manage Categories', description: 'Can create, edit, and delete categories' },
  { id: 'notifications.send', label: 'Send Notifications', description: 'Can send push notifications' },
  { id: 'notifications.manage', label: 'Manage Notifications', description: 'Can manage notification settings' },
  { id: 'users.view', label: 'View Users', description: 'Can view user list and details' },
  { id: 'users.create', label: 'Create Users', description: 'Can create new user accounts' },
  { id: 'users.edit', label: 'Edit Users', description: 'Can edit user accounts' },
  { id: 'users.delete', label: 'Delete Users', description: 'Can delete user accounts' },
  { id: 'analytics.view', label: 'View Analytics', description: 'Can view analytics and reports' },
  { id: 'system.settings', label: 'System Settings', description: 'Can access system settings' }
];

export function UserForm({ user, onSubmit, onCancel, loading = false }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user?.permissions || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'EDITOR',
      status: user?.status || 'ACTIVE',
      permissions: user?.permissions || [],
      emailVerified: !!user?.emailVerified
    }
  });

  const watchRole = watch('role');

  useEffect(() => {
    // Set default permissions based on role
    const defaultPermissions = getDefaultPermissions(watchRole);
    setSelectedPermissions(prev => {
      if (user?.permissions) return user.permissions;
      return defaultPermissions;
    });
    setValue('permissions', user?.permissions || defaultPermissions);
  }, [watchRole, user?.permissions, setValue]);

  const getDefaultPermissions = (role: string): string[] => {
    switch (role) {
      case 'ADMIN':
        return AVAILABLE_PERMISSIONS.map(p => p.id);
      case 'EDITOR':
        return [
          'news.create',
          'news.edit',
          'news.publish',
          'categories.manage',
          'notifications.send',
          'analytics.view'
        ];
      case 'VIEWER':
        return [
          'news.view',
          'analytics.view'
        ];
      default:
        return [];
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    let newPermissions;
    if (checked) {
      newPermissions = [...selectedPermissions, permissionId];
    } else {
      newPermissions = selectedPermissions.filter(p => p !== permissionId);
    }
    setSelectedPermissions(newPermissions);
    setValue('permissions', newPermissions);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    const submitData = {
      ...data,
      permissions: selectedPermissions
    };
    
    // Remove password if it's empty (for edit mode)
    if (!data.password) {
      delete submitData.password;
    }
    
    await onSubmit(submitData);
  };

  const isEditing = !!user?.id;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? <User className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          {isEditing ? 'Edit User' : 'Create New User'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update user information, role, and permissions'
            : 'Create a new user account with role and permissions'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder={isEditing ? 'Enter new password or leave blank' : 'Enter password'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Role and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role & Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={watch('role')} 
                  onValueChange={(value) => setValue('role', value as 'ADMIN' | 'EDITOR' | 'VIEWER')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">Admin</Badge>
                        <span>Full system access</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EDITOR">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">Editor</Badge>
                        <span>Content management</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="VIEWER">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-800">Viewer</Badge>
                        <span>Read-only access</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={watch('status')} 
                  onValueChange={(value) => setValue('status', value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="ACTIVE">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </SelectItem>
                    <SelectItem value="INACTIVE">
                      <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
                    </SelectItem>
                    <SelectItem value="PENDING">
                      <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
                    </SelectItem>
                    <SelectItem value="SUSPENDED">
                      <Badge className="bg-red-100 text-red-800">Suspended</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email Verification</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Checkbox
                    id="emailVerified"
                    checked={watch('emailVerified')}
                    onCheckedChange={(checked: boolean) => setValue('emailVerified', !!checked)}
                  />
                  <Label htmlFor="emailVerified" className="text-sm font-normal">
                    Email verified
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Permissions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={(checked: boolean) => handlePermissionChange(permission.id, !!checked)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                      {permission.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}