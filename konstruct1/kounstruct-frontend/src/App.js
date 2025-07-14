import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import InspectorPending from "./components/InspectorPending";
import Home from "./Home";
import SiteConfig from "./SiteConfig";
import UserHome from "./UserHome";
import SlotConfig from "./SlotConfig";
import RequestManagement from "./RequestManagement";
import CoustemerHandover from "./CoustemerHandover";
import Chif from "./Chif";
import ChifSetup from "./ChifSetup";
import Chifstep1 from "./Chifstep1";
import { ThemeProvider } from "./ThemeContext";   // <-- ThemeProvider here!

// ... (all your imports as before)
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
import CategoryChecklist from './components/CategoryChecklist';
import MyOngoingChecklist from "./components/MyInProgressSubmissions";
import MyInProgressSubmissions from "./components/MyInProgressSubmissions";
import CheckerInbox from "./components/CheckerInbox";
import InitializeChecklist from "./components/InitializeChecklist";
import PendingForMakerItems from "./components/PendingForMakerItems";
import UsersManagement from "./components/UsersManagement";


import UserSetup from "./containers/setup/UserSetup";
import User from "./containers/setup/User";
import Checklist from "./containers/setup/Checklist";
import EditCheckList from "./containers/EditCheckList";
import AllChecklists from "./components/AllChecklists";

import AccessibleChecklists from "./components/AccessibleChecklists";
import HierarchicalVerifications from './components/HierarchicalVerifications'; 
import PendingInspectorChecklists from './components/PendingInspectorChecklists'
import PendingSupervisorItems from "./components/PendingSupervisorItems";

const Layout = () => {
  const location = useLocation();
  const hideHeaderOnPaths = ["/login"];
  const shouldHideHeader = hideHeaderOnPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideHeader && <Header />}
      <main className={!shouldHideHeader ? "mt-[65px]" : ""}>
        <Routes>
          <Route path="/config" element={<Configuration />} />
          <Route path="/all-checklists" element={<AllChecklists />} />
          <Route
            path="/my-ongoing-checklist"
            element={<MyOngoingChecklist />}
          />
          {/* <Route
            path="/my-inprogress-submissions"
            element={<MyInProgressSubmissions />}
          /> */}
          <Route path="/checker-inbox" element={<CheckerInbox />} />

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

          <Route
            path="/PendingSupervisorItems"
            element={<PendingSupervisorItems />}
          />
          <Route path="/UsersManagement" element={<UsersManagement />} />
          <Route
            path="/Initialize-Checklist"
            element={<InitializeChecklist />}
          />
          <Route
            path="/PendingInspector-Checklist"
            element={<PendingInspectorChecklists />}
          />
          <Route
            path="/Pending-For-MakerItems"
            element={<PendingForMakerItems />}
          />

          <Route path="/chif-setup" element={<ChifSetup />} />
          <Route path="/Chifstep1" element={<Chifstep1 />} />
          <Route path="/Checklist" element={<Checklist />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/user-setup" element={<UserSetup />} />
          <Route path="/user" element={<User />} />
          <Route path="/category-sidebar" element={<CategoryChecklist />} />
          {/* <Route
            path="/checker-verified-inspector-pending"
            element={<InspectorPending />}
          /> */}
          <Route path="/edit-checklist/:id" element={<EditCheckList />} />
          {/* <Route
            path="/accessible-checklists"
            element={<AccessibleChecklists />}
          /> */}
          <Route
            path="/hierarchical-verifications"
            element={<HierarchicalVerifications />}
          />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Layout />
      </Router>
    </ThemeProvider>
  );
}

export default App;