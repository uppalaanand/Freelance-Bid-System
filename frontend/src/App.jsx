import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';
import { getMe } from './redux/slices/authSlice';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-semibold',
          duration: 3500,
        }}
      />
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </SocketProvider>
    </Provider>
  );
}

export default App;
