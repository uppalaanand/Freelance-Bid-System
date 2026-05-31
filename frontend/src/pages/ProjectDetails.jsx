import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  HiArrowLeft, 
  HiBriefcase, 
  HiCalendar, 
  HiCurrencyDollar, 
  HiUser, 
  HiTag, 
  HiCheckCircle, 
  HiXCircle, 
  HiExternalLink, 
  HiDocumentText,
  HiClock
} from 'react-icons/hi';
import { Input, Button, Badge, Card, Spinner, Textarea } from '../components/common';
import { formatCurrency } from '../utils/helpers';
import { fetchProject } from '../redux/slices/projectSlice';
import { fetchProjectBids, submitBid, acceptBid, rejectBid, clearBids } from '../redux/slices/bidSlice';

const ProjectDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { project, isLoading: isProjectLoading, error: projectError } = useSelector((state) => state.projects);
  const { projectBids, isLoading: isBidsLoading, error: bidsError } = useSelector((state) => state.bids);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProject(id));
      dispatch(fetchProjectBids(id));
    }
    return () => {
      dispatch(clearBids());
    };
  }, [id, dispatch]);

  const isClient = user?.role === 'client';
  const isStudent = user?.role === 'student';
  const isOwner = project?.client === user?._id || project?.client?._id === user?._id;
  
  const studentBid = projectBids.find(
    (bid) => bid.student === user?._id || bid.student?._id === user?._id
  );

  const handleBidSubmit = async (data) => {
    try {
      setSubmittingBid(true);
      const formattedLinks = data.portfolioLinks
        ? data.portfolioLinks.split(',').map((link) => link.trim()).filter(Boolean)
        : [];
      
      const payload = {
        project: id,
        amount: Number(data.amount),
        coverLetter: data.coverLetter,
        estimatedTime: data.estimatedTime,
        portfolioLinks: formattedLinks,
      };

      await dispatch(submitBid(payload)).unwrap();
      toast.success('Bid submitted successfully!');
      reset();
      dispatch(fetchProjectBids(id));
    } catch (err) {
      toast.error(err || 'Failed to submit bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await dispatch(acceptBid(bidId)).unwrap();
      toast.success('Bid accepted successfully!');
      dispatch(fetchProject(id)); // Refresh project status
    } catch (err) {
      toast.error(err || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await dispatch(rejectBid(bidId)).unwrap();
      toast.success('Bid rejected successfully!');
    } catch (err) {
      toast.error(err || 'Failed to reject bid');
    }
  };

  if (isProjectLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <HiXCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="mt-2 text-lg font-medium text-slate-900">Project Not Found</h3>
        <p className="mt-1 text-sm text-slate-500">{projectError || "The project you are looking for does not exist."}</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/projects')} variant="outline">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const projectSkills = project.skills || project.skillsRequired || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        to="/projects" 
        className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <HiArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <Badge variant="primary" className="text-sm px-3 py-1">{project.category}</Badge>
              <div className="flex gap-2">
                <Badge variant={project.status === 'open' ? 'success' : 'warning'} className="text-sm px-3 py-1 capitalize">
                  {project.status}
                </Badge>
                <Badge variant="info" className="text-sm px-3 py-1 capitalize">
                  {project.experienceLevel}
                </Badge>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
              {project.title}
            </h1>

            <div className="prose max-w-none text-slate-600 mb-6 whitespace-pre-line">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Project Description</h3>
              {project.description}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {projectSkills.map((skill, index) => (
                  <Badge key={index} variant="default" className="bg-slate-100 text-slate-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Client Bids View */}
          {isOwner && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
                Submitted Bids ({projectBids.length})
              </h2>

              {isBidsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : projectBids.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <HiDocumentText className="mx-auto h-12 w-12 text-slate-350 mb-3" />
                  <p className="font-medium text-slate-800">No bids submitted yet</p>
                  <p className="text-xs">Bids from students will appear here once submitted.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {projectBids.map((bid) => (
                    <Card key={bid._id} className="border-slate-100 bg-slate-50/50">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-800">
                              {bid.student?.fullName || 'Student'}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({bid.student?.email || 'N/A'})
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1 font-semibold text-emerald-700">
                              <HiCurrencyDollar className="h-4 w-4" />
                              Bid: {formatCurrency(bid.amount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiClock className="h-4 w-4 text-slate-400" />
                              Duration: {bid.estimatedTime}
                            </span>
                            <span className="capitalize">
                              Status: <Badge variant={bid.status === 'accepted' ? 'success' : bid.status === 'rejected' ? 'danger' : 'warning'}>{bid.status}</Badge>
                            </span>
                          </div>

                          <div className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-150 mb-3 whitespace-pre-line">
                            <span className="font-semibold text-xs text-slate-500 block mb-1">COVER LETTER:</span>
                            {bid.coverLetter}
                          </div>

                          {bid.portfolioLinks?.length > 0 && (
                            <div className="mb-3">
                              <span className="font-semibold text-xs text-slate-500 block mb-1">PORTFOLIO LINKS:</span>
                              <div className="flex flex-wrap gap-2">
                                {bid.portfolioLinks.map((link, idx) => (
                                  <a 
                                    key={idx} 
                                    href={link.startsWith('http') ? link : `https://${link}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-850 hover:underline bg-indigo-50/50 px-2 py-1 rounded"
                                  >
                                    <HiExternalLink className="h-3 w-3" />
                                    Link {idx + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {project.status === 'open' && bid.status === 'pending' && (
                          <div className="flex sm:flex-col gap-2 min-w-[120px]">
                            <Button 
                              size="sm" 
                              variant="primary" 
                              onClick={() => handleAcceptBid(bid._id)}
                              icon={HiCheckCircle}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => handleRejectBid(bid._id)}
                              icon={HiXCircle}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Student Bid Form or Bid Status Details */}
          {isStudent && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              {studentBid ? (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                    Your Submitted Bid
                  </h2>
                  <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Bid Status</span>
                      <Badge variant={studentBid.status === 'accepted' ? 'success' : studentBid.status === 'rejected' ? 'danger' : 'warning'} className="text-sm px-3 py-1 capitalize">
                        {studentBid.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-500 block">YOUR BID AMOUNT</span>
                        <span className="text-lg font-bold text-slate-800">{formatCurrency(studentBid.amount)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">ESTIMATED TIME</span>
                        <span className="text-lg font-bold text-slate-800">{studentBid.estimatedTime}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block mb-1">YOUR COVER LETTER</span>
                      <p className="text-sm text-slate-650 bg-white p-3 rounded-lg border border-slate-150 whitespace-pre-line">
                        {studentBid.coverLetter}
                      </p>
                    </div>

                    {studentBid.portfolioLinks?.length > 0 && (
                      <div>
                        <span className="text-xs text-slate-500 block mb-1">PORTFOLIO LINKS</span>
                        <div className="flex flex-wrap gap-2">
                          {studentBid.portfolioLinks.map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.startsWith('http') ? link : `https://${link}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-650 hover:text-indigo-850 hover:underline bg-white px-3 py-1.5 rounded-lg border border-slate-205"
                            >
                              <HiExternalLink className="h-3 w-3" />
                              Portfolio {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : project.status === 'open' ? (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
                    Place a Bid
                  </h2>
                  <form onSubmit={handleSubmit(handleBidSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Bid Amount (₹)"
                        type="number"
                        placeholder="e.g. 150"
                        error={errors.amount?.message}
                        {...register('amount', {
                          required: 'Bid amount is required',
                          min: { value: 1, message: 'Amount must be greater than 0' }
                        })}
                      />
                      <Input
                        label="Estimated Time"
                        type="text"
                        placeholder="e.g. 5 days, 2 weeks"
                        error={errors.estimatedTime?.message}
                        {...register('estimatedTime', {
                          required: 'Estimated time is required'
                        })}
                      />
                    </div>

                    <Textarea
                      label="Cover Letter"
                      placeholder="Explain why you are the best fit for this project..."
                      rows={5}
                      error={errors.coverLetter?.message}
                      {...register('coverLetter', {
                        required: 'Cover letter is required',
                        minLength: { value: 30, message: 'Cover letter must be at least 30 characters' }
                      })}
                    />

                    <Input
                      label="Portfolio Links (comma-separated URLs)"
                      type="text"
                      placeholder="e.g. github.com/user, portfolio.com"
                      error={errors.portfolioLinks?.message}
                      {...register('portfolioLinks')}
                    />

                    <Button 
                      type="submit" 
                      isLoading={submittingBid} 
                      fullWidth 
                      className="mt-2"
                    >
                      Submit Bid
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <p className="font-semibold text-slate-800">Bidding is Closed</p>
                  <p className="text-xs">This project is no longer accepting bids.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Project Summary
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <HiCurrencyDollar className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">BUDGET RANGE</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(project.budget?.min)} - {formatCurrency(project.budget?.max)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HiCalendar className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">DEADLINE</span>
                  <span className="text-sm font-bold text-slate-800">
                    {new Date(project.deadline).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HiBriefcase className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">BIDS RECEIVED</span>
                  <span className="text-sm font-bold text-slate-800">
                    {project.bidCount || projectBids.length}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HiUser className="h-5 w-5 text-sky-500 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">POSTED BY</span>
                  <span className="text-sm font-bold text-slate-800">
                    {project.client?.fullName || 'Client'}
                  </span>
                </div>
              </div>
            </div>

            {isOwner && project.status === 'open' && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link to={`/dashboard/edit-project/${project._id}`}>
                  <Button fullWidth variant="outline">
                    Edit Project
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
