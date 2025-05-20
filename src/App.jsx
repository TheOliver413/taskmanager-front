"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { blue, pink } from "@mui/material/colors"
import Register from "./components/auth/Register"
import Login from "./components/auth/Login"
import Tasks from "./components/tasks/Tasks"
import TaskAssignment from "./components/tasks/TaskAssignment"
import TaskHistory from "./components/tasks/TaskHistory"
import MainLayout from "./components/layout/MainLayout"
import Logout from "./components/auth/Logout"

// Tema personalizado de Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: blue[600],
    },
    secondary: {
      main: pink[500],
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
})

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))

  // Verificar si el token existe en localStorage al cargar la aplicación
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  // Componente para envolver rutas protegidas con el layout principal
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" />
    }

    return <MainLayout token={token}>{children}</MainLayout>
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/register" element={token ? <Navigate to="/tasks" /> : <Register />} />
          <Route path="/login" element={token ? <Navigate to="/tasks" /> : <Login setToken={setToken} />} />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks token={token} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/task-assignment"
            element={
              <ProtectedRoute>
                <TaskAssignment token={token} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/task-history"
            element={
              <ProtectedRoute>
                <TaskHistory token={token} />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to={token ? "/tasks" : "/login"} />} />

          {/* Rutas adicionales para el menú */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>Dashboard</h1>
                  <p>Esta página está en construcción.</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>Perfil</h1>
                  <p>Esta página está en construcción.</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <h1>Configuración</h1>
                  <p>Esta página está en construcción.</p>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/logout"
            element={
              <Logout handleLogout={handleLogout} />
            }
          />
        </Routes>

      </Router>
    </ThemeProvider>
  )
}

export default App
