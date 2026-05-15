import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./screens/Auth.tsx";
import Dashboard from "./screens/Dashboard.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="page-fade">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
