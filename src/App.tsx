import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import routes from "./routes";
import NavBar from "./NavBar";
import './App.css'

function AppWrapper() {
  const location = useLocation();
  const hideNavPaths = ["/login", "/register"];
  const shouldHideNav = hideNavPaths.includes(location.pathname);

  return (
    <div className="has-background-dark" style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {!shouldHideNav && <NavBar />}
      <main 
        className="is-flex-grow-1 px-4 py-5"
        style={{ marginTop: "85px" }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
