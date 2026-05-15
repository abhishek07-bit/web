import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import InterviewLayout from '../layouts/InterviewLayout';
import ToastContainer from '../components/common/ToastContainer';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

import LandingPage from '../pages/Landing';
import LoginPage from '../pages/Auth/Login';
import SignupPage from '../pages/Auth/Signup';
import DashboardPage from '../pages/Dashboard';
import ResumeUploadPage from '../pages/ResumeUpload';
import InterviewSetupPage from '../pages/InterviewSetup';
import MockInterviewPage from '../pages/MockInterview';
import FeedbackPage from '../pages/Feedback';
import AnalyticsPage from '../pages/Analytics';
import SettingsPage from '../pages/Settings';
import CompanyPrepPage from '../pages/CompanyPrep';
import StaticPage from '../pages/Static';

const TERMS_CONTENT = `Welcome to PrepMate AI! We are thrilled to have you on board. These Terms and Conditions outline the rules and regulations for the use of our website and services.

1. Acceptance of Terms
By accessing or using PrepMate AI, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service. These rules ensure a safe and reliable environment for all our users.

2. Description of Service
PrepMate AI provides artificial intelligence-powered interview preparation tools, including resume analysis and mock interview sessions. Our goal is to help you practice and improve. Please note that while our tools are highly advanced, we do not guarantee employment, job offers, or specific interview outcomes.

3. Your Account and Responsibilities
To use certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. Please provide accurate and complete information during registration.

4. Acceptable Use
You agree to use our platform only for lawful purposes. You must not use our service to transmit any harmful, offensive, or illegal content. Attempting to hack, disrupt, or overload our AI systems is strictly prohibited and will result in immediate account termination.

5. Intellectual Property
All content, design, and software on this platform are the exclusive property of PrepMate AI. You may not copy, reproduce, or distribute our proprietary materials without explicit written permission. Your personal data and uploaded resumes, however, remain yours.

6. Changes to the Service
We are constantly improving PrepMate AI. We reserve the right to modify, suspend, or discontinue any part of the service at any time, with or without notice.

7. Limitation of Liability
PrepMate AI is provided "as is" without any warranties. We shall not be held liable for any direct, indirect, or consequential damages resulting from your use of the platform.

If you have any questions about these terms, please reach out to us via our Contact page.`;

const PRIVACY_CONTENT = `Your privacy is incredibly important to us at PrepMate AI. This Privacy Policy explains how we collect, use, and protect your personal information in a clear and transparent way.

1. Information We Collect
When you use PrepMate AI, we collect information that you willingly provide to us. This includes your name, email address, and the resumes or documents you upload. We also record your text and selected preferences during mock interview sessions to provide you with feedback.

2. How We Use Your Information
Your data is primarily used to operate and improve your experience. Specifically, we use your resume and interview responses to generate personalized AI feedback and calculate your readiness scores. We may also use your email to send you important account updates or product announcements.

3. AI Processing and Data Security
To provide our intelligent services, your inputs (such as resume text and interview answers) are processed by secure, enterprise-grade AI models. We strip away personal identifiers wherever possible before sending data to our AI partners. We do not sell your personal data to third-party marketers or advertisers.

4. Cookies and Tracking
We use cookies (small data files saved to your browser) to keep you logged in and to understand how you interact with our website. This helps us fix bugs and improve the overall user experience. You can choose to disable cookies in your browser settings, though some features of the site may not function properly.

5. Your Rights
You have complete control over your data. You can access, update, or delete your account and all associated data at any time through your Account Settings. If you need assistance with data deletion, you can contact our support team.

6. Changes to This Policy
We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new policy on this page.`;

const COOKIE_CONTENT = `Cookie Policy for PrepMate AI

What Are Cookies?
Cookies are tiny text files stored on your computer or mobile device when you visit a website. They help the website remember your actions and preferences (such as login details) over a period of time, so you don't have to keep re-entering them.

How We Use Cookies
1. Essential Cookies: These are strictly necessary for the platform to function. For example, they keep you securely logged in as you navigate between the dashboard and mock interviews.
2. Performance Cookies: These help us understand how visitors interact with our website by collecting and reporting information anonymously. This allows us to fix broken pages and improve the user experience.

Your Choices
You can control and manage cookies through your browser settings. You can choose to block or delete cookies, but please be aware that doing so may prevent you from using essential features of PrepMate AI, such as logging in or saving your interview progress.`;

const SYSTEM_DESIGN_CONTENT = `System Design Guide

Welcome to the PrepMate AI System Design Guide! Mastering system design is crucial for senior engineering roles. Here is a high-level overview of how to approach these interviews:

1. Understand the Requirements
Never start drawing boxes immediately. Spend the first 5-10 minutes clarifying the functional requirements (what the system should do) and non-functional requirements (scale, latency, availability).

2. Back-of-the-Envelope Estimation
Calculate the expected read/write ratio, storage requirements, and network bandwidth. This shows the interviewer you understand the scale of the problem.

3. High-Level Design
Draw the core components. Start with the client, load balancer, API gateway, web servers, and the database. Keep it simple and focused on the happy path.

4. Deep Dive
Once the high-level architecture is approved, deep dive into the bottleneck areas. Discuss database partitioning, caching strategies (like Redis), message queues (like Kafka) for asynchronous tasks, and how to handle network failures.

Practice these steps regularly using our Mock Interview tool to build confidence!`;

const BEHAVIORAL_CONTENT = `Behavioral Questions Guide

Behavioral interviews assess how you handle workplace situations, collaborate with others, and resolve conflicts. The most effective way to answer these questions is using the STAR Method:

S - Situation: Set the scene and give the necessary context of your example.
T - Task: Describe what your responsibility was in that situation.
A - Action: Explain exactly what steps YOU took to address it. Use "I", not "We".
R - Result: Share the outcomes of your actions. Quantify your success with numbers if possible.

Common Themes to Prepare For:
1. Leadership: "Tell me about a time you led a difficult project."
2. Conflict Resolution: "Describe a situation where you disagreed with a coworker."
3. Failure: "Tell me about a time you made a mistake and what you learned from it."
4. Ambiguity: "How do you handle a project when the requirements are not clear?"

Use the PrepMate AI behavioral mock interviews to practice delivering your STAR stories clearly and concisely.`;

const BLOG_CONTENT = `PrepMate AI Blog

Welcome to our blog! We are currently working on a series of articles to help you navigate the ever-changing tech landscape. 

Upcoming Topics Include:
- How to Beat the ATS (Applicant Tracking System) in 2026
- Top 10 System Design Patterns Every Senior Engineer Should Know
- Overcoming Imposter Syndrome During Technical Interviews
- How PrepMate AI's proprietary Fallback Stack guarantees 99.9% uptime during your mock interviews.

Check back soon for our first official post!`;

const HELP_CONTENT = `PrepMate AI Help Center

Welcome to the Help Center! Here are answers to our most frequently asked questions:

How do I start a mock interview?
Navigate to your Dashboard and click "Start Interview". You will be asked to configure your target company, role, and the rigor level before the session begins.

Can I use PrepMate AI for non-technical roles?
Yes! While we specialize in Software Engineering and System Design, our AI is capable of running behavioral and general mock interviews for Product Managers, Data Scientists, and Designers.

Is my resume data secure?
Absolutely. Your resume is securely processed to generate your personal intelligence report and is never shared with external recruiters or third-party advertisers.

The AI voice isn't working. What should I do?
Ensure your browser allows audio playback and that your device volume is up. Modern browsers sometimes block audio until you interact with the page. Try refreshing the page and clicking the screen before starting the interview.

If you need further assistance, please visit our Contact page.`;

const CONTACT_CONTENT = `Contact Us

We are here to help! Whether you have a question about a feature, need technical support, or just want to share feedback about your mock interview experience, we would love to hear from you.

Customer Support:
Email: support@prepmateai.com
Response Time: We aim to respond to all inquiries within 24 hours.

Business Inquiries:
For enterprise partnerships or bulk university licensing, please contact:
Email: enterprise@prepmateai.com

Mailing Address:
PrepMate AI Headquarters
123 Innovation Drive, Suite 400
San Francisco, CA 94105`;

const CAREERS_CONTENT = `Careers at PrepMate AI

We are on a mission to democratize career advancement by building the world's most intelligent and accessible interview preparation platform. 

Why Join Us?
At PrepMate AI, you will tackle fascinating engineering challenges involving real-time voice synthesis, large language model orchestration, and highly scalable distributed systems. We foster a culture of continuous learning, autonomy, and radical transparency.

Current Openings:
While we do not have any open roles right now, we are growing fast. We are always on the lookout for talented Full-Stack Engineers, AI Researchers, and Product Designers.

If you are passionate about what we do, send your resume (and let our ATS analysis tool check it first!) to careers@prepmateai.com.`;

const ABOUT_CONTENT = `About PrepMate AI

The tech interview process is notoriously broken. Candidates face immense pressure, ambiguous expectations, and a lack of actionable feedback. We built PrepMate AI to fix this.

Our Mission
We believe that everyone deserves the opportunity to practice, fail safely, and learn before the actual interview. Our mission is to provide an adaptive, intelligent, and completely judgment-free environment where candidates can hone their skills.

How It Works
We leverage state-of-the-art Large Language Models (LLMs) to dynamically generate interview questions tailored to specific companies and roles. Our platform evaluates your spoken and written responses in real-time, providing you with a ruthless but constructive analysis of your strengths and weaknesses.

Whether you are preparing for a grueling FAANG system design round or a standard behavioral screening, PrepMate AI is your ultimate sparring partner.`;

// Root Wrapper to provide global systems
function RootWrapper() {
  return (
    <>
      <Outlet />
      <ToastContainer />
    </>
  );
}

// Global Layout for all pages
function GlobalLayout() {
  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col selection:bg-primary/20">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootWrapper />,
    children: [
      {
        element: <GlobalLayout />,
        children: [
          { path: '/', element: <LandingPage /> },
          { path: '/terms', element: <StaticPage title="Terms of Service" content={TERMS_CONTENT} /> },
          { path: '/privacy', element: <StaticPage title="Privacy Policy" content={PRIVACY_CONTENT} /> },
          { path: '/cookie-policy', element: <StaticPage title="Cookie Policy" content={COOKIE_CONTENT} /> },
          { path: '/system-design', element: <StaticPage title="System Design Guide" content={SYSTEM_DESIGN_CONTENT} /> },
          { path: '/behavioral', element: <StaticPage title="Behavioral Questions" content={BEHAVIORAL_CONTENT} /> },
          { path: '/blog', element: <StaticPage title="PrepMate AI Blog" content={BLOG_CONTENT} /> },
          { path: '/help', element: <StaticPage title="Help Center" content={HELP_CONTENT} /> },
          { path: '/contact', element: <StaticPage title="Contact Us" content={CONTACT_CONTENT} /> },
          { path: '/careers', element: <StaticPage title="Careers" content={CAREERS_CONTENT} /> },
          { path: '/about', element: <StaticPage title="About Us" content={ABOUT_CONTENT} /> },
          
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', element: <LoginPage /> },
              { path: 'signup', element: <SignupPage /> },
            ],
          },
          {
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'resume', element: <ResumeUploadPage /> },
              { path: 'interview/setup', element: <InterviewSetupPage /> },
              { path: 'feedback/:id', element: <FeedbackPage /> },
              { path: 'analytics', element: <AnalyticsPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'company-prep', element: <CompanyPrepPage /> },
            ],
          },
        ]
      },
      {
        element: <InterviewLayout />,
        children: [
          { path: 'interview/session', element: <MockInterviewPage /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
