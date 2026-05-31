import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { HiUser, HiShieldCheck, HiOutlineDocumentText } from 'react-icons/hi';
import useAuth from '../hooks/useAuth';
import {
  fetchStudentProfile,
  fetchClientProfile,
  updateStudentProfile,
  updateClientProfile,
  uploadAvatar,
  uploadResume
} from '../redux/slices/profileSlice';

import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import Select from '../components/common/Select';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { profile, isLoading } = useSelector((state) => state.profile);
  const [activeTab, setActiveTab] = useState('profile');
  const { register, handleSubmit, reset, setValue } = useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.role === 'student') {
      dispatch(fetchStudentProfile());
    } else if (user?.role === 'client') {
      dispatch(fetchClientProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (profile) {
      if (user?.role === 'student') {
        reset({
          bio: profile.bio || '',
          skills: profile.skills?.join(', ') || '',
          hourlyRate: profile.hourlyRate || '',
          availability: profile.availability || 'available',
          github: profile.github || '',
          linkedin: profile.linkedin || '',
          website: profile.website || '',
        });
      } else {
        reset({
          company: profile.company || '',
          bio: profile.bio || '',
          website: profile.website || '',
          industry: profile.industry || '',
          location: profile.location || '',
          linkedin: profile.linkedin || '',
        });
      }
    }
  }, [profile, user, reset]);

  const onSubmit = async (data) => {
    try {
      if (user?.role === 'student') {
        const formattedData = {
          ...data,
          skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          hourlyRate: Number(data.hourlyRate) || 0,
        };
        await dispatch(updateStudentProfile(formattedData)).unwrap();
      } else {
        await dispatch(updateClientProfile(data)).unwrap();
      }
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await dispatch(uploadAvatar(formData)).unwrap();
      toast.success('Avatar uploaded successfully');
    } catch (err) {
      toast.error(err || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await dispatch(uploadResume(formData)).unwrap();
      toast.success('Resume uploaded successfully');
    } catch (err) {
      toast.error(err || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800 tracking-tight">Account Settings</h1>

      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'documents'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Files & Branding
        </button>
      </div>

      {activeTab === 'profile' ? (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {user?.role === 'student' ? (
              <>
                <Textarea
                  label="Bio / Professional Summary"
                  placeholder="Tell clients about yourself, your background, and your key strengths..."
                  {...register('bio')}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Skills (comma separated)"
                    placeholder="React, Node.js, Tailwind CSS"
                    {...register('skills')}
                  />
                  <Input
                    label="Hourly Rate (₹ / hr)"
                    type="number"
                    placeholder="500"
                    {...register('hourlyRate')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Availability Status"
                    options={[
                      { value: 'available', label: 'Available for work' },
                      { value: 'busy', label: 'Busy' },
                      { value: 'unavailable', label: 'Not Available' },
                    ]}
                    {...register('availability')}
                  />
                  <Input
                    label="GitHub Profile URL"
                    placeholder="https://github.com/username"
                    {...register('github')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="LinkedIn Profile URL"
                    placeholder="https://linkedin.com/in/username"
                    {...register('linkedin')}
                  />
                  <Input
                    label="Personal Website URL"
                    placeholder="https://mywebsite.com"
                    {...register('website')}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company / Organisation Name"
                    placeholder="My Company"
                    {...register('company')}
                  />
                  <Input
                    label="Industry Sector"
                    placeholder="Information Technology"
                    {...register('industry')}
                  />
                </div>
                <Textarea
                  label="Company Bio"
                  placeholder="Describe your company or your background..."
                  {...register('bio')}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Location"
                    placeholder="Mumbai, India"
                    {...register('location')}
                  />
                  <Input
                    label="Company Website URL"
                    placeholder="https://mycompany.com"
                    {...register('website')}
                  />
                </div>
                <Input
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/company/username"
                  {...register('linkedin')}
                />
              </>
            )}

            <Button type="submit" isLoading={isLoading} className="shadow-lg shadow-indigo-100">
              Save Changes
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar name={user?.fullName} src={profile?.user?.avatar?.url} size="xl" />
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-bold text-slate-800 text-base">Profile Image</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Upload a professional headshot to earn trust from potential collaborators. Max file size: 5MB.
              </p>
              <label className="inline-flex cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </span>
              </label>
            </div>
          </div>

          {/* Resume Upload for Students */}
          {user?.role === 'student' && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <HiOutlineDocumentText className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base">Resume / CV</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Upload your latest CV in PDF format to showcase your academic achievements.
                  </p>
                  {profile?.resume?.url && (
                    <div className="mt-2">
                      <a
                        href={profile.resume.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-850 underline"
                      >
                        View Current Resume
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <label className="inline-flex cursor-pointer mt-2 pl-14">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
                  {isUploading ? 'Uploading...' : 'Upload PDF'}
                </span>
              </label>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Settings;
