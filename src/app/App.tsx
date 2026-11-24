import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AppLayout from "./layouts/AppLayout";

const DashboardPage = lazy(() => import("../features/tasks/pages/DashboardPage"));
const TasksPage = lazy(() => import("../features/tasks/pages/TasksPage"));

const theme = createTheme({
  palette: {
    primary: { main: "#ba55d3", dark: "#87409c", contrastText: "#fff" },
    secondary: { main: "#ee82ee", contrastText: "#fff" },
    text: { primary: "#262626", secondary: "#737373" },
    background: { default: "#fff", paper: "#fff" },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    button: { textTransform: "none", fontWeight: 600, fontSize: "0.8125rem" },
  },
  shape: { borderRadius: 0 },
  components: { MuiButton: { defaultProps: { disableElevation: true } } },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
