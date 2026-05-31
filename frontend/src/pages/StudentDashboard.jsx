import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { HiBriefcase, HiCurrencyDollar, HiCheckCircle, HiStar, HiArrowRight, HiClipboardList } from 'react-icons/hi';
import { fetchStudentProfile } from '../redux/slices/profileSlice';
import { fetchAssignedProjects } from '../redux/slices/projectSlice';
import { fetchMyBids } from '../redux/slices/bidSlice';
import { fetchMyEarnings } from '../redux/slices/paymentSlice';

import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, isLoading: isProfileLoading } = useSelector((state) => state.profile);
  const { assignedProjects, isLoading: isProjectsLoading } = useSelector((state) => state.projects);
  const { myBids, isLoading: isBidsLoading } = useSelector((state) => state.bids);
  const { earnings, payments: earningsPayments } = useSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchStudentProfile());
    dispatch(fetchAssignedProjects());
    dispatch(fetchMyBids());
    dispatch(fetchMyEarnings());
  }, [dispatch]);

  const isLoading = isProfileLoading || isProjectsLoading || isBidsLoading;

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate statistics
  const totalEarnings = profile?.totalEarnings || 0;
  const activeProjectsCount = assignedProjects?.filter(p => p.status === 'active' || p.status === 'in_progress').length || 0;
  const submittedBidsCount = myBids?.length || 0;
  const rating = profile?.averageRating || profile?.rating || 0;

  const stats = [
    {
      title: 'Total Earnings',
      value: formatCurrency(totalEarnings),
      icon: HiCurrencyDollar,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Active Projects',
      value: activeProjectsCount,
      icon: HiBriefcase,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Submitted Bids',
      value: submittedBidsCount,
      icon: HiClipboardList,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      title: 'Average Rating',
      value: rating > 0 ? `${rating.toFixed(1)} / 5.0` : 'N/A',
      icon: HiStar,
      color: 'text-amber-500 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.user?.avatar} name={user?.fullName} size="xl" className="border-2 border-white/20" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Welcome back, {user?.fullName}!</h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">Manage your active projects, submit bids, and track your freelance earnings.</p>
          </div>
        </div>
        <div className="flex items-center">
          <Link to="/projects">
            <Button variant="secondary" icon={HiArrowRight}>
              Browse Projects
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
        {/* Active Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-855">Active Projects</h2>
          </div>

          {assignedProjects && assignedProjects.length > 0 ? (
            <div className="space-y-4">
              {assignedProjects.map((project) => {
                const projectPayment = (earningsPayments || []).find(
                  (p) => (p.project === project._id || p.project?._id === project._id) && p.type === 'advance'
                );
                return (
                  <Card key={project._id} className="hover:border-indigo-200 transition-colors border border-slate-150">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-800 hover:text-indigo-650">
                            <Link to={`/projects/${project._id}`}>{project.title}</Link>
                          </h3>
                          <Badge variant={project.status === 'completed' ? 'success' : 'primary'}>
                            {project.status === 'in_progress' ? 'In Progress' : project.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Posted by <span className="font-semibold text-slate-700">{project.client?.companyName || project.client?.user?.fullName || 'Client'}</span>
                        </p>
                        <div className="flex gap-2 items-center mt-2 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Advance Payout:</span>
                          {projectPayment ? (
                            <Badge variant={projectPayment.status === 'released' ? 'success' : 'warning'} className="text-[10px] py-0.5 font-semibold">
                              {projectPayment.status === 'released' ? 'Released to Bank' : 'Held in Escrow'}
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-[10px] py-0.5 font-semibold">Unpaid</Badge>
                          )}
                        </div>
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
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={HiBriefcase}
              title="No active projects yet"
              description="Browse open projects, submit bids, and get hired to start earning."
              action={{
                label: 'Browse Projects',
                onClick: () => window.location.href = '/projects',
                icon: HiArrowRight,
              }}
            />
          )}
        </div>

        {/* Recent Bids List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-855">Recent Bids</h2>
            <Link to="/dashboard/my-bids" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>

          {myBids && myBids.length > 0 ? (
            <div className="space-y-3">
              {myBids.slice(0, 5).map((bid) => {
                let badgeVariant = 'default';
                if (bid.status === 'accepted') badgeVariant = 'success';
                if (bid.status === 'rejected') badgeVariant = 'danger';
                if (bid.status === 'pending') badgeVariant = 'warning';

                return (
                  <Card key={bid._id} className="p-4 border border-slate-150">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 hover:text-indigo-650">
                          <Link to={`/projects/${bid.project?._id || bid.project}`}>{bid.project?.title || 'Project Details'}</Link>
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Bid: {formatCurrency(bid.amount)}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-500 font-medium">{new Date(bid.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant={badgeVariant}>
                        {bid.status}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={HiClipboardList}
              title="No bids submitted"
              description="You haven't submitted any bids yet. Start bidding to get project offers."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
