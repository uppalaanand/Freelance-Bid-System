import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
              StudentBid
            </span>
            <p className="text-slate-400 text-sm">
              StudentBid is a localized freelance marketplace specifically designed for students to get hands-on experience, build their portfolios, and earn money safely.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/projects" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Browse Projects
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">For Students</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Join as Student
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Find Internships
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Join as Client
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Post a Project
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} StudentBid. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
