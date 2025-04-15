
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, FilterX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import DashboardLayout from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { leavesAPI } from '@/services/api';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  Approved: 'bg-green-100 text-green-800 hover:bg-green-100',
  Rejected: 'bg-red-100 text-red-800 hover:bg-red-100'
};

const typeColors = {
  'Annual Leave': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  'Sick Leave': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  'Personal Leave': 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  'Bereavement': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  'Other': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100'
};

const AdminLeaves = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const response = await leavesAPI.getAllLeaves();
        
        // Ensure we always have an array
        if (Array.isArray(response.data)) {
          setLeaveRequests(response.data);
        } else {
          console.error('Expected array but got:', response.data);
          setLeaveRequests([]);
          toast.error('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Failed to fetch leaves:', error);
        toast.error('Failed to load leave requests');
        setLeaveRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  // Filter leave requests based on search query and filters
  const filteredLeaveRequests = Array.isArray(leaveRequests) 
    ? leaveRequests.filter(request => {
        // Search in employee name, type, or reason
        const matchesSearch = 
          (request.user?.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (request.type?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (request.reason?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || (request.status?.toLowerCase() || '') === statusFilter.toLowerCase();
        const matchesType = typeFilter === 'all' || (request.type?.toLowerCase() || '').includes(typeFilter.toLowerCase());
        
        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return (
    <DashboardLayout pageTitle="All Leave Requests" role="admin">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">All Leave Requests</h1>
          <p className="text-gray-600">Manage and review all leave requests across the organization</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by employee, type or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All Status</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue="all" value={typeFilter} onValueChange={setTypeFilter}>
              <TabsList>
                <TabsTrigger value="all">All Types</TabsTrigger>
                <TabsTrigger value="annual">Annual</TabsTrigger>
                <TabsTrigger value="sick">Sick</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <FilterX size={16} />
              Reset
            </Button>
          </div>
        </div>

        {/* Leave Requests Table */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading leave requests...</p>
          </div>
        ) : filteredLeaveRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaveRequests.map((leave) => (
                  <TableRow 
                    key={leave._id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/admin/leaves/${leave._id}`)}
                  >
                    <TableCell className="font-medium">{leave.user?.fullName || 'Unknown'}</TableCell>
                    <TableCell>{leave.user?.department || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={typeColors[leave.type] || 'bg-gray-100'}>
                        {leave.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[leave.status] || 'bg-gray-100'}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(leave.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeave(leave);
                            }}
                          >
                            Quick View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Leave Request Details</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            {selectedLeave && (
                              <>
                                <div>
                                  <p className="text-sm text-gray-500">Employee</p>
                                  <p className="font-medium">{selectedLeave.user?.fullName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Period</p>
                                  <p className="font-medium">
                                    {format(new Date(selectedLeave.startDate), 'MMM dd, yyyy')} - {format(new Date(selectedLeave.endDate), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Reason</p>
                                  <p className="font-medium">{selectedLeave.reason}</p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/leaves/${selectedLeave?._id}`);
                              }}
                            >
                              View Full Details
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 border rounded-lg">
            <p className="text-gray-500">No leave requests found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminLeaves;
