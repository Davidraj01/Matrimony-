import { Routes, Route } from "react-router-dom";

import MainLayout from "../src/components/MainLayout.jsx";
import Register from "../src/pages/Register.jsx";
import Login from "../src/pages/Login.jsx";
import ResetPassword from "../src/pages/MobileVerification.jsx";
import MobileVerification from "../src/pages/MobileVerification.jsx";
import Dashboard from "../src/pages/Dashboard.jsx";
import Matches from "../src/pages/Matches.jsx";
import Profile from "../src/pages/Profile.jsx";
import ProfileDetails from "../src/pages/ProfileDetails.jsx";
import Received from "../src/pages/Received.jsx";
import Sent from "../src/pages/Sent.jsx";
import Plans from "../src/pages/Plans.jsx";
import Chat from "../src/pages/Chat.jsx";
import ProtectedRoute from "../src/components/ProtectedRoute.jsx";
import Views from "../src/pages/Views.jsx";
import Shortlist from "../src/pages/ShortList.jsx";
import EmailSupport from "../src/pages/EmailSupport.jsx";
import HelpCenter from "../src/pages/HelpCenter.jsx";
import PrivacyPolicy from "../src/pages/PrivacyPolicy.jsx";
import TermsConditions from "../src/pages/TermsConditions.jsx";

export default function UserRoutes() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mobileverify" element={<MobileVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/*  PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<ProfileDetails />} />
          <Route path="/received" element={<Received />} />
          <Route path="/sent" element={<Sent />} />
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/views" element={<Views />} />

          <Route path="/email-support" element={<EmailSupport />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
        </Route>
      </Route>
    </Routes>
  );
}
