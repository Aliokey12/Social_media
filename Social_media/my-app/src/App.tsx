import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layouts
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";

// Auth Forms
import SignupForm from "@/_auth/forms/SignupForm";
import SigninForm from "@/_auth/forms/SigninForm";
import ForgotPasswordForm from "@/_auth/forms/ForgotPasswordForm";
import ResetPasswordForm from "@/_auth/forms/ResetPasswordForm";

// Components
import { Toaster } from "@/components/ui/toaster";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";

// Lazy loaded pages
const Home = lazy(() => import("@/_root/pages/Home"));
const Explore = lazy(() => import("@/_root/pages/Explore"));
const Saved = lazy(() => import("@/_root/pages/Saved"));
const CreatePost = lazy(() => import("@/_root/pages/CreatePost"));
const Profile = lazy(() => import("@/_root/pages/Profile"));
const EditPost = lazy(() => import("@/_root/pages/EditPost"));
const PostDetails = lazy(() => import("@/_root/pages/PostDetails"));
const UpdateProfile = lazy(() => import("@/_root/pages/UpdateProfile"));
const AllUsers = lazy(() => import("@/_root/pages/AllUsers"));
const Messages = lazy(() => import("@/_root/pages/Messages"));
const MessageDetail = lazy(() => import("@/_root/pages/MessageDetail"));
const ExploreUsers = lazy(() => import("@/_root/pages/ExploreUsers"));

import "./globals.css";
import "./index.css";

const App = () => {
  const { isLoading, isAuthenticated } = useUserContext();

  if (isLoading) {
    return (
      <div className="flex-center w-full h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <main className="flex h-screen">
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
        </Route>

        {/* Protected Routes */}
        <Route 
          element={
            isAuthenticated ? (
              <RootLayout />
            ) : (
              <Navigate to="/sign-in" />
            )
          }
        >
          <Route index element={
            <Suspense fallback={<Loader />}>
              <Home />
            </Suspense>
          } />
          
          {/* Content Routes */}
          <Route path="/explore" element={
            <Suspense fallback={<Loader />}>
              <Explore />
            </Suspense>
          } />
          <Route path="/saved" element={
            <Suspense fallback={<Loader />}>
              <Saved />
            </Suspense>
          } />
          <Route path="/create-post" element={
            <Suspense fallback={<Loader />}>
              <CreatePost />
            </Suspense>
          } />
          <Route path="/update-post/:id" element={
            <Suspense fallback={<Loader />}>
              <EditPost />
            </Suspense>
          } />
          <Route path="/posts/:id" element={
            <Suspense fallback={<Loader />}>
              <PostDetails />
            </Suspense>
          } />
          
          {/* User Routes */}
          <Route path="/profile/:id/*" element={
            <Suspense fallback={<Loader />}>
              <Profile />
            </Suspense>
          } />
          <Route path="/update-profile/:id" element={
            <Suspense fallback={<Loader />}>
              <UpdateProfile />
            </Suspense>
          } />
          <Route path="/all-users" element={
            <Suspense fallback={<Loader />}>
              <AllUsers />
            </Suspense>
          } />
          <Route path="/explore-users" element={
            <Suspense fallback={<Loader />}>
              <ExploreUsers />
            </Suspense>
          } />
          
          {/* Message Routes */}
          <Route path="/messages" element={
            <Suspense fallback={<Loader />}>
              <Messages />
            </Suspense>
          } />
          <Route path="/messages/:conversationId" element={
            <Suspense fallback={<Loader />}>
              <MessageDetail />
            </Suspense>
          } />
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;