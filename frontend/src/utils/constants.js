export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Blockchain',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'Database Management',
  'API Development',
  'Game Development',
  'Desktop Application',
  'Embedded Systems',
  'Content Writing',
  'Graphic Design',
  'Video Editing',
  'Digital Marketing',
  'Other',
];

export const SKILLS = [
  'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express.js',
  'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#',
  '.NET', 'Ruby', 'Rails', 'PHP', 'Laravel', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Flutter', 'React Native', 'TypeScript',
  'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'TensorFlow', 'PyTorch', 'OpenCV', 'NLP', 'Computer Vision',
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
  'Git', 'Linux', 'REST API', 'GraphQL', 'Socket.IO',
];

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

export const PROJECT_STATUS = {
  open: { label: 'Open', color: 'bg-emerald-100 text-emerald-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700' },
};

export const BID_STATUS = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-700' },
};

export const MILESTONE_STATUS = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  submitted: { label: 'Submitted', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  paid: { label: 'Paid', color: 'bg-purple-100 text-purple-700' },
};

export const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-700' },
  released: { label: 'Released', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};
