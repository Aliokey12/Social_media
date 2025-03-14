import { FiLoader } from 'react-icons/fi';

const Loader = () => (
  <div className="flex-center w-full">
    <div className="relative">
      <div className="w-8 h-8 border-2 border-primary-300 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-8 h-8 border-2 border-primary-500 border-b-transparent rounded-full animate-spin animate-pulse" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
    </div>
  </div>
);

export default Loader;