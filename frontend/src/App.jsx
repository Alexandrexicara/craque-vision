import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AthleteProfile from './pages/AthleteProfile';
import AthleteDashboard from './pages/AthleteDashboard';
import UploadVideo from './pages/UploadVideo';
import ScoutDashboard from './pages/ScoutDashboard';
import SearchAthletes from './pages/SearchAthletes';
import ClubPlans from './pages/ClubPlans';
import SubscriptionPayment from './pages/SubscriptionPayment';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import CarouselBanner from './components/CarouselBanner';
import PrivateRoute from './components/PrivateRoute';

console.log('✅ App.jsx carregado com sucesso');

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <CarouselBanner />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/atleta/:id" element={<AthleteProfile />} />
                <Route path="/buscar" element={<SearchAthletes />} />
                <Route path="/planos" element={<ClubPlans />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/pagamento" element={
                  <PrivateRoute allowedTypes={['scout', 'club']}>
                    <SubscriptionPayment />
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard" element={
                  <PrivateRoute allowedTypes={['athlete']}>
                    <AthleteDashboard />
                  </PrivateRoute>
                } />
                <Route path="/upload" element={
                  <PrivateRoute allowedTypes={['athlete']}>
                    <UploadVideo />
                  </PrivateRoute>
                } />
                <Route path="/scout" element={
                  <PrivateRoute allowedTypes={['scout', 'club']}>
                    <ScoutDashboard />
                  </PrivateRoute>
                } />
                <Route path="/admin" element={
                  <PrivateRoute allowedTypes={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                } />
              </Routes>
            </main>
            <CarouselBanner />
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
