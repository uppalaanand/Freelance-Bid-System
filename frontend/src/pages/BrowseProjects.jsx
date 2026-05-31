import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  HiSearch, 
  HiFilter, 
  HiBriefcase, 
  HiCurrencyDollar, 
  HiUser, 
  HiCalendar,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';
import { Input, Button, Badge, Card, Spinner, Select } from '../components/common';
import { formatCurrency } from '../utils/helpers';
import { fetchProjects } from '../redux/slices/projectSlice';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
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
  { value: '', label: 'All Experience Levels' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Expert', label: 'Expert' }
];

const BrowseProjects = () => {
  const dispatch = useDispatch();
  const { projects, totalPages, currentPage, isLoading, error } = useSelector((state) => state.projects);
  const [page, setPage] = useState(1);

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      search: '',
      category: '',
      experienceLevel: '',
      minBudget: '',
      maxBudget: ''
    }
  });

  const watchFilters = watch();

  const fetchFilteredProjects = (filters = watchFilters, pageNum = page) => {
    const params = {
      page: pageNum,
      limit: 9,
      status: 'open',
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
      ...(filters.minBudget && { minBudget: filters.minBudget }),
      ...(filters.maxBudget && { maxBudget: filters.maxBudget })
    };
    dispatch(fetchProjects(params));
  };

  useEffect(() => {
    fetchFilteredProjects(watchFilters, page);
  }, [page, dispatch]);

  const onSearchSubmit = (data) => {
    setPage(1);
    fetchFilteredProjects(data, 1);
  };

  const handleReset = () => {
    reset();
    setPage(1);
    fetchFilteredProjects({
      search: '',
      category: '',
      experienceLevel: '',
      minBudget: '',
      maxBudget: ''
    }, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold leading-7 text-slate-900 sm:text-4xl sm:truncate">
            Browse Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Discover client-posted projects and submit bids that showcase your skills.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <HiFilter className="text-indigo-600" />
              Filters
            </h2>
            <button 
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={handleSubmit(onSearchSubmit)} className="space-y-4">
            <div>
              <Input
                label="Search Keyword"
                placeholder="e.g. React, Python"
                icon={HiSearch}
                {...register('search')}
              />
            </div>

            <div>
              <Select
                label="Category"
                options={CATEGORIES}
                {...register('category')}
              />
            </div>

            <div>
              <Select
                label="Experience Level"
                options={EXPERIENCE_LEVELS}
                {...register('experienceLevel')}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 tracking-wide block mb-1">
                Budget Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  {...register('minBudget')}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  {...register('maxBudget')}
                />
              </div>
            </div>

            <Button type="submit" fullWidth className="mt-4">
              Apply Filters
            </Button>
          </form>
        </div>

        {/* Projects List */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm">
              <HiBriefcase className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No projects found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your filters or search keywords.
              </p>
              <div className="mt-6">
                <Button onClick={handleReset} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <Card key={proj._id} hover className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="primary">{proj.category}</Badge>
                        <Badge variant={proj.experienceLevel === 'Beginner' ? 'success' : proj.experienceLevel === 'Intermediate' ? 'info' : 'warning'}>
                          {proj.experienceLevel}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2">
                        {proj.title}
                      </h3>

                      <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                        {proj.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {proj.skillsRequired?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="default" className="bg-slate-50 text-slate-600">
                            {skill}
                          </Badge>
                        ))}
                        {proj.skillsRequired?.length > 3 && (
                          <Badge variant="default" className="bg-slate-50 text-slate-600">
                            +{proj.skillsRequired.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <HiCurrencyDollar className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-slate-700">
                            {formatCurrency(proj.budget?.min)} - {formatCurrency(proj.budget?.max)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <HiCalendar className="h-4 w-4 text-indigo-500" />
                          <span>Deadline: {new Date(proj.deadline).toLocaleDateString()}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {proj.client?.fullName ? proj.client.fullName[0].toUpperCase() : 'C'}
                          </div>
                          <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                            {proj.client?.fullName || 'Client'}
                          </span>
                        </div>

                        <Link to={`/projects/${proj._id}`}>
                          <Button size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                          <button
                            key={pNum}
                            onClick={() => handlePageChange(pNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                              pNum === page
                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:outline-offset-0'
                            }`}
                          >
                            {pNum}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <HiChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseProjects;
