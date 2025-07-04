import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./Home";
import SiteConfig from "./SiteConfig";
import UserHome from "./UserHome";
import SlotConfig from "./SlotConfig";
import RequestManagement from "./RequestManagement";
import CoustemerHandover from "./CoustemerHandover";
import Chif from "./Chif";
import ChifSetup from "./ChifSetup";
import Chifstep1 from "./Chifstep1";
// import Checklist from "./Checklist";
import Login from "./Pages/Login";
import Configuration from "./components/Configuration";
import Snagging from "./components/Snagging";
import FlatMatrixTable from "./components/FlatMatrixTable";
import ProjectDetails from "./components/Projectdetails";
import ChecklistFloor from "./components/ChecklistFloor";
import ChecklistPage from "./components/ChecklistPage";
import CASetup from "./components/CASetup";
import Header from "./components/Header";
import Setup from "./components/Setup";
import { Toaster } from "react-hot-toast";

import { useEffect } from "react";
import UserSetup from "./containers/setup/UserSetup";
import User from "./containers/setup/User";
import Checklist from "./containers/setup/Checklist";
import EditCheckList from "./containers/EditCheckList";

// Wrapper component to access location and conditionally render header
const Layout = () => {
  const location = useLocation();

  const hideHeaderOnPaths = ["/login"];
  const shouldHideHeader = hideHeaderOnPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideHeader && <Header />}
      <main className={!shouldHideHeader ? "mt-[65px]" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/config" element={<Configuration />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/snagging/:id" element={<Snagging />} />
          <Route path="/Level/:id" element={<FlatMatrixTable />} />
          <Route path="/checklistfloor/:id" element={<ChecklistFloor />} />
          <Route path="/checklistpage/:id" element={<ChecklistPage />} />
          <Route path="/casetup" element={<CASetup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/SiteConfig" element={<SiteConfig />} />
          <Route path="/UserHome" element={<UserHome />} />
          <Route path="/SlotConfig" element={<SlotConfig />} />
          <Route path="/RequestManagement" element={<RequestManagement />} />
          <Route path="/CoustemerHandover" element={<CoustemerHandover />} />
          <Route path="/Chif" element={<Chif />} />
          <Route path="/chif-setup" element={<ChifSetup />} />
          <Route path="/Chifstep1" element={<Chifstep1 />} />
          <Route path="/Checklist" element={<Checklist />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/user-setup" element={<UserSetup />} />
          <Route path="/user" element={<User />} />
          <Route path="/edit-checklist/:id" element={<EditCheckList />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
