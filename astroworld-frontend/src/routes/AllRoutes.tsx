import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from '../pages/intro/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import Home from '../pages/home/Home';
import ProtectedRoute from './ProtectedRoute';
import Skymap from '../pages/skymap/Skymap';
import Explore from '../pages/explore/Explore';
import Murph_AI from '../pages/murph_ai/Murph_AI';
import Events from '../pages/events/Events';
import News from '../pages/news/News';
import Profile from '../pages/profile/Profile';
import MessagingPage from '../pages/messaging/MessagingPage';
import DirectMessaging from '../pages/messaging/DirectMessaging';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/skymap',
    element: (
      <ProtectedRoute>
        <Skymap />
      </ProtectedRoute>
    ),
  },
  {
    path: '/explore',
    element: (
      <ProtectedRoute>
        <Explore />
      </ProtectedRoute>
    ),
  },
  {
    path: '/murphai',
    element: (
      <ProtectedRoute>
        <Murph_AI />
      </ProtectedRoute>
    ),
  },
  {
    path: '/events',
    element: (
      <ProtectedRoute>
        <Events />
      </ProtectedRoute>
    ),
  },
  {
    path: '/news',
    element: (
      <ProtectedRoute>
        <News />
      </ProtectedRoute>
    ),
  },
  {
    path: '/messages',
    element: (
      <ProtectedRoute>
        <MessagingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/messages/chat',
    element: (
      <ProtectedRoute>
        <DirectMessaging />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/:userId',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
]);

const AllRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AllRoutes;
