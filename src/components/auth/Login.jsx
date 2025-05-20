"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from "@mui/icons-material"

const Login = ({ setToken }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", credentials)
      localStorage.setItem("token", res.data.access_token)
      setToken(res.data.access_token)
      navigate("/tasks")
    } catch (err) {
      setError("Credenciales incorrectas. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to right bottom, #f0f4f8, #d9e2ec)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            TaskManager
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Gestiona tus tareas de manera eficiente
          </Typography>
        </Box>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" fontWeight="bold" textAlign="center" mb={1}>
              Iniciar sesión
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
              Ingresa tus credenciales para acceder a tu cuenta
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, animation: "fadeIn 0.3s" }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  variant="outlined"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box textAlign="right">
                  <Link href="#" underline="hover" variant="body2" color="primary">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                O
              </Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                ¿No tienes una cuenta?{" "}
                <Link
                  component="button"
                  variant="body2"
                  color="primary"
                  fontWeight="medium"
                  onClick={() => navigate("/register")}
                >
                  Regístrate
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Login
