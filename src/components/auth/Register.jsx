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
import { Email, Lock, Person, Visibility, VisibilityOff, PersonAdd } from "@mui/icons-material"

const Register = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register", user)
      localStorage.setItem("token", res.data.access_token)
      navigate("/tasks")
    } catch (err) {
      setError("Error al registrarse. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setUser({
      ...user,
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
            Crea una cuenta para gestionar tus tareas
          </Typography>
        </Box>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" fontWeight="bold" textAlign="center" mb={1}>
              Crear cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
              Ingresa tus datos para registrarte
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, animation: "fadeIn 0.3s" }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="name"
                  variant="outlined"
                  value={user.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  variant="outlined"
                  value={user.email}
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
                  value={user.password}
                  onChange={handleChange}
                  required
                  helperText="La contraseña debe tener al menos 8 caracteres"
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

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                >
                  {loading ? "Registrando..." : "Crear cuenta"}
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
                ¿Ya tienes una cuenta?{" "}
                <Link
                  component="button"
                  variant="body2"
                  color="primary"
                  fontWeight="medium"
                  onClick={() => navigate("/login")}
                >
                  Inicia sesión
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Register
