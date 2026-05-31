import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiAcademicCap,
  HiBriefcase,
  HiCheckCircle,
  HiStar,
  HiGlobeAlt,
  HiCollection,
  HiOutlineMail,
  HiCalendar,
  HiBadgeCheck,
} from 'react-icons/hi';
import { fetchStudentProfileById, clearViewedProfile } from '../redux/slices/profileSlice';
import {
  Avatar,
  Badge,
  Card,
  Spinner,
  EmptyState,
} from '../components/common';

const StudentProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { viewedProfile, isLoading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudentProfileById(id));
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
          icon={HiOutlineMail}
          title="Profile Not Found"
          description={error || "The student profile you are looking for does not exist or could not be loaded."}
        />
      </div>
    );
  }

  const {
    user,
    headline,
    bio,
    skills = [],
    education = [],
    experience = [],
    portfolio = [],
    availability = 'available', // available, busy, unavailable
    stats = {},
    reviews = [],
  } = viewedProfile;

  // Star Rating Helper
  const renderStars = (rating = 0) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <HiStar
            key={i}
            className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-current' : 'text-slate-200'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER HERO PROFILE */}
      <Card className="relative overflow-hidden bg-slate-900 border-none p-8 md:p-10 text-white rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="xl"
            className="border-4 border-white/20 shadow-lg !h-24 !w-24 md:!h-28 md:!w-28"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl font-extrabold tracking-tight">{user?.name}</h1>
              <div>
                {availability === 'available' ? (
                  <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Available for Projects
                  </Badge>
                ) : (
                  <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    {availability}
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-lg text-slate-300 font-medium">{headline || 'Student Developer / Freelancer'}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <HiOutlineMail className="h-4 w-4" /> {user?.email}
              </span>
              {stats.rating && (
                <span className="flex items-center gap-1 text-amber-300">
                  <HiStar className="h-4 w-4 fill-current" /> {stats.rating} Rating
                </span>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 border-t border-white/10 md:border-t-0 md:border-l md:border-white/10 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-center">
            <div className="text-center px-4">
              <p className="text-2xl font-black text-white">{stats.completedProjects || 0}</p>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">Completed</p>
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-black text-white">{reviews.length}</p>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">Reviews</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: BIO & SKILLS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">About Me</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {bio || 'No biography written yet.'}
            </p>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 font-semibold">Skills</h3>
            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="primary" className="text-xs py-1 px-2.5">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: HISTORY & PORTFOLIO */}
        <div className="lg:col-span-2 space-y-8">
          {/* EXPERIENCE */}
          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HiBriefcase className="text-indigo-600 h-5 w-5" /> Experience
            </h3>
            {experience.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No experience added yet.</p>
            ) : (
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-4 last:pb-0">
                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{exp.role}</h4>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">{exp.company}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                        <HiCalendar className="h-3.5 w-3.5" />
                        {new Date(exp.from).toLocaleDateString([], { month: 'short', year: 'numeric' })} -{' '}
                        {exp.current
                          ? 'Present'
                          : exp.to
                          ? new Date(exp.to).toLocaleDateString([], { month: 'short', year: 'numeric' })
                          : ''}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* EDUCATION */}
          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HiAcademicCap className="text-indigo-600 h-5 w-5" /> Education
            </h3>
            {education.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No education records added yet.</p>
            ) : (
              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-4 last:pb-0">
                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 bg-sky-500 rounded-full"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{edu.degree} in {edu.fieldOfStudy}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{edu.school}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                        <HiCalendar className="h-3.5 w-3.5" />
                        {new Date(edu.from).toLocaleDateString([], { month: 'short', year: 'numeric' })} -{' '}
                        {edu.current
                          ? 'Present'
                          : edu.to
                          ? new Date(edu.to).toLocaleDateString([], { month: 'short', year: 'numeric' })
                          : ''}
                      </span>
                    </div>
                    {edu.description && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* PORTFOLIO */}
          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HiCollection className="text-indigo-600 h-5 w-5" /> Portfolio
            </h3>
            {portfolio.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No portfolio items added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.map((item, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 bg-slate-50/50">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover border-b border-slate-100" />
                    )}
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3">{item.description}</p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          <HiGlobeAlt className="h-3.5 w-3.5" /> View Project
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* REVIEWS & CLIENT RATINGS */}
          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HiBadgeCheck className="text-indigo-600 h-5 w-5" /> Client Reviews
            </h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No reviews yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={rev.client?.avatar} name={rev.client?.name} size="sm" />
                        <div>
                          <span className="text-xs font-bold text-slate-800">{rev.client?.name || 'Client'}</span>
                          <span className="text-[10px] text-slate-400 block">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {renderStars(rev.rating)}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
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

export default StudentProfile;
