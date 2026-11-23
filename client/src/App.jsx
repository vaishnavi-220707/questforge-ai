import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Code-split pages via React.lazy for optimal chunk distribution & fast initial paint
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })))
const ScholarshipExplorerPage = lazy(() => import('./pages/ScholarshipExplorerPage').then(m => ({ default: m.ScholarshipExplorerPage })))
const ScholarshipDetailPage = lazy(() => import('./pages/ScholarshipDetailPage').then(m => ({ default: m.ScholarshipDetailPage })))
const DocumentUploadPage = lazy(() => import('./pages/DocumentUploadPage').then(m => ({ default: m.DocumentUploadPage })))
const DocumentAnalysisPage = lazy(() => import('./pages/DocumentAnalysisPage').then(m => ({ default: m.DocumentAnalysisPage })))
const AuditResultsPage = lazy(() => import('./pages/AuditResultsPage').then(m => ({ default: m.AuditResultsPage })))
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })))
const ReportPage = lazy(() => import('./pages/ReportPage').then(m => ({ default: m.ReportPage })))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })))
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border border-teal-500/10 border-b-teal-400 animate-spin" style={{ animationDirection: 'reverse' }} />
      </div>
      <p className="text-xs font-mono tracking-widest text-slate-400 uppercase animate-pulse">Initializing Viewport...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="scholarships" element={<ScholarshipExplorerPage />} />
              <Route path="scholarships/:id" element={<ScholarshipDetailPage />} />
              <Route path="upload" element={<DocumentUploadPage />} />
              <Route path="analysis" element={<DocumentAnalysisPage />} />
              <Route path="audit-results/:id" element={<AuditResultsPage />} />
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="report/:id" element={<ReportPage />} />
              <Route path="privacy" element={<PrivacyPolicyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="cookies" element={<CookiePolicyPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
