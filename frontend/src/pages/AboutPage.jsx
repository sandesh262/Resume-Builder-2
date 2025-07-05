import React from 'react';
import { 
  FaUsers, 
  FaLightbulb,
  FaHeart,
  FaGlobe,
  FaChartLine
} from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';

const AboutPage = () => {

  const values = [
    {
      icon: <FaHeart className="w-8 h-8" />,
      title: 'Empowerment',
      description: 'We believe everyone deserves access to tools that help them succeed in their career journey.'
    },
    {
      icon: <FaLightbulb className="w-8 h-8" />,
      title: 'Innovation',
      description: 'We continuously push the boundaries of AI technology to provide cutting-edge solutions.'
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: 'Community',
      description: 'We foster a supportive community where job seekers can learn and grow together.'
    },
    {
      icon: <FaGlobe className="w-8 h-8" />,
      title: 'Accessibility',
      description: 'We make professional career tools accessible to everyone, regardless of background.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <FaWandMagicSparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
              About <span className="gradient-text">ResumeAI</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to revolutionize the job search process by making professional 
              resume analysis and career guidance accessible to everyone through the power of artificial intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At ResumeAI, we believe that finding the right job shouldn't be a matter of luck or connections. 
                Our advanced AI technology levels the playing field by providing everyone with access to 
                professional-grade resume analysis and career guidance.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We've helped thousands of job seekers improve their resumes, increase their interview rates, 
                and ultimately land their dream jobs. Our goal is to make career success achievable for everyone, 
                regardless of their background or experience level.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl">
                <FaChartLine className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape how we build products that truly serve our users.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} hover gradient className="p-8 text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-white mb-6">
            Ready to Join Our Success Story?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Become part of the thousands who have transformed their careers with ResumeAI.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;