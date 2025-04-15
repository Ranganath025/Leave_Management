
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { leavesAPI } from '@/services/api';

const NewLeaveRequest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
    
    return diffDays;
  };

  const validateForm = () => {
    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('End date cannot be before start date');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const submitLeaveRequest = async () => {
    setIsSubmitting(true);
    
    try {
      const leaveTypeMap = {
        'annual': 'Annual Leave',
        'sick': 'Sick Leave',
        'personal': 'Personal Leave',
        'bereavement': 'Bereavement',
        'unpaid': 'Other'
      };

      const payload = {
        type: leaveTypeMap[leaveType],
        startDate: startDate,
        endDate: endDate,
        days: calculateDays(),
        reason: reason,
        contactInfo: contactInfo || null
      };
      
      // Make API call to create leave request
      await leavesAPI.createLeave(payload);
      
      toast.success('Leave request submitted successfully');
      navigate('/employee/leaves');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <DashboardLayout pageTitle="New Leave Request" role="employee">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Leave Request</CardTitle>
            <CardDescription>
              Submit a new leave request for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select
                  value={leaveType}
                  onValueChange={setLeaveType}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => startDate ? date < new Date(startDate) : false}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {startDate && endDate && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm">
                    Duration: <span className="font-medium">{calculateDays()} days</span>
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  placeholder="Briefly describe the reason for your leave request"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Emergency Contact Information (Optional)</Label>
                <Input
                  id="contactInfo"
                  placeholder="Phone number or email where you can be reached if needed"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/employee/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this leave request?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Leave Type:</p>
                <p>{leaveType === 'annual' ? 'Annual Leave' : 
                   leaveType === 'sick' ? 'Sick Leave' : 
                   leaveType === 'personal' ? 'Personal Leave' : 
                   leaveType === 'bereavement' ? 'Bereavement Leave' : 
                   leaveType === 'unpaid' ? 'Unpaid Leave' : 'Unknown'}</p>
              </div>
              <div>
                <p className="font-medium">Duration:</p>
                <p>{calculateDays()} days</p>
              </div>
              <div>
                <p className="font-medium">Start Date:</p>
                <p>{startDate ? format(startDate, "PPP") : 'Not selected'}</p>
              </div>
              <div>
                <p className="font-medium">End Date:</p>
                <p>{endDate ? format(endDate, "PPP") : 'Not selected'}</p>
              </div>
            </div>
            <div>
              <p className="font-medium">Reason:</p>
              <p className="text-sm">{reason}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitLeaveRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NewLeaveRequest;
