"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  Menu as MenuIcon,
  Task as TaskIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  AssignmentInd as AssignmentIndIcon,
} from "@mui/icons-material"

// Estilos para el contenido principal
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open, drawerWidth }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: `${drawerWidth}px`,
  }),
}))

const MainLayout = ({ children, token }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const drawerWidth = 240

  // Estados
  const [drawerOpen, setDrawerOpen] = useState(!isMobile)
  const [userName, setUserName] = useState("Usuario")

  // Obtener perfil de usuario
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.name) {
        setUserName(res.data.name);
      }
    } catch (err) {
      console.error("Error al cargar el perfil de usuario", err)
    }
  }

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchUserProfile()
  }, [token])

  // Efecto para ajustar el drawer en dispositivos móviles
  useEffect(() => {
    setDrawerOpen(!isMobile)
  }, [isMobile])

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem("token")
    navigate("/logout")
  }

  // Verificar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path
  }

  // Elementos del menú
  const menuItems = [
    {
      text: "Mis Tareas",
      icon: <TaskIcon color={isActive("/tasks") ? "primary" : "inherit"} />,
      path: "/tasks",
    },
    {
      text: "Asignación",
      icon: <AssignmentIndIcon color={isActive("/task-assignment") ? "primary" : "inherit"} />,
      path: "/task-assignment",
    },
    {
      text: "Historial",
      icon: <HistoryIcon color={isActive("/task-history") ? "primary" : "inherit"} />,
      path: "/task-history",
    },
    {
      text: "Dashboard",
      icon: <DashboardIcon color={isActive("/dashboard") ? "primary" : "inherit"} />,
      path: "/dashboard",
    },
  ]

  const secondaryMenuItems = [
    {
      text: "Perfil",
      icon: <PersonIcon color={isActive("/profile") ? "primary" : "inherit"} />,
      path: "/profile",
    },
    {
      text: "Configuración",
      icon: <SettingsIcon color={isActive("/settings") ? "primary" : "inherit"} />,
      path: "/settings",
    },
  ]

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TaskIcon sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap component="div">
              TaskManager
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Notificaciones">
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cerrar sesión">
              <IconButton color="inherit" onClick={logout}>
                <ExitToAppIcon />
              </IconButton>
            </Tooltip>
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", ml: 2 }}>
              <Avatar sx={{ bgcolor: "primary.dark", width: 32, height: 32 }}>
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="subtitle2" sx={{ ml: 1 }}>
                {userName}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            mt: "64px",
          },
        }}
      >
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setDrawerOpen(false)
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 2 }} />
          {secondaryMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setDrawerOpen(false)
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 2 }} />
          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Contenido principal */}
      <Main open={drawerOpen} drawerWidth={drawerWidth}>
        <Toolbar /> {/* Espaciado para el AppBar */}
        {children}
      </Main>
    </Box>
  )
}

export default MainLayout
