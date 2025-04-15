
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { leavesAPI } from '@/services/api';
import { toast } from 'sonner';

const LeaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        setLoading(true);
        const response = await leavesAPI.getLeaveById(id);
        setLeaveRequest(response.data);
      } catch (error) {
        console.error('Failed to fetch leave details:', error);
        toast.error('Failed to load leave request details');
        
        // Fallback mock data for development
        setLeaveRequest({
          id: parseInt(id),
          type: 'Annual Leave',
          startDate: '2025-05-15',
          endDate: '2025-05-20',
          days: 5,
          reason: 'Family vacation',
          status: 'Approved',
          approvedBy: { fullName: 'Jane Smith' },
          approvedOn: '2025-04-02',
          comments: 'Enjoy your vacation!'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveDetails();
  }, [id]);
  
  const cancelLeaveRequest = async () => {
    try {
      await leavesAPI.cancelLeave(id);
      toast.success('Leave request cancelled successfully');
      navigate('/employee/leaves');
    } catch (error) {
      console.error('Failed to cancel leave request:', error);
      toast.error('Failed to cancel leave request');
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Leave Request Details" role="employee">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading leave request details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!leaveRequest) {
    return (
      <DashboardLayout pageTitle="Leave Request Details" role="employee">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Leave request not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Leave Request Details" role="employee">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/employee/leaves')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Leaves
        </Button>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Leave Request #{leaveRequest.id}</span>
            <Badge 
              className={
                leaveRequest.status === 'Approved' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                leaveRequest.status === 'Rejected' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                'bg-amber-100 text-amber-800 hover:bg-amber-100'
              }
            >
              {leaveRequest.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Leave Type</h3>
              <p className="mt-1">{leaveRequest.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <p className="mt-1">{leaveRequest.days} days</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="mt-1">{leaveRequest.startDate}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">End Date</h3>
              <p className="mt-1">{leaveRequest.endDate}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Reason</h3>
            <p className="mt-1">{leaveRequest.reason}</p>
          </div>
          
          {leaveRequest.approvedBy && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reviewed By</h3>
                <p className="mt-1">{leaveRequest.approvedBy.fullName || leaveRequest.approvedBy}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reviewed On</h3>
                <p className="mt-1">{leaveRequest.approvedOn}</p>
              </div>
            </div>
          )}
          
          {leaveRequest.comments && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Comments</h3>
              <p className="mt-1">{leaveRequest.comments}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end space-x-2">
          {leaveRequest.status === 'Pending' && (
            <Button variant="outline" className="text-red-600" onClick={cancelLeaveRequest}>
              Cancel Request
            </Button>
          )}
        </CardFooter>
      </Card>
    </DashboardLayout>
  );
};

export default LeaveDetail;
