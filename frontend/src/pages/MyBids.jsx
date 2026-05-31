import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HiCurrencyDollar, 
  HiCalendar, 
  HiClock,
  HiBriefcase,
  HiChevronRight
} from 'react-icons/hi';
import { Badge, Card, Spinner, Button } from '../components/common';
import { formatCurrency } from '../utils/helpers';
import { fetchMyBids } from '../redux/slices/bidSlice';

const MyBids = () => {
  const dispatch = useDispatch();
  const { myBids, isLoading, error } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(fetchMyBids());
  }, [dispatch]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'withdrawn':
        return 'default';
      case 'pending':
      default:
        return 'warning';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold leading-7 text-slate-900 sm:text-4xl sm:truncate">
            My Submitted Bids
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and monitor the status of all bids you have submitted for open client projects.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : !myBids || myBids.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
          <HiBriefcase className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No bids placed yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            You haven't placed any bids on active projects yet.
          </p>
          <div className="mt-6">
            <Link to="/projects">
              <Button>Browse Projects</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {myBids.map((bid) => {
            const project = bid.project || {};
            const projectId = project._id || project;
            const projectTitle = project.title || 'Untitled Project';
            const projectCategory = project.category || 'N/A';
            const budget = project.budget || {};

            return (
              <Card key={bid._id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" className="text-xs">{projectCategory}</Badge>
                      <Badge variant={getStatusVariant(bid.status)} className="capitalize text-xs">
                        {bid.status}
                      </Badge>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {projectTitle}
                    </h2>

                    <p className="text-sm text-slate-650 line-clamp-2">
                      <span className="font-semibold text-slate-700">Proposal summary:</span> {bid.coverLetter}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <HiCurrencyDollar className="h-4 w-4 text-emerald-600" />
                        <span>My Bid Amount: <strong className="text-slate-800">{formatCurrency(bid.amount)}</strong></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <HiClock className="h-4 w-4 text-slate-400" />
                        <span>Duration: <strong className="text-slate-800">{bid.estimatedTime}</strong></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <HiCalendar className="h-4 w-4 text-slate-400" />
                        <span>Submitted on: {new Date(bid.createdAt).toLocaleDateString()}</span>
                      </span>
                      {budget.min !== undefined && budget.max !== undefined && (
                        <span className="flex items-center gap-1">
                          <HiCurrencyDollar className="h-4 w-4 text-indigo-500" />
                          <span>Proj Budget: {formatCurrency(budget.min)} - {formatCurrency(budget.max)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0">
                    <Link to={`/projects/${projectId}`}>
                      <Button variant="outline" size="sm" icon={HiChevronRight}>
                        View Project
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBids;
