import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HiPlus, 
  HiBriefcase, 
  HiCalendar, 
  HiCurrencyDollar, 
  HiUserGroup, 
  HiCheckCircle, 
  HiClock,
  HiClipboardList
} from 'react-icons/hi';
import { Button, Badge, Card, Spinner } from '../components/common';
import { formatCurrency } from '../utils/helpers';
import { fetchMyProjects } from '../redux/slices/projectSlice';

const MyProjects = () => {
  const dispatch = useDispatch();
  const { myProjects, isLoading, error } = useSelector((state) => state.projects);
  const [activeTab, setActiveTab] = useState('open');

  useEffect(() => {
    dispatch(fetchMyProjects());
  }, [dispatch]);

  const filteredProjects = myProjects.filter((p) => {
    if (activeTab === 'open') return p.status === 'open';
    if (activeTab === 'assigned') return p.status === 'assigned';
    if (activeTab === 'completed') return p.status === 'completed';
    return false;
  });

  const getStatusCount = (status) => {
    return myProjects.filter((p) => p.status === status).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold leading-7 text-slate-900 sm:text-4xl">
            My Posted Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage projects you have published and review submissions from student freelancers.
          </p>
        </div>
        <Link to="/dashboard/create-project">
          <Button icon={HiPlus}>
            Post New Project
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: 'open', label: 'Open', icon: HiClock, color: 'text-emerald-500' },
            { id: 'assigned', label: 'Assigned', icon: HiUserGroup, color: 'text-blue-500' },
            // { id: 'completed', label: 'Completed', icon: HiCheckCircle, color: 'text-indigo-500' }
          ].map((tab) => {
            const count = getStatusCount(tab.id);
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-semibold text-sm transition-all cursor-pointer
                  ${isActive 
                    ? 'border-indigo-650 text-indigo-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                <Icon className={`mr-2 h-5 w-5 ${isActive ? tab.color : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs font-bold transition-all
                  ${isActive ? 'bg-indigo-100 text-indigo-805' : 'bg-slate-100 text-slate-550'}
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
          <HiClipboardList className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No {activeTab} projects</h3>
          <p className="mt-1 text-sm text-slate-500">
            You don't have any projects in the {activeTab} status right now.
          </p>
          {activeTab === 'open' && (
            <div className="mt-6">
              <Link to="/dashboard/create-project">
                <Button variant="outline" icon={HiPlus}>
                  Post a Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project._id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary">{project.category}</Badge>
                  <Badge variant={project.status === 'open' ? 'success' : project.status === 'assigned' ? 'info' : 'default'}>
                    {project.status}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2">
                  {project.title}
                </h3>
                
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  {project.description}
                </p>

                <div className="space-y-2 text-xs text-slate-550 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <HiCurrencyDollar className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(project.budget?.min)} - {formatCurrency(project.budget?.max)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-indigo-650">
                      <HiUserGroup className="h-4 w-4 text-slate-400" />
                      <span>{project.bidCount || 0} Bids</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HiCalendar className="h-4 w-4 text-slate-400" />
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link to={`/projects/${project._id}`} className="flex-1">
                  <Button fullWidth variant="primary" size="sm">
                    View Details
                  </Button>
                </Link>
                {project.status === 'open' && (
                  <Link to={`/dashboard/edit-project/${project._id}`} className="flex-1">
                    <Button fullWidth variant="outline" size="sm">
                      Edit Project
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
