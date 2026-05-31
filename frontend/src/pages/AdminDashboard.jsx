import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  HiUsers, HiBriefcase, HiFolderOpen, HiCreditCard, 
  HiTrash, HiBan, HiCheckCircle, HiPlusCircle, HiTrendingUp 
} from 'react-icons/hi';
import adminService from '../services/adminService';
import { formatCurrency } from '../utils/helpers';

import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch functions
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const { data } = await adminService.getStats();
      setStats(data.stats);
    } catch (err) {
      toast.error('Failed to load system statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data } = await adminService.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const { data } = await adminService.getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const { data } = await adminService.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'projects') fetchProjects();
    if (activeTab === 'categories') fetchCategories();
  }, [activeTab]);

  // Actions
  const handleToggleUserStatus = async (userId) => {
    try {
      const { data } = await adminService.toggleUserStatus(userId);
      toast.success(data.message || 'User status toggled successfully');
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete/suspend this project?')) return;
    try {
      await adminService.deleteProject(projectId);
      toast.success('Project deleted/suspended successfully');
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleCreateCategory = async (formData) => {
    try {
      const { data } = await adminService.createCategory(formData);
      toast.success('Category created successfully');
      setCategories([...categories, data.category]);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminService.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      setCategories(categories.filter(c => c._id !== categoryId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Admin Control Panel</h1>
        <p className="text-sm text-slate-500 mt-1">Manage system configurations, users, project postings, and categories.</p>
      </div>

      {/* Overview Stats (Always visible at top or in Overview tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4 border border-slate-100">
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <HiUsers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats?.totalUsers || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border border-slate-100">
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
            <HiBriefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Projects</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats?.totalProjects || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border border-slate-100">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-500">
            <HiFolderOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Gigs</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats?.activeGigs || stats?.activeProjects || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border border-slate-100">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
            <HiCreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Volume</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{formatCurrency(stats?.transactionVolume || stats?.totalVolume || 0)}</h3>
          </div>
        </Card>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {['overview', 'users', 'projects', 'categories'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-semibold text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-650'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <HiTrendingUp className="text-indigo-600" />
              System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">User Distribution</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Students Registered</span>
                    <span className="font-bold text-slate-800">{stats?.totalStudents || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Clients Registered</span>
                    <span className="font-bold text-slate-800">{stats?.totalClients || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Admins</span>
                    <span className="font-bold text-slate-800">{stats?.totalAdmins || 0}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Project Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Completed Projects</span>
                    <span className="font-bold text-slate-800">{stats?.completedProjects || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Bids Placed</span>
                    <span className="font-bold text-slate-800">{stats?.totalBids || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">System Users</h3>
              <Button size="sm" variant="outline" onClick={fetchUsers}>Refresh</Button>
            </div>
            {isLoadingUsers ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : users.length > 0 ? (
              <Card className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar src={u.avatar} name={u.fullName} size="sm" />
                            <div>
                              <p className="text-sm font-bold text-slate-850">{u.fullName}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'client' ? 'primary' : 'success'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={u.isActive ? 'success' : 'default'}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleUserStatus(u._id)}
                            icon={u.isActive ? HiBan : HiCheckCircle}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteUser(u._id)}
                            icon={HiTrash}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : (
              <EmptyState icon={HiUsers} title="No users found" description="There are no users registered in the system." />
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">System Projects</h3>
              <Button size="sm" variant="outline" onClick={fetchProjects}>Refresh</Button>
            </div>
            {isLoadingProjects ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : projects.length > 0 ? (
              <Card className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Project Title</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {projects.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-bold text-slate-850 line-clamp-1">{p.title}</p>
                            <p className="text-xs text-slate-400">{p.category?.name || 'Uncategorized'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {p.client?.companyName || p.client?.user?.fullName || 'Client'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                          {p.budget?.min !== undefined && p.budget?.max !== undefined
                            ? `${formatCurrency(p.budget.min)} - ${formatCurrency(p.budget.max)}`
                            : formatCurrency(p.budget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={p.status === 'open' ? 'info' : p.status === 'completed' ? 'success' : 'primary'}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteProject(p._id)}
                            icon={HiTrash}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : (
              <EmptyState icon={HiBriefcase} title="No projects found" description="No projects have been posted yet." />
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Category Form */}
            <Card className="h-fit">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <HiPlusCircle className="text-indigo-600 h-5 w-5" />
                Add Category
              </h3>
              <form onSubmit={handleSubmit(handleCreateCategory)} className="space-y-4">
                <Input
                  label="Category Name"
                  placeholder="e.g. Graphic Design"
                  error={errors.name?.message}
                  {...register('name', { required: 'Category name is required' })}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe this categories scope..."
                  error={errors.description?.message}
                  {...register('description', { required: 'Description is required' })}
                />
                <Button type="submit" fullWidth>
                  Create Category
                </Button>
              </form>
            </Card>

            {/* Categories List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Project Categories</h3>
                <Button size="sm" variant="outline" onClick={fetchCategories}>Refresh</Button>
              </div>

              {isLoadingCategories ? (
                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <Card key={cat._id} className="flex justify-between items-start gap-4 border border-slate-150 p-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">{cat.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 p-1"
                        onClick={() => handleDeleteCategory(cat._id)}
                        icon={HiTrash}
                      />
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState icon={HiFolderOpen} title="No categories found" description="Create a category to get started." />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
