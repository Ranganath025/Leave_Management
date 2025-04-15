
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CalendarDays, ClipboardCheck, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-brand-100">
      <header className="py-6 px-4 sm:px-6 lg:px-8 bg-white shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-700">Leave Management</h1>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/register')}>Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Streamlined Leave Management</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            An intuitive platform that simplifies employee leave tracking, approval workflows, and absence management.
          </p>
          <div className="mt-8">
            <Button 
              size="lg" 
              className="bg-brand-600 hover:bg-brand-700"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-6 w-6 text-brand-600" />
              </div>
              <CardTitle>Easy Leave Requests</CardTitle>
              <CardDescription>Submit and track your leave applications in one place</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Intuitive interface for requesting time off and monitoring your leave balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="h-6 w-6 text-brand-600" />
              </div>
              <CardTitle>Streamlined Approvals</CardTitle>
              <CardDescription>Efficient workflow for managers to review requests</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Quick approval process with notifications to keep everyone informed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-brand-600" />
              </div>
              <CardTitle>Team Visibility</CardTitle>
              <CardDescription>Know who's in and who's away at a glance</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Calendar views and reports to help plan around team availability
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center">Why Choose Leave Management?</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-2">For Employees</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Simple leave request submission</li>
                <li>Real-time status updates</li>
                <li>Personal leave history and balances</li>
                <li>Mobile-friendly interface</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">For Managers & Admins</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Centralized leave request management</li>
                <li>Team calendar views</li>
                <li>Reporting and analytics</li>
                <li>Customizable approval workflows</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 Leave Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
