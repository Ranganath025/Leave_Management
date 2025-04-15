
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, User, Building, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { leavesAPI } from '@/services/api';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800'
};

const typeColors = {
  'Annual Leave': 'bg-blue-100 text-blue-800',
  'Sick Leave': 'bg-purple-100 text-purple-800',
  'Personal Leave': 'bg-orange-100 text-orange-800',
  'Bereavement': 'bg-gray-100 text-gray-800',
  'Other': 'bg-indigo-100 text-indigo-800'
};

const AdminLeaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        setLoading(true);
        const response = await leavesAPI.getLeaveById(id);
        setLeave(response.data);
      } catch (error) {
        console.error('Failed to fetch leave details:', error);
        toast.error('Failed to load leave details');
        navigate('/admin/leaves');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeave();
    }
  }, [id, navigate]);

  const handleStatus = async (status) => {
    if (!comments.trim()) {
      toast.error('Please add comments before approving or rejecting');
      return;
    }

    try {
      setActionLoading(true);
      await leavesAPI.updateLeaveStatus(id, { 
        status, 
        comments 
      });
      
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      
      // Update the local state to reflect the change
      setLeave(prev => ({
        ...prev,
        status,
        comments,
        approvedOn: new Date().toISOString()
      }));
    } catch (error) {
      console.error(`Failed to ${status.toLowerCase()} leave:`, error);
      toast.error(`Failed to ${status.toLowerCase()} leave request`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Leave Request Details" role="admin">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading leave details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!leave) {
    return (
      <DashboardLayout pageTitle="Leave Request Details" role="admin">
        <div className="text-center py-10">
          <p className="text-red-500">Leave request not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/admin/leaves')}
          >
            Back to All Leaves
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Leave Request Details" role="admin">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Request Details</h1>
        <Button variant="outline" onClick={() => navigate('/admin/leaves')}>
          Back to All Leaves
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Leave details card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Leave Request</CardTitle>
                <CardDescription>
                  Submitted on {format(new Date(leave.createdAt), 'MMMM d, yyyy')}
                </CardDescription>
              </div>
              <Badge className={statusColors[leave.status] || 'bg-gray-100'}>
                {leave.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 mr-4 text-gray-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Leave Period</p>
                    <p className="font-medium">
                      {format(new Date(leave.startDate), 'MMMM d, yyyy')} - {format(new Date(leave.endDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 mr-4 text-gray-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{leave.days} {leave.days === 1 ? 'day' : 'days'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 mr-4 text-gray-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Leave Type</p>
                    <Badge className={typeColors[leave.type] || 'bg-gray-100'}>
                      {leave.type}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Reason for Leave</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {leave.reason}
                  </p>
                </div>
                
                {leave.comments && (
                  <div>
                    <h3 className="font-medium mb-2">Comments from Approver</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {leave.comments}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin actions card (only for pending leaves) */}
          {leave.status === 'Pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Manager Decision</CardTitle>
                <CardDescription>
                  Approve or reject this leave request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comments (required)
                    </label>
                    <Textarea
                      placeholder="Add your comments about this leave request..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleStatus('Rejected')}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatus('Approved')}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Employee details sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Employee Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 mr-4 text-gray-400">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{leave.user?.fullName || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 mr-4 text-gray-400">
                    <Building size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{leave.user?.department || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 mr-4 text-gray-400">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium">{leave.user?.position || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => 
                navigate(`/admin/users/${leave.user?._id || ''}`)
              }>
                View Employee Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLeaveDetail;
