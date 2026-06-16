import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { HiPlus, HiCollection, HiBriefcase, HiCurrencyDollar, HiStar, HiArrowRight, HiClipboardCheck } from 'react-icons/hi';
import { fetchClientProfile } from '../redux/slices/profileSlice';
import { fetchMyProjects } from '../redux/slices/projectSlice';
import { fetchMyPayments } from '../redux/slices/paymentSlice';
import bidService from '../services/bidService';

import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { PaymentCard } from '../components/PaymentComponents';

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { profile, isLoading: isProfileLoading } = useSelector((state) => state.profile);
  const { myProjects, isLoading: isProjectsLoading } = useSelector((state) => state.projects);
  const { payments } = useSelector((state) => state.payments);

  const [recentBids, setRecentBids] = useState([]);
  const [isBidsLoading, setIsBidsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchClientProfile());
    dispatch(fetchMyProjects());
    dispatch(fetchMyPayments());
  }, [dispatch]);

  // Load recent bids across client's open projects
  useEffect(() => {
    const loadAllBids = async () => {
      if (!myProjects || myProjects.length === 0) return;
      
      setIsBidsLoading(true);
      try {
        const openProjects = myProjects.filter(p => p.status === 'open' || p.status === 'pending');
        const bidsPromises = openProjects.map(proj => 
          bidService.getProjectBids(proj._id)
            .then(res => {
              // Attach project title to bid for easy rendering
              return (res.data?.bids || []).map(b => ({
                ...b,
                projectTitle: proj.title,
                projectId: proj._id
              }));
            })
            .catch(() => [])
        );

        const results = await Promise.all(bidsPromises);
        const allBids = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentBids(allBids);
      } catch (err) {
        console.error('Failed to load bids', err);
      } finally {
        setIsBidsLoading(false);
      }
    };

    loadAllBids();
  }, [myProjects]);

  const isLoading = isProfileLoading || isProjectsLoading;

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate statistics
  const totalProjects = myProjects?.length || 0;
  const activeGigs = myProjects?.filter(p => p.status === 'in_progress' || p.status === 'active').length || 0;
  const totalSpent = profile?.totalSpent || 0;
  const rating = profile?.averageRating || profile?.rating || 0;

  const stats = [
    {
      title: 'Projects Posted',
      value: totalProjects,
      icon: HiCollection,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl p-6 md:p-8 shadow-md">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.user?.avatar} name={user?.fullName} size="xl" className="border-2 border-white/20" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Welcome back, {profile?.companyName || user?.fullName}!</h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">Post freelance projects, review student bids, and build your digital solutions.</p>
          </div>
        </div>
        <div className="flex items-center">
          <Link to="/dashboard/create-project">
            <Button variant="primary" icon={HiPlus}>
              Post a Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="flex items-center gap-4 border border-slate-100 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-xl border ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stat.value}</h3>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Open/Active Projects List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Projects & Payments */}
          {myProjects?.filter(p => p.status === 'assigned').length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <HiBriefcase className="text-indigo-600 h-5 w-5" /> Assigned Projects & Payments
              </h2>
              <div className="space-y-4">
                {myProjects
                  .filter(p => p.status === 'assigned')
                  .map((project) => {
                    const projectPayment = payments.find(
                      (p) => (p.project === project._id || p.project?._id === project._id) && p.type === 'advance'
                    );
                    return (
                      <PaymentCard
                        key={project._id}
                        project={project}
                        payment={projectPayment}
                        onPaymentSuccess={() => {
                          dispatch(fetchMyProjects());
                          dispatch(fetchMyPayments());
                        }}
                      />
                    );
                  })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-850">Your Projects</h2>
            <Link to="/dashboard/my-projects" className="text-sm font-semibold text-indigo-600 hover:text-indigo-850">
              View All
            </Link>
          </div>

          {myProjects && myProjects.length > 0 ? (
            <div className="space-y-4">
              {myProjects.map((project) => (
                <Card key={project._id} className="hover:border-indigo-200 transition-colors border border-slate-150">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-800 hover:text-indigo-650">
                          <Link to={`/projects/${project._id}`}>{project.title}</Link>
                        </h3>
                        <Badge variant={project.status === 'open' ? 'info' : project.status === 'completed' ? 'success' : 'primary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-500">Budget</p>
                        <p className="text-sm font-bold text-slate-800">
                          {project.budget ? `${formatCurrency(project.budget.min)} - ${formatCurrency(project.budget.max)}` : 'N/A'}
                        </p>
                      </div>
                      <Link to={`/projects/${project._id}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HiBriefcase}
              title="No projects posted yet"
              description="Get started by posting your first project to receive competitive bids from top university students."
              action={{
                label: 'Post a Project',
                onClick: () => navigate('/dashboard/create-project'),
                icon: HiPlus,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
