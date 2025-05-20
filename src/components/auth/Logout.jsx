import { useEffect } from "react"
import { Navigate } from "react-router-dom"

const Logout = ({ handleLogout }) => {
  useEffect(() => {
    handleLogout()
  }, [])

  return <Navigate to="/login" />
}

export default Logout
