import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Participants from './components/Participants.jsx';
import Sessions from './components/Sessions.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Sessions />,
  },
  { path: '/session/:sessionId', element: <Participants /> },
]);

const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
