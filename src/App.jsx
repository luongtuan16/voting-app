import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import BallotPage from './components/BallotPage'
import HomePage from './components/HomePage'
import Layout from './components/Layout'
import ProposalPage from './components/ProposalPage'
import VoterPage from './components/VoterPage'
import { PAGE_ROUTE_BALLOTS, PAGE_ROUTE_HOME, PAGE_ROUTE_PROPOSALS, PAGE_ROUTE_VOTERS } from './utils/constants'

const renderWithLayout = (element) => <Layout>{element}</Layout>;

const router = createBrowserRouter([
  {
    path: PAGE_ROUTE_HOME,
    element: renderWithLayout(<HomePage />),
  },
  {
    path: PAGE_ROUTE_BALLOTS,
    element: renderWithLayout(<BallotPage />),
  },
  {
    path: PAGE_ROUTE_VOTERS,
    element: renderWithLayout(<VoterPage />),
  },
  {
    path: PAGE_ROUTE_PROPOSALS,
    element: renderWithLayout(<ProposalPage />),
  },
  // {
  //   path: "/phase",
  //   element: renderWithLayout(<ProposalPage />),
  // },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
