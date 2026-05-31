import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  HiFolder,
  HiDocumentText,
  HiBriefcase,
  HiShieldCheck,
  HiChatAlt2,
  HiChartBar,
  HiArrowRight,
  HiUsers,
  HiStar
} from 'react-icons/hi';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { fetchProjects } from '../redux/slices/projectSlice';
import { formatCurrency } from '../utils/helpers';

const Landing = () => {
  const [activeTab, setActiveTab] = useState('students');
  const dispatch = useDispatch();
  const { projects, isLoading, error } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects({ limit: 6, status: 'open' }));
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const studentSteps = [
    { title: 'Create Profile', desc: 'Sign up and showcase your skills, college projects, and portfolio links.' },
    { title: 'Browse & Bid', desc: 'Find local projects matching your skills and make professional proposals.' },
    { title: 'Deliver & Earn', desc: 'Work directly with clients, submit milestones, and get paid securely.' },
  ];

  const clientSteps = [
    { title: 'Post Project', desc: 'Define your project requirements, skills required, budget range, and timeline.' },
    { title: 'Review Bids', desc: 'Examine student profiles, portfolios, and pitch proposals to select the best fit.' },
    { title: 'Track & Pay', desc: 'Communicate on chat, approve milestone submissions, and release payments.' },
  ];

  const openProjects = (projects || []).filter(p => p.status === 'open').slice(0, 3);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-24 lg:pt-32 lg:pb-32 border-b border-slate-100">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-20 w-80 h-80 bg-sky-200 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              Empowering Students & Local Businesses
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
              Find Projects. <br />
              <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Build Experience.
              </span>{' '}
              Earn Money.
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              StudentBid is a professional localized freelance portal connecting skilled college students with business owners. Pitch your bids, deliver quality code, and launch your career.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/projects" className="w-full sm:w-auto">
                <Button size="lg" className="w-full shadow-lg shadow-indigo-100">
                  Browse Projects <HiArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Post a Project
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <h3 className="text-3xl font-extrabold text-slate-800">500+</h3>
              <p className="text-sm text-slate-500 mt-1">Completed Projects</p>
            </div>
            <div className="p-4">
              <h3 className="text-3xl font-extrabold text-slate-800">1,200+</h3>
              <p className="text-sm text-slate-500 mt-1">Talented Students</p>
            </div>
            <div className="p-4">
              <h3 className="text-3xl font-extrabold text-slate-800">300+</h3>
              <p className="text-sm text-slate-500 mt-1">Local Clients</p>
            </div>
            <div className="p-4">
              <h3 className="text-3xl font-extrabold text-slate-800">₹5M+</h3>
              <p className="text-sm text-slate-500 mt-1">Student Earnings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Why Choose StudentBid?</h2>
            <p className="text-slate-500 mt-3">All the tools students and clients need to succeed in localized freelance collaboration.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: HiFolder, t: 'Browse Local Projects', d: 'Filter by category, budget, and technologies to find perfect fits near your campus.' },
              { icon: HiDocumentText, t: 'Milestone Proposals', d: 'Submit step-by-step cost breakdown proposals to protect your milestones.' },
              { icon: HiBriefcase, t: 'Build Real Portfolio', d: 'Work on actual projects that you can display on your resume and GitHub.' },
              { icon: HiShieldCheck, t: 'Secure Escrow Payments', d: 'Integrated payments ensure students get paid as milestones are approved.' },
              { icon: HiChatAlt2, t: 'Real-time Chat & Sockets', d: 'Direct messaging and notifications keep you in constant contact with your clients.' },
              { icon: HiChartBar, t: 'Transparency & Reviews', d: 'Leave feedback ratings after completion to establish local credibility.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                >
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{f.t}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.d}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">How StudentBid Works</h2>
            <p className="text-slate-500 mt-2">Smooth, transparent collaboration workflow from start to finish.</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="bg-slate-100 p-1.5 rounded-xl inline-flex gap-2 border border-slate-200">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'students'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                For Students
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'clients'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                For Clients
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {(activeTab === 'students' ? studentSteps : clientSteps).map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl border border-slate-150">
                <div className="h-10 w-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {idx + 1}
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Featured Open Projects</h2>
              <p className="text-slate-500 mt-2">Take a look at recently posted freelance gigs.</p>
            </div>
            <Link to="/projects">
              <Button variant="outline" className="hidden sm:inline-flex">
                View All Projects <HiArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Spinner size="lg" />
                <p className="text-slate-500 mt-4 text-sm font-medium animate-pulse">Loading featured projects...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-500 text-sm font-semibold">Failed to load projects: {error}</p>
              </div>
            ) : openProjects.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-550">
                <p className="text-sm font-semibold text-slate-500">No projects available right now</p>
              </div>
            ) : (
              openProjects.map((project) => {
                const displayBudget = project.budget
                  ? `${formatCurrency(project.budget.min)} - ${formatCurrency(project.budget.max)}`
                  : 'N/A';
                const displayDeadline = project.deadline
                  ? new Date(project.deadline).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'N/A';
                const projectSkills = project.skills || project.skillsRequired || [];

                return (
                  <div key={project._id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="primary">{project.category}</Badge>
                        <span className="text-xs text-slate-400">Deadline: {displayDeadline}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-2 hover:text-indigo-650 cursor-pointer line-clamp-2">
                        <Link to={`/projects/${project._id}`}>{project.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">Posted by: {project.client?.fullName || 'Client'}</p>
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {projectSkills.slice(0, 3).map((s) => (
                          <span key={s} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Budget</p>
                        <p className="text-sm font-bold text-slate-800">{displayBudget}</p>
                      </div>
                      <Link to={`/projects/${project._id}`}>
                        <Button size="sm">Bid Now</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-center sm:hidden mt-8">
            <Link to="/projects" className="w-full">
              <Button variant="outline" className="w-full">
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-900 text-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Start Your Freelance Journey?</h2>
          <p className="text-indigo-200 text-base max-w-xl mx-auto mb-8">
            Join the localized marketplace matching college skills with active business proposals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <a href="/#how-it-works">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white hover:bg-indigo-800">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
