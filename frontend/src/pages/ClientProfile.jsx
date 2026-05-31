import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineOfficeBuilding,
  HiLink,
  HiFolderOpen,
  HiCurrencyDollar,
  HiStar,
  HiOutlineMail,
  HiCalendar,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { fetchClientProfileById, clearViewedProfile } from '../redux/slices/profileSlice';
import {
  Avatar,
  Badge,
  Card,
  Spinner,
  EmptyState,
} from '../components/common';
import { formatCurrency } from '../utils/helpers';

const ClientProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { viewedProfile, isLoading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    if (id) {
      dispatch(fetchClientProfileById(id));
    }
    return () => {
      dispatch(clearViewedProfile());
    };
  }, [id, dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !viewedProfile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <EmptyState
          icon={HiOutlineExclamationCircle}
          title="Client Profile Not Found"
          description={error || "The client profile you are looking for does not exist or could not be loaded."}
        />
      </div>
    );
  }

  const {
    user,
    companyName,
    bio,
    website,
    stats = {},
    projects = [],
  } = viewedProfile;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER HERO PROFILE CARD */}
      <Card className="relative overflow-hidden bg-slate-900 border-none p-8 md:p-10 text-white rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <Avatar
            src={user?.avatar}
            name={companyName || user?.name}
            size="xl"
            className="border-4 border-white/20 shadow-lg !h-24 !w-24 md:!h-28 md:!w-28 bg-white text-slate-800"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl font-extrabold tracking-tight">{companyName || user?.name || 'Client'}</h1>
              <Badge variant="primary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                Verified Client
              </Badge>
            </div>

            <p className="text-lg text-slate-300 font-medium flex items-center justify-center md:justify-start gap-1.5">
              <HiOutlineOfficeBuilding className="h-5 w-5 text-indigo-400" />
              {companyName ? `Representative: ${user?.name}` : 'Individual Client'}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <HiOutlineMail className="h-4 w-4" /> {user?.email}
              </span>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                >
                  <HiLink className="h-4 w-4" /> {website.replace(/https?:\/\/(www\.)?/, '')}
                </a>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 border-t border-white/10 md:border-t-0 md:border-l md:border-white/10 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-center">
            <div className="text-center px-4">
              <p className="text-2xl font-black text-white">{stats.projectsPosted || projects.length}</p>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">Projects Posted</p>
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-black text-emerald-400">{formatCurrency(stats.totalSpent || 0)}</p>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">Total Spent</p>
            </div>
            {stats.rating && (
              <div className="text-center px-4">
                <p className="text-2xl font-black text-amber-400 flex items-center gap-0.5 justify-center">
                  <HiStar className="h-5 w-5 fill-current" /> {stats.rating}
                </p>
                <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">Rating</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: BIO */}
        <div className="lg:col-span-1">
          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Company Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {bio || 'No business description provided yet.'}
            </p>
          </Card>
        </div>

        {/* RIGHT COLUMN: PROJECT HISTORY */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HiFolderOpen className="text-indigo-600 h-5 w-5" /> Posted Projects History
            </h3>

            {projects.length === 0 ? (
              <EmptyState
                icon={HiFolderOpen}
                title="No projects posted yet"
                description="This client hasn't created any freelance job postings on the platform yet."
              />
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="p-4 border border-slate-100 rounded-xl hover:border-indigo-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          {project.title}
                        </h4>
                        <Badge variant={project.status === 'completed' ? 'success' : 'primary'} className="text-[10px]">
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-slate-400 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                          <HiCurrencyDollar className="h-4 w-4 text-indigo-500" /> Budget:{' '}
                          {project.budget?.min !== undefined && project.budget?.max !== undefined
                            ? `${formatCurrency(project.budget.min)} - ${formatCurrency(project.budget.max)}`
                            : formatCurrency(project.budget)}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiCalendar className="h-3.5 w-3.5" /> {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Link to={`/projects/${project._id}`}>
                      <Button variant="outline" size="sm">
                        View Project
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
