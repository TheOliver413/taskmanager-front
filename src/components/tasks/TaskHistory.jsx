"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material"
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Update as UpdateIcon,
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers"
import { format, parseISO, isToday, isYesterday, isThisWeek } from "date-fns"
import { es } from "date-fns/locale"

// Componente para el estado de la tarea
const StatusChip = ({ status }) => {
  let color, icon, label

  switch (status?.toLowerCase()) {
    case "pendiente":
      color = "warning"
      icon = <RadioButtonUncheckedIcon fontSize="small" />
      label = "Pendiente"
      break
    case "en progreso":
      color = "info"
      icon = <AccessTimeIcon fontSize="small" />
      label = "En progreso"
      break
    case "completada":
      color = "success"
      icon = <CheckCircleOutlineIcon fontSize="small" />
      label = "Completada"
      break
    default:
      color = "default"
      icon = <RadioButtonUncheckedIcon fontSize="small" />
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

// Componente para formatear fechas
const FormattedDate = ({ date }) => {
  if (!date) return null

  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date

    if (isToday(parsedDate)) {
      return (
        <Typography variant="body2" color="text.secondary">
          Hoy, {format(parsedDate, "HH:mm")}
        </Typography>
      )
    } else if (isYesterday(parsedDate)) {
      return (
        <Typography variant="body2" color="text.secondary">
          Ayer, {format(parsedDate, "HH:mm")}
        </Typography>
      )
    } else if (isThisWeek(parsedDate)) {
      return (
        <Typography variant="body2" color="text.secondary">
          {format(parsedDate, "EEEE", { locale: es })}, {format(parsedDate, "HH:mm")}
        </Typography>
      )
    } else {
      return (
        <Typography variant="body2" color="text.secondary">
          {format(parsedDate, "dd/MM/yyyy, HH:mm")}
        </Typography>
      )
    }
  } catch (error) {
    console.error("Error formatting date:", error)
    return (
      <Typography variant="body2" color="text.secondary">
        Fecha inválida
      </Typography>
    )
  }
}

// Componente personalizado para un elemento de la línea de tiempo
const TimelineItem = ({ item, isLast }) => {
  // Obtener color del icono según el tipo de acción
  const getIconColor = (action) => {
    switch (action?.toLowerCase()) {
      case "creada":
        return "success.main"
      case "actualizada":
        return "primary.main"
      case "eliminada":
        return "error.main"
      case "asignada":
        return "info.main"
      case "completada":
        return "success.main"
      default:
        return "grey.500"
    }
  }

  // Renderizar icono según el tipo de acción
  const renderActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case "creada":
        return <AddIcon />
      case "actualizada":
        return <EditIcon />
      case "eliminada":
        return <DeleteIcon />
      case "asignada":
        return <PersonIcon />
      case "completada":
        return <CheckCircleIcon />
      default:
        return <UpdateIcon />
    }
  }

  return (
    <Box sx={{ display: "flex", mb: isLast ? 0 : 3 }}>
      {/* Columna izquierda (fecha) */}
      <Box sx={{ width: 120, flexShrink: 0, pt: 1 }}>
        <FormattedDate date={item.timestamp} />
      </Box>

      {/* Línea vertical y punto */}
      <Box sx={{ position: "relative", mr: 3 }}>
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: 2,
            height: isLast ? 24 : "calc(100% + 24px)",
            bgcolor: "grey.300",
            zIndex: 1,
          }}
        />
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: getIconColor(item.action),
            position: "relative",
            zIndex: 2,
          }}
        >
          {renderActionIcon(item.action)}
        </Avatar>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1 }}>
        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: "primary.main" }}>
              {item.user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight={500}>
              {item.user.name}
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={500}>
            Tarea {item.action}
            {item.task && `: "${item.task.title}"`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {item.details}
          </Typography>
          {item.task && item.task.status && (
            <Box sx={{ mt: 2 }}>
              <StatusChip status={item.task.status} />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

// Componente para agrupar eventos por tarea
const TaskTimelineGroup = ({ taskId, taskEvents }) => {
  // Obtener información de la tarea del primer evento
  const taskInfo = taskEvents[0].task

  return (
    <Card sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssignmentIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{taskInfo ? taskInfo.title : `Tarea #${taskId}`}</Typography>
          </Box>
          {taskInfo && taskInfo.status && <StatusChip status={taskInfo.status} />}
        </Box>
        {taskInfo && taskInfo.description && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            {taskInfo.description}
          </Typography>
        )}
      </Box>
      <CardContent sx={{ p: 3 }}>
        {taskEvents.map((event, index) => (
          <TimelineItem key={event.id} item={event} isLast={index === taskEvents.length - 1} />
        ))}
      </CardContent>
    </Card>
  )
}

// Componente principal de historial de tareas
const TaskHistory = ({ token }) => {
  // Estados
  const [taskHistory, setTaskHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterUser, setFilterUser] = useState("all")
  const [filterDateFrom, setFilterDateFrom] = useState(null)
  const [filterDateTo, setFilterDateTo] = useState(null)
  const [users, setUsers] = useState([])

  // Obtener historial de tareas
  const fetchTaskHistory = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/task-history", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Asegurarse de que los objetos user y task estén parseados si son strings
      const formattedData = res.data.map((item) => ({
        ...item,
        user: typeof item.user === "string" ? JSON.parse(item.user) : item.user,
        task: typeof item.task === "string" ? JSON.parse(item.task) : item.task,
      }))

      setTaskHistory(formattedData)

      // Extraer usuarios únicos del historial
      const uniqueUsers = [...new Set(formattedData.map((item) => item.user.id))].map((userId) => {
        const user = formattedData.find((item) => item.user.id === userId).user
        return { id: user.id, name: user.name, email: user.email }
      })

      setUsers(uniqueUsers)
      setLoading(false)
    } catch (err) {
      console.error("Error al cargar el historial de tareas:", err)
      setLoading(false)
    }
  }

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchTaskHistory()
  }, [token])

  // Filtrar historial de tareas
  const getFilteredHistory = () => {
    return taskHistory.filter((item) => {
      // Filtro por término de búsqueda
      const matchesSearch =
        (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.user && item.user.name && item.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.task && item.task.title && item.task.title.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filtro por tipo de acción
      const matchesType =
        filterType === "all" || (item.action && item.action.toLowerCase() === filterType.toLowerCase())

      // Filtro por usuario
      const matchesUser = filterUser === "all" || (item.user && item.user.id.toString() === filterUser)

      // Filtro por fecha desde
      const matchesDateFrom = !filterDateFrom || new Date(item.timestamp) >= filterDateFrom

      // Filtro por fecha hasta
      const matchesDateTo = !filterDateTo || new Date(item.timestamp) <= filterDateTo

      return matchesSearch && matchesType && matchesUser && matchesDateFrom && matchesDateTo
    })
  }

  // Agrupar eventos por tarea
  const groupEventsByTask = (events) => {
    const grouped = {}

    events.forEach((event) => {
      if (!grouped[event.task_id]) {
        grouped[event.task_id] = []
      }
      grouped[event.task_id].push(event)
    })

    // Ordenar eventos dentro de cada grupo por fecha (más recientes primero)
    Object.keys(grouped).forEach((taskId) => {
      grouped[taskId].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })

    return grouped
  }

  const filteredHistory = getFilteredHistory()
  const groupedEvents = groupEventsByTask(filteredHistory)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ minHeight: "100vh", padding: 3 }}>
        <Container maxWidth="xl">
          {/* Cabecera */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Historial de Tareas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Revisa el historial completo de actividades en las tareas
            </Typography>
          </Box>

          {/* Filtros */}
          <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Buscar en el historial..."
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
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filter-type-label">Tipo de acción</InputLabel>
                  <Select
                    labelId="filter-type-label"
                    value={filterType}
                    label="Tipo de acción"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="creada">Creación</MenuItem>
                    <MenuItem value="actualizada">Actualización</MenuItem>
                    <MenuItem value="eliminada">Eliminación</MenuItem>
                    <MenuItem value="asignada">Asignación</MenuItem>
                    <MenuItem value="completada">Completada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filter-user-label">Usuario</InputLabel>
                  <Select
                    labelId="filter-user-label"
                    value={filterUser}
                    label="Usuario"
                    onChange={(e) => setFilterUser(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Desde"
                  value={filterDateFrom}
                  onChange={setFilterDateFrom}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Hasta"
                  value={filterDateTo}
                  onChange={setFilterDateTo}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType("all")
                    setFilterUser("all")
                    setFilterDateFrom(null)
                    setFilterDateTo(null)
                  }}
                >
                  Limpiar
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Contenido principal */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : Object.keys(groupedEvents).length === 0 ? (
            <Paper elevation={1} sx={{ p: 6, borderRadius: 2, textAlign: "center" }}>
              <HistoryIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No hay registros de actividad
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No se encontraron registros que coincidan con los filtros seleccionados
              </Typography>
            </Paper>
          ) : (
            // Mostrar tareas agrupadas
            Object.keys(groupedEvents).map((taskId) => (
              <TaskTimelineGroup key={taskId} taskId={taskId} taskEvents={groupedEvents[taskId]} />
            ))
          )}
        </Container>
      </Box>
    </LocalizationProvider>
  )
}

export default TaskHistory
