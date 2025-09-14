'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserList } from '@/components/users/user-list';
import { UserForm } from '@/components/users/user-form';
import { UserStatistics } from '@/components/users/user-statistics';
import { Users, UserPlus, BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserData {
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  emailVerified: Date | null;
  permissions: string[];
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: { name: string; email: string; role: string; password?: string }) => {
    try {
      setFormLoading(true);
      
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingUser(undefined);
        // Refresh the user list by switching tabs
        setActiveTab('list');
      } else {
        const errorData = await response.json();
        console.error('Failed to save user:', errorData.error);
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error saving user:', error);
      // TODO: Show error message to user
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUser(undefined);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleFormCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </div>
        
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <UserList 
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <UserStatistics />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <UserForm
            onSubmit={handleFormSubmit}
            onCancel={() => setActiveTab('list')}
            loading={formLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}