import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Spin } from "antd";
import AppRoutes from "./routers/AppRoutes";
import { fetchCurrentUser } from "./stores/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUser()).finally(() => {
      setReady(true);
    });
  }, [dispatch]);

  if (!ready) {
    return <Spin fullscreen />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;