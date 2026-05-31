import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { HiPlus, HiArrowLeft } from 'react-icons/hi';
import { Input, Button, Select, Textarea, Card } from '../components/common';
import { createProject } from '../redux/slices/projectSlice';

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

const CreateProject = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'Web Development',
      experienceLevel: 'beginner',
      skills: '',
      minBudget: '',
      maxBudget: '',
      deadline: ''
    }
  });

  const minBudgetVal = watch('minBudget');

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
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

      const result = await dispatch(createProject(payload)).unwrap();
      toast.success('Project created successfully!');
      navigate('/dashboard/my-projects');
    } catch (err) {
      toast.error(err || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

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
            Post a New Project
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Provide details about the project requirements to attract skilled students.
          </p>
        </div>
      </div>

      <Card className="shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Project Title"
              placeholder="e.g. Develop a responsive React Portfolio website"
              error={errors.title?.message}
              {...register('title', {
                required: 'Project title is required',
                maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
              })}
            />

            <Textarea
              label="Project Description"
              placeholder="Provide a detailed description of the project requirements, scope of work, and expected deliverables..."
              rows={6}
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
                error={errors.category?.message}
                {...register('category', { required: 'Category is required' })}
              />

              <Select
                label="Experience Level Required"
                options={EXPERIENCE_LEVELS}
                error={errors.experienceLevel?.message}
                {...register('experienceLevel', { required: 'Experience level is required' })}
              />
            </div>

            <Input
              label="Skills Required (comma-separated)"
              placeholder="e.g. React, Node.js, TailwindCSS, MongoDB"
              error={errors.skills?.message}
              {...register('skills', {
                required: 'Please specify at least one skill required',
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
                placeholder="e.g. 8000"
                error={errors.minBudget?.message}
                {...register('minBudget', {
                  required: 'Minimum budget is required',
                  min: { value: 0, message: 'Budget cannot be negative' }
                })}
              />

              <Input
                label="Max Budget (₹)"
                type="number"
                placeholder="e.g. 20000"
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
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              icon={HiPlus}
            >
              Post Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateProject;
