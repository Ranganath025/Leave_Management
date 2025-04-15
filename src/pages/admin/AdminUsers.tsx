
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, FilterX, Plus, UserPlus, Edit, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { usersAPI } from '@/services/api';

const roleColors = {
  employee: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  manager: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  admin: 'bg-red-100 text-red-800 hover:bg-red-100'
};

const statusColors = {
  active: 'bg-green-100 text-green-800 hover:bg-green-100',
  inactive: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  'on leave': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getAllUsers();
        
        // Ensure we always have an array
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error('Expected array but got:', response.data);
          setUsers([]);
          toast.error('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query and filters
  const filteredUsers = Array.isArray(users) 
    ? users.filter(user => {
        const matchesSearch = 
          (user.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (user.department?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        
        const matchesRole = roleFilter === 'all' || (user.role?.toLowerCase() || '') === roleFilter.toLowerCase();
        const matchesStatus = statusFilter === 'all' || (user.status?.toLowerCase() || '') === statusFilter.toLowerCase();
        
        return matchesSearch && matchesRole && matchesStatus;
      })
    : [];

  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <DashboardLayout pageTitle="User Management" role="admin">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">User Management</h1>
            <p className="text-gray-600">Manage all users in the organization</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for the organization.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>User form would go here</p>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by name, email or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <Tabs defaultValue="all" value={roleFilter} onValueChange={setRoleFilter}>
              <TabsList>
                <TabsTrigger value="all">All Roles</TabsTrigger>
                <TabsTrigger value="employee">Employees</TabsTrigger>
                <TabsTrigger value="manager">Managers</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All Status</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <TabsTrigger value="on leave">On Leave</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <FilterX size={16} />
              Reset
            </Button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role] || 'bg-gray-100'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[user.status] || 'bg-gray-100'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.manager?.fullName || 'None'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">View</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="font-bold">{user.fullName}</p>
                              <p className="text-gray-500">{user.email}</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <p>Edit form would go here</p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 border rounded-lg">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
