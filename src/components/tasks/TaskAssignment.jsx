"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Snackbar,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material"
import MuiAlert from "@mui/material/Alert"
import {
    AssignmentInd as AssignmentIndIcon,
    Group as GroupIcon,
    PersonAdd as PersonAddIcon,
    Search as SearchIcon,
    Send as SendIcon,
} from "@mui/icons-material"

// Componente Alert personalizado
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

// Componente principal de asignación de tareas
const TaskAssignment = ({ token }) => {
    // Estados
    const [tasks, setTasks] = useState([])
    const [users, setUsers] = useState([])
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTaskTerm, setSearchTaskTerm] = useState("")
    const [searchUserTerm, setSearchUserTerm] = useState("")
    const [openAssignDialog, setOpenAssignDialog] = useState(false)
    const [tabValue, setTabValue] = useState(0)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    })

    // Obtener tareas
    const fetchTasks = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/tasks", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setTasks(res.data)
        } catch (err) {
            showSnackbar("Error al cargar las tareas", "error")
        }
    }

    // Obtener usuarios
    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setUsers(res.data)
        } catch (err) {
            showSnackbar("Error al cargar los usuarios", "error")
        }
    }

    // Efecto para cargar datos iniciales
    useEffect(() => {
        fetchTasks()
        fetchUsers()
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

    // Cambiar pestaña
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    // Abrir diálogo de asignación
    const openAssignmentDialog = (task) => {
        setSelectedTask(task)
        // Preseleccionar usuarios ya asignados a esta tarea
        if (task.assignedUsers && Array.isArray(task.assignedUsers)) {
            setSelectedUsers(task.assignedUsers.map((user) => user.id))
        } else {
            setSelectedUsers([])
        }
        setOpenAssignDialog(true)
    }

    // Manejar selección de usuario
    const handleUserSelection = (userId) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
    }

    // Asignar tarea a usuarios
    const assignTaskToUsers = async () => {
        if (!selectedTask || selectedUsers.length === 0) return;

        setLoading(true);

        try {
            await axios.post(
                `http://127.0.0.1:8000/api/tasks/${selectedTask.id}/assign`,
                { user_ids: selectedUsers }, // Enviar lista de usuarios
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchTasks();
            setOpenAssignDialog(false);
            showSnackbar("Usuarios asignados con éxito");
        } catch (err) {
            console.error("Error al asignar usuarios:", err);
            showSnackbar("Error al asignar usuarios", "error");
        } finally {
            setLoading(false);
        }
    };

    const formattedTasks = tasks.map((task) => ({
        ...task,
        assignedToMe: Boolean(task.assignedtome),  // Asegurar que es booleano
        createdByMe: Boolean(task.createdbyme),  // Asegurar que es booleano
        assignedUsers: typeof task.assignedusers === "string"
            ? JSON.parse(task.assignedusers)
            : task.assignedusers,
    }));

    // Filtrar tareas según la pestaña y búsqueda
    const getFilteredTasks = () => {
        const searchTerm = searchTaskTerm.trim().toLowerCase();

        const filtered = searchTerm
            ? formattedTasks.filter((task) => task.title.toLowerCase().includes(searchTerm))
            : formattedTasks;

        switch (tabValue) {
            case 1: // Asignadas a mí
                return filtered.filter((task) => task.assignedToMe);
            case 2: // Creadas por mí
                return filtered.filter((task) => task.createdByMe);
            default: // Todas
                return filtered;
        }
    };


    // Filtrar usuarios según búsqueda
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchUserTerm.toLowerCase()))

    const filteredTasks = getFilteredTasks()

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Cabecera */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    Asignación de Tareas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Asigna tareas a los miembros de tu equipo
                </Typography>
            </Box>

            {/* Contenido principal */}
            <Grid container spacing={3}>
                {/* Lista de tareas */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <Box sx={{ p: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <AssignmentIndIcon /> Tareas disponibles
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                            <TextField
                                fullWidth
                                placeholder="Buscar tareas..."
                                variant="outlined"
                                size="small"
                                value={searchTaskTerm}
                                onChange={(e) => setSearchTaskTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="task tabs" sx={{ px: 2 }}>
                            <Tab label="Todas" sx={{ textTransform: "none" }} />
                            <Tab label="Asignadas a mí" sx={{ textTransform: "none" }} />
                            <Tab label="Creadas por mí" sx={{ textTransform: "none" }} />
                        </Tabs>

                        <List sx={{ maxHeight: "60vh", overflow: "auto", p: 0 }}>
                            {filteredTasks.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: "center" }}>
                                    <Typography color="text.secondary">No hay tareas disponibles</Typography>
                                </Box>
                            ) : (
                                filteredTasks.map((task) => (
                                    <React.Fragment key={task.id}>
                                        <ListItem
                                            secondaryAction={
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<PersonAddIcon />}
                                                    onClick={() => openAssignmentDialog(task)}
                                                >
                                                    Asignar
                                                </Button>
                                            }
                                            sx={{ pr: 16 }}
                                        >
                                            <ListItemIcon>
                                                <Checkbox edge="start" checked={task.status === "Completada"} tabIndex={-1} disableRipple />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                                        {task.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                        {Array.isArray(task.assignedUsers) && task.assignedUsers.length > 0 ? (
                                                            task.assignedUsers.map((user) => (
                                                                <Chip
                                                                    key={`${task.id}-${user.id}`}
                                                                    size="small"
                                                                    avatar={<Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>}
                                                                    label={user.name}
                                                                    variant="outlined"
                                                                />
                                                            ))
                                                        ) : (
                                                            <Chip size="small" label="Sin asignar" variant="outlined" color="warning" />
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>

                {/* Lista de usuarios */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <Box sx={{ p: 2, bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <GroupIcon /> Miembros del equipo
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                            <TextField
                                fullWidth
                                placeholder="Buscar usuarios..."
                                variant="outlined"
                                size="small"
                                value={searchUserTerm}
                                onChange={(e) => setSearchUserTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <List sx={{ maxHeight: "60vh", overflow: "auto", p: 0 }}>
                            {filteredUsers.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: "center" }}>
                                    <Typography color="text.secondary">No hay usuarios disponibles</Typography>
                                </Box>
                            ) : (
                                filteredUsers.map((user) => (
                                    <React.Fragment key={user.id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: "primary.main" }}>{user.name.charAt(0).toUpperCase()}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={user.name}
                                                secondary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        {user.email}
                                                    </Typography>
                                                }
                                            />
                                            <Chip
                                                size="small"
                                                label={`${user.task_count || 0} tareas`}
                                                color={user.task_count > 0 ? "primary" : "default"}
                                                variant="outlined"
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Diálogo para asignar tarea */}
            <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Asignar tarea</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Selecciona los usuarios a los que deseas asignar la tarea{" "}
                        <strong>{selectedTask ? selectedTask.title : ""}</strong>.
                    </DialogContentText>

                    <TextField
                        fullWidth
                        placeholder="Buscar usuarios..."
                        variant="outlined"
                        size="small"
                        value={searchUserTerm}
                        onChange={(e) => setSearchUserTerm(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto", mb: 2 }}>
                        <List dense>
                            {filteredUsers.map((user) => (
                                <ListItemButton key={user.id} onClick={() => handleUserSelection(user.id)}>
                                    <ListItemIcon>
                                        <Checkbox edge="start" checked={selectedUsers.includes(user.id)} tabIndex={-1} disableRipple />
                                    </ListItemIcon>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: selectedUsers.includes(user.id) ? "primary.main" : "grey.400" }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={user.name}
                                        secondary={user.email}
                                        primaryTypographyProps={{
                                            fontWeight: selectedUsers.includes(user.id) ? 500 : 400,
                                        }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {selectedUsers.length} {selectedUsers.length === 1 ? "usuario seleccionado" : "usuarios seleccionados"}
                        </Typography>
                        {selectedUsers.length > 0 && (
                            <Button size="small" onClick={() => setSelectedUsers([])}>
                                Limpiar selección
                            </Button>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAssignDialog(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={assignTaskToUsers}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                        {loading ? "Asignando..." : "Asignar tarea"}
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
        </Container>
    )
}

export default TaskAssignment
