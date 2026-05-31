import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { HiPencil, HiArrowLeft } from 'react-icons/hi';
import { Input, Button, Select, Textarea, Card, Spinner } from '../components/common';
import { fetchProject, updateProject } from '../redux/slices/projectSlice';

const CATEGORIES = [
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Mobile Apps', label: 'Mobile Apps' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
  { value: 'Content Writing', label: 'Content Writing' },
  { value: 'Graphic Design', label: 'Graphic Design' },
  { value: 'Digital Marketing', label: 'Digital Marketing' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Other', label: 'Other' }
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

const EditProject = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { project, isLoading, error } = useSelector((state) => state.projects);
  const [updating, setUpdating] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      experienceLevel: '',
      skills: '',
      minBudget: '',
      maxBudget: '',
      deadline: ''
    }
  });

  const minBudgetVal = watch('minBudget');

  useEffect(() => {
    if (id) {
      dispatch(fetchProject(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (project) {
      const skillsStr = project.skills 
        ? project.skills.join(', ') 
        : project.skillsRequired 
        ? project.skillsRequired.join(', ') 
        : '';
        
      reset({
        title: project.title,
        description: project.description,
        category: project.category,
        experienceLevel: project.experienceLevel,
        skills: skillsStr,
        minBudget: project.budget?.min || '',
        maxBudget: project.budget?.max || '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().substring(0, 10) : ''
      });
    }
  }, [project, reset]);

  const onSubmit = async (data) => {
    try {
      setUpdating(true);
      const skillsArray = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        experienceLevel: data.experienceLevel,
        skills: skillsArray,
        budget: {
          min: Number(data.minBudget),
          max: Number(data.maxBudget)
        },
        deadline: data.deadline
      };

      await dispatch(updateProject({ id, projectData: payload })).unwrap();
      toast.success('Project updated successfully!');
      navigate(`/projects/${id}`);
    } catch (err) {
      toast.error(err || 'Failed to update project');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-medium text-slate-900">Project Not Found</h3>
        <p className="mt-1 text-sm text-slate-500">{error || "Could not fetch project details."}</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/dashboard/my-projects')} variant="outline">
            My Projects
          </Button>
        </div>
      </div>
    );
  }

  const isEditable = project.status === 'open';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-semibold text-slate-650 hover:text-slate-900 mb-6 transition-colors"
      >
        <HiArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>

      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold leading-7 text-slate-900 sm:text-4xl sm:truncate">
            Edit Project
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Modify the project details below. Note that details can only be edited while the status is still open.
          </p>
        </div>
      </div>

      {!isEditable && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-medium">
          This project is currently marked as <span className="capitalize font-bold">{project.status}</span>. Edits are disabled unless the project status is Open.
        </div>
      )}

      <Card className="shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Project Title"
              placeholder="e.g. Develop a responsive React Portfolio website"
              disabled={!isEditable}
              error={errors.title?.message}
              {...register('title', {
                required: 'Project title is required',
                maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
              })}
            />

            <Textarea
              label="Project Description"
              placeholder="Provide a detailed description..."
              rows={6}
              disabled={!isEditable}
              error={errors.description?.message}
              {...register('description', {
                required: 'Project description is required',
                minLength: { value: 30, message: 'Description must be at least 30 characters' }
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                options={CATEGORIES}
                disabled={!isEditable}
                error={errors.category?.message}
                {...register('category', { required: 'Category is required' })}
              />

              <Select
                label="Experience Level Required"
                options={EXPERIENCE_LEVELS}
                disabled={!isEditable}
                error={errors.experienceLevel?.message}
                {...register('experienceLevel', { required: 'Experience level is required' })}
              />
            </div>

            <Input
              label="Skills Required (comma-separated)"
              placeholder="e.g. React, Node.js, TailwindCSS"
              disabled={!isEditable}
              error={errors.skills?.message}
              {...register('skills', {
                required: 'Skills list is required',
                validate: (val) => {
                  const arr = val.split(',').map((s) => s.trim()).filter(Boolean);
                  return arr.length > 0 || 'Please specify at least one skill required';
                }
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Min Budget (₹)"
                type="number"
                disabled={!isEditable}
                error={errors.minBudget?.message}
                {...register('minBudget', {
                  required: 'Minimum budget is required',
                  min: { value: 0, message: 'Budget cannot be negative' }
                })}
              />

              <Input
                label="Max Budget (₹)"
                type="number"
                disabled={!isEditable}
                error={errors.maxBudget?.message}
                {...register('maxBudget', {
                  required: 'Maximum budget is required',
                  validate: (val) => {
                    if (Number(val) < Number(minBudgetVal)) {
                      return 'Maximum budget must be greater than or equal to minimum budget';
                    }
                    return true;
                  }
                })}
              />

              <Input
                label="Project Deadline"
                type="date"
                disabled={!isEditable}
                error={errors.deadline?.message}
                {...register('deadline', {
                  required: 'Deadline is required',
                  validate: (val) => {
                    const selected = new Date(val);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return selected >= today || 'Deadline must be a future date';
                  }
                })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/my-projects')}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={updating}
              disabled={!isEditable}
              icon={HiPencil}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProject;
