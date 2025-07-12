import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";

// Pages
import Login from "../Login/login";
import Home from "../Home/ticketlist";
import Create from "../CreateTicket/ticket";
import CreateTicket from "../CreateTicket/createticket";
import Dashboard from "../Dashboard/dashboard";
import DashboardTable from "../Dashboard/DashboardTable";
import Reports from "../Reports/report";
import Location from "../Location/location";
import TicketUserManagement from "../createuser/user";
import Project from "../Project/project";
import Assets from "../Assets/asset";
import CustomTable from "../CustomTable";
import Unauthorized from "../Unotherized/Unauthorized"
import FaultyAsset from "../FaultyAsset/faultyasset";
import ReplacementAsset from "../Replacement/replacement";
import ScrapAsset from "../Scrap/scrap"
export default function Routers() {
  return (
    <Routes>
      {/* Always show Login on root route */}
      <Route path="/" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/app/users/tickets"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/tickets/create"
        element={
          <ProtectedRoute>
            <Create />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/dashboard/overview"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/dashboard/tableoverview"
        element={
          <ProtectedRoute>
            <DashboardTable />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/analytics/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/master/locations"
        element={
          <ProtectedRoute>
            <Location />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/users/settings"
        element={
          <ProtectedRoute>
            <TicketUserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/master/projects"
        element={
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/master/assets"
        element={
          <ProtectedRoute>
            <Assets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/master/faultyassets"
        element={
          <ProtectedRoute>
            <FaultyAsset />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/master/replacementassets"
        element={
          <ProtectedRoute>
            <ReplacementAsset />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/master/scrapassets"
        element={
          <ProtectedRoute>
            <ScrapAsset />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/CustomTable"
        element={
          <ProtectedRoute>
            <CustomTable />
          </ProtectedRoute>
        }
      />
      <Route path="/403" element={<Unauthorized />} />
    </Routes>
  );
}
