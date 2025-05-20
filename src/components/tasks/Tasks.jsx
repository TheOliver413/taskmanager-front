"use client"

import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Pusher from "pusher-js"
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  Search as SearchIcon,
  Task as TaskIcon,
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Notifications as NotificationsIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material"

// Componente Alert personalizado
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

// Componente para el estado de la tarea
const StatusChip = ({ status }) => {
  let color, icon, label

  switch (status?.toLowerCase()) {
    case "pendiente":
      color = "warning"
      icon = <RadioButtonUncheckedIcon />
      label = "Pendiente"
      break
    case "en progreso":
      color = "info"
      icon = <AccessTimeIcon />
      label = "En progreso"
      break
    case "completada":
      color = "success"
      icon = <CheckCircleOutlineIcon />
      label = "Completada"
      break
    case "eliminada":
      color = "error"
      icon = <ArchiveIcon />
      label = "Eliminada"
      break
    default:
      color = "default"
      icon = <RadioButtonUncheckedIcon />
      label = status || "Desconocido"
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 500, borderWidth: 1.5 }}
    />
  )
}

// Componente principal de tareas
const Tasks = ({ token }) => {
  // Estados
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: "", description: "" })
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [tabValue, setTabValue] = useState(0)
  const [openNewDialog, setOpenNewDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  // Referencia para Echo
  const echoRef = useRef(null)

  // Obtener tareas
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(res.data)
    } catch (err) {
      console.log("Error al cargar las tareas", err)
      showSnackbar("Error al cargar las tareas", "error")
    }
  }

  // Obtener perfil de usuario
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Usuario autenticado:", res.data)
    } catch (err) {
      console.error("Error al cargar el perfil de usuario", err)
    }
  }

  // Configurar Echo para notificaciones en tiempo real
  const setupEcho = () => {
    // Asegurarse de que Pusher esté disponible
    window.Pusher = Pusher

    // Configurar Echo
    echoRef.current = new Echo({
      broadcaster: "pusher",
      key: "tu_app_key",
      cluster: "mt1",
      forceTLS: true,
    })

    // Escuchar eventos de tareas
    echoRef.current
      .channel("tasks-channel")
      .listen("TaskCreatedEvent", handleTaskCreated)
      .listen("TaskUpdatedEvent", handleTaskUpdated)
      .listen("TaskDeletedEvent", handleTaskDeleted)
  }

  // Manejadores de eventos en tiempo real
  const handleTaskCreated = (event) => {
    console.log("Nueva tarea creada:", event.task)

    // Añadir la nueva tarea a la lista
    setTasks((prevTasks) => [...prevTasks, event.task])

    // Añadir notificación
    addNotification({
      message: `Nueva tarea creada: "${event.task.title}"`,
      severity: "success",
      timestamp: new Date(),
    })
  }

  const handleTaskUpdated = (event) => {
    console.log("Tarea actualizada:", event.task)

    // Actualizar la tarea en la lista
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === event.task.id ? event.task : task)))

    // Añadir notificación
    addNotification({
      message: `Tarea actualizada: "${event.task.title}"`,
      severity: "info",
      timestamp: new Date(),
    })
  }

  const handleTaskDeleted = (event) => {
    console.log("Tarea eliminada:", event.task)

    // Actualizar la tarea en la lista (marcarla como eliminada)
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === event.task.id ? { ...task, status: "Eliminada" } : task)),
    )

    // Añadir notificación
    addNotification({
      message: `Tarea eliminada: "${event.task.title}"`,
      severity: "warning",
      timestamp: new Date(),
    })
  }

  // Añadir notificación
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 10)) // Mantener solo las 10 más recientes

    // Mostrar snackbar para notificaciones en tiempo real
    showSnackbar(notification.message, notification.severity)
  }

  // Efecto para cargar datos iniciales y configurar Echo
  useEffect(() => {
    fetchTasks()
    fetchUserProfile()
    setupEcho()

    // Limpiar al desmontar
    return () => {
      if (echoRef.current) {
        echoRef.current.leaveChannel("tasks-channel")
      }
    }
  }, [token])

  // Mostrar snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  // Cerrar snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  // Crear tarea
  const createTask = async () => {
    setLoading(true)

    try {
      await axios.post("http://127.0.0.1:8000/api/tasks", newTask, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNewTask({ title: "", description: "" })
      fetchTasks()
      setOpenNewDialog(false)
      showSnackbar("Tarea creada con éxito")
    } catch (err) {
      showSnackbar("Error al crear la tarea", "error")
    } finally {
      setLoading(false)
    }
  }

  // Actualizar tarea
  const updateTask = async () => {
    if (!editingTask) return

    setLoading(true)

    try {
      await axios.put(`http://127.0.0.1:8000/api/tasks/${editingTask.id}`, editingTask, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchTasks()
      setOpenEditDialog(false)
      showSnackbar("Tarea actualizada con éxito")
    } catch (err) {
      showSnackbar("Error al actualizar la tarea", "error")
    } finally {
      setLoading(false)
    }
  }

  // Confirmar eliminación de tarea
  const confirmDeleteTask = (task) => {
    setTaskToDelete(task)
    setOpenDeleteDialog(true)
  }

  // Desactivar tarea en lugar de eliminarla
  const deleteTask = async () => {
    if (!taskToDelete) return

    try {
      // En lugar de eliminar, actualizamos el estado a "Eliminada"
      await axios.put(
        `http://127.0.0.1:8000/api/tasks/${taskToDelete.id}/soft-delete`,
        { status: "Eliminada" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Actualizar la tarea localmente
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskToDelete.id ? { ...task, status: "Eliminada" } : task)),
      )

      setOpenDeleteDialog(false)
      showSnackbar("Tarea desactivada con éxito")
    } catch (err) {
      // Si el endpoint de soft-delete no existe, intentar con el método tradicional
      try {
        await axios.delete(`http://127.0.0.1:8000/api/tasks/${taskToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchTasks()
        setOpenDeleteDialog(false)
        showSnackbar("Tarea eliminada con éxito")
      } catch (deleteErr) {
        showSnackbar("Error al eliminar la tarea", "error")
      }
    }
  }

  // Cambiar pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Filtrar tareas según la pestaña y búsqueda
  const getFilteredTasks = () => {
    const filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    switch (tabValue) {
      case 1: // Pendientes
        return filtered.filter((t) => t.status.toLowerCase() !== "completada" && t.status.toLowerCase() !== "eliminada")
      case 2: // Completadas
        return filtered.filter((t) => t.status.toLowerCase() === "completada")
      case 3: // Eliminadas
        return filtered.filter((t) => t.status.toLowerCase() === "eliminada")
      default: // Todas (excepto eliminadas)
        return filtered.filter((t) => t.status.toLowerCase() !== "eliminada")
    }
  }

  const filteredTasks = getFilteredTasks()

  // Renderizar lista de tareas
  const renderTaskList = () => {
    if (filteredTasks.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 2,
            textAlign: "center",
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <TaskIcon sx={{ fontSize: 60, color: "primary.main", opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No hay tareas disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            {tabValue === 0
              ? "Crea una nueva tarea para comenzar a organizar tus actividades."
              : tabValue === 1
                ? "No tienes tareas pendientes en este momento."
                : tabValue === 2
                  ? "No tienes tareas completadas en este momento."
                  : "No tienes tareas eliminadas en este momento."}
          </Typography>
          {tabValue !== 3 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNewDialog(true)} sx={{ mt: 2 }}>
              Nueva Tarea
            </Button>
          )}
        </Box>
      )
    }

    return (
      <Grid container spacing={2}>
        {filteredTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                opacity: task.status.toLowerCase() === "eliminada" ? 0.7 : 1,
                "&:hover": {
                  transform: task.status.toLowerCase() !== "eliminada" ? "translateY(-4px)" : "none",
                  boxShadow: task.status.toLowerCase() !== "eliminada" ? 4 : 1,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography
                    variant="h6"
                    component="h3"
                    noWrap
                    sx={{
                      mb: 1,
                      maxWidth: "70%",
                      textDecoration: task.status.toLowerCase() === "eliminada" ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </Typography>
                  <StatusChip status={task.status} />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    minHeight: 40,
                    textDecoration: task.status.toLowerCase() === "eliminada" ? "line-through" : "none",
                  }}
                >
                  {task.description || "Sin descripción"}
                </Typography>
                <Box display="flex" alignItems="center" mt={2}>
                  <EventIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
              <Divider />
              <CardActions>
                {task.status.toLowerCase() !== "eliminada" ? (
                  <>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setEditingTask(task)
                        setOpenEditDialog(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => confirmDeleteTask(task)}
                    >
                      Eliminar
                    </Button>
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Esta tarea ha sido eliminada
                  </Typography>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", padding: 3 }}>
      <Container maxWidth="xl">
        {/* Cabecera */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Mis Tareas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona y organiza tus tareas diarias
            </Typography>
          </Box>

          {/* Icono de notificaciones */}
          <Box>
            <IconButton
              color="primary"
              onClick={() => setShowNotifications(!showNotifications)}
              sx={{ position: "relative" }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Panel de notificaciones */}
            {showNotifications && notifications.length > 0 && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  right: 20,
                  width: 300,
                  maxHeight: 400,
                  overflowY: "auto",
                  zIndex: 1000,
                  mt: 1,
                }}
              >
                <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Notificaciones
                  </Typography>
                </Box>
                <List>
                  {notifications.map((notification, index) => (
                    <ListItem key={index} divider={index < notifications.length - 1}>
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Barra de búsqueda y acciones */}
        <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: "background.paper" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar tareas..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }} gap={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenNewDialog(true)}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Nueva Tarea
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Pestañas */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="task tabs">
            <Tab label="Todas" icon={<TaskIcon />} iconPosition="start" sx={{ minWidth: 100, textTransform: "none" }} />
            <Tab
              label="Pendientes"
              icon={<AccessTimeIcon />}
              iconPosition="start"
              sx={{ minWidth: 100, textTransform: "none" }}
            />
            <Tab
              label="Completadas"
              icon={<CheckCircleIcon />}
              iconPosition="start"
              sx={{ minWidth: 100, textTransform: "none" }}
            />
            <Tab
              label="Eliminadas"
              icon={<ArchiveIcon />}
              iconPosition="start"
              sx={{ minWidth: 100, textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {/* Lista de tareas */}
        {renderTaskList()}
      </Container>

      {/* Diálogo para crear nueva tarea */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Crear nueva tarea</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>Completa los campos para crear una nueva tarea.</DialogContentText>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Título"
              fullWidth
              variant="outlined"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenNewDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={createTask}
            disabled={loading || !newTask.title}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Creando..." : "Crear tarea"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar tarea */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar tarea</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>Modifica los campos para actualizar la tarea.</DialogContentText>
          {editingTask && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                autoFocus
                label="Título"
                fullWidth
                variant="outlined"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                required
              />
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel id="status-label">Estado</InputLabel>
                <Select
                  labelId="status-label"
                  value={editingTask.status}
                  label="Estado"
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En progreso">En progreso</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={updateTask}
            disabled={loading || !editingTask?.title}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Actualizando..." : "Actualizar tarea"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar desactivación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas desactivar la tarea "{taskToDelete?.title}"? La tarea se marcará como eliminada
            pero no se borrará permanentemente.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={deleteTask}>
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// Definición de Echo para evitar errores
class Echo {
  constructor(options) {
    this.options = options
    this.channels = {}
  }

  channel(name) {
    if (!this.channels[name]) {
      this.channels[name] = {
        listeners: {},
        listen: function (event, callback) {
          this.listeners[event] = callback
          return this
        },
      }
    }
    return this.channels[name]
  }

  leaveChannel(name) {
    delete this.channels[name]
  }
}

export default Tasks
