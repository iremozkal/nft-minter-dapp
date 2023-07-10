import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import NFTMinter from "./layouts/Mint";
import Login from "./layouts/Login";
import MetamaskContext from "./context/Metamask";

function App() {
  const { isMetamaskConnected } = useContext(MetamaskContext);

  const PrivateRoute = ({ element: Element, ...rest }) => {
    if (!isMetamaskConnected) {
      return <Navigate to="/" replace />;
    }

    return <Element {...rest} />;
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/mint"
              element={<PrivateRoute element={NFTMinter} />}
            />
            <Route path="/*" element={<Navigate to="/" replace />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
