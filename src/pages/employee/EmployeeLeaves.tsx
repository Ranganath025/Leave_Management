
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { leavesAPI } from '@/services/api';
import { toast } from 'sonner';

const EmployeeLeaves = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const response = await leavesAPI.getUserLeaves();
        // Ensure we're always setting an array
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
        
        // Set fallback mock data - ensure it's an array
        setLeaveRequests([
          {
            id: 1,
            type: 'Annual Leave',
            startDate: '2025-05-15',
            endDate: '2025-05-20',
            days: 5,
            reason: 'Family vacation',
            status: 'Approved',
            approvedBy: 'Jane Smith',
            approvedOn: '2025-04-02'
          },
          {
            id: 2,
            type: 'Sick Leave',
            startDate: '2025-04-03',
            endDate: '2025-04-03',
            days: 1,
            reason: 'Doctor appointment',
            status: 'Approved',
            approvedBy: 'Jane Smith',
            approvedOn: '2025-04-01'
          },
          {
            id: 3,
            type: 'Personal Leave',
            startDate: '2025-04-25',
            endDate: '2025-04-25',
            days: 1,
            reason: 'Family emergency',
            status: 'Pending',
            approvedBy: null,
            approvedOn: null
          },
          {
            id: 4,
            type: 'Annual Leave',
            startDate: '2025-02-10',
            endDate: '2025-02-15',
            days: 5,
            reason: 'Winter break',
            status: 'Rejected',
            approvedBy: 'Jane Smith',
            approvedOn: '2025-01-25',
            rejectionReason: 'Team deadline during this period'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  // Filter leave requests based on search query and filters
  const filteredLeaveRequests = Array.isArray(leaveRequests) 
    ? leaveRequests.filter(request => {
        const matchesSearch = 
          request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (request.reason && request.reason.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesType = typeFilter === 'all' || request.type.toLowerCase().includes(typeFilter.toLowerCase());
        
        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  return (
    <DashboardLayout pageTitle="My Leave Requests" role="employee">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search leave requests..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="bg-brand-600 hover:bg-brand-700"
              onClick={() => navigate('/employee/new-leave')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    Loading leave requests...
                  </TableCell>
                </TableRow>
              ) : filteredLeaveRequests.length > 0 ? (
                filteredLeaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.type}</TableCell>
                    <TableCell>{request.startDate} to {request.endDate}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          request.status === 'Approved' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                          request.status === 'Rejected' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                          'bg-amber-100 text-amber-800 hover:bg-amber-100'
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/employee/leaves/${request.id}`)}
                        className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No leave requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeLeaves;
