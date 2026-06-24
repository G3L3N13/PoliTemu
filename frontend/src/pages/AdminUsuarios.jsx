import { useEffect, useState } from "react";
import { Trash2, Users } from "lucide-react";
import { adminService } from "../services/api";

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const data = await adminService.usuarios();
            setUsuarios(data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarUsuario = async (id) => {
        const confirmar = window.confirm(
            "¿Seguro que deseas eliminar este usuario?"
        );

        if (!confirmar) return;

        try {
            await adminService.eliminarUsuario(id);

            setUsuarios(
                usuarios.filter((usuario) => usuario.id !== id)
            );

            alert("Usuario eliminado correctamente");
        } catch (error) {
            console.error(error);
            alert("Error al eliminar usuario");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a1a] text-white flex items-center justify-center">
                Cargando usuarios...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white p-8">

            <div className="mb-10">
                <h1 className="text-4xl font-black flex items-center gap-3">
                    <Users className="text-blue-400" />
                    Gestión de Usuarios
                </h1>

                <p className="text-gray-400 mt-2">
                    Total registrados: {usuarios.length}
                </p>
            </div>

            <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-3xl">

                <table className="w-full">

                    <thead>
                        <tr className="border-b border-white/10 text-left">
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Correo</th>
                            <th className="p-4">Carrera</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>

                        {usuarios.map((usuario) => (
                            <tr
                                key={usuario.id}
                                className="border-b border-white/5 hover:bg-white/5"
                            >
                                <td className="p-4">
                                    {usuario.nombre || "Sin nombre"}
                                </td>

                                <td className="p-4">
                                    {usuario.email}
                                </td>

                                <td className="p-4">
                                    {usuario.carrera || "-"}
                                </td>

                                <td className="p-4">
                                    {usuario.role || usuario.rol || "usuario"}
                                </td>

                                <td className="p-4">

                                    <button
                                        onClick={() => eliminarUsuario(usuario.id)}
                                        className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-xl flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>

                                </td>
                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>
        </div>
    );
}

export default AdminUsuarios;