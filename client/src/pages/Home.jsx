import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, BookOpen, Zap } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

/**
 * Modern Home/Landing Page
 * Features:
 * - Clean hero section
 * - Feature highlights
 * - Call-to-action buttons
 * - Responsive design
 */
export default function Home() {
  const features = [
    {
      icon: Users,
      title: 'Multi-Role Management',
      description: 'Manage students, faculty, admin, and driver roles with custom dashboards.',
    },
    {
      icon: BookOpen,
      title: 'Course Management',
      description: 'Organize courses, sections, and timetables efficiently in one place.',
    },
    {
      icon: Zap,
      title: 'Real-time Tracking',
      description: 'Monitor attendance, transportation, and hostel activities in real-time.',
    },
  ];

  const stats = [
    { label: 'Students', value: '5000+' },
    { label: 'Institutions', value: '50+' },
    { label: 'Active Courses', value: '1000+' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 -z-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6 border border-blue-200">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-blue-700">
              Welcome to SmartEdu ERP
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Comprehensive Academic <br />
            <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Manage your institution with ease. From attendance tracking to transportation, 
            all in one unified platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/login">
              <Button size="lg" variant="solid" color="primary" icon={ArrowRight}>
                Student / Faculty / Admin Login
              </Button>
            </Link>
            <Link to="/super-admin/login">
              <Button size="lg" variant="outline" color="primary">
                Super Admin Login
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your educational institution effectively
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} hoverable shadow="sm" padding="lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored dashboards and features for each user role
            </p>
          </div>

          {/* Roles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Students', features: ['View Timetable', 'Mark Attendance', 'Track Grades'] },
              { title: 'Faculty', features: ['Manage Classes', 'Record Attendance', 'Update Grades'] },
              { title: 'Admin', features: ['User Management', 'Reports', 'System Settings'] },
              { title: 'Drivers', features: ['Route Tracking', 'GPS Tracking', 'Schedule View'] },
            ].map((role) => (
              <Card key={role.title} padding="md" shadow="sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {role.title}
                </h3>
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Get started with SmartEdu ERP today
          </p>
          <Link to="/login">
            <Button size="lg" variant="solid" color="primary">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">SmartEdu</h4>
              <p className="text-sm">Comprehensive educational management platform.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 SmartEdu ERP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
