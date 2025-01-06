import React, { useState, useEffect } from "react";
import { Table, Button, Spin, message, Input } from "antd";
import axios from "axios";
import { ConfigProvider } from 'antd';
const Welcome = () => {
  const [queues, setQueues] = useState([]);
  const [filteredQueues, setFilteredQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Función para obtener las colas desde el backend
  const fetchQueues = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/queues");
      setQueues(response.data);
      setFilteredQueues(response.data); // Set the filtered queues to the same initial data
    } catch (error) {
      message.error("Error al obtener las colas");
    } finally {
      setLoading(false);
    }
  };

  // Función para bloquear un usuario
  const blockUser = async (userId) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/block_user", { user_id: userId });
      message.success("Usuario bloqueado exitosamente");
      fetchQueues(); // Refrescar las colas después de bloquear
    } catch (error) {
      message.error("Error al bloquear el usuario");
    } finally {
      setLoading(false);
    }
  };

  // Función para desbloquear un usuario
  const unblockUser = async (userId, comment) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/unblock_user", { user_id: userId, comment });
      message.success("Usuario desbloqueado exitosamente");
      fetchQueues(); // Refrescar las colas después de desbloquear
    } catch (error) {
      message.error("Error al desbloquear el usuario");
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar por nombre
  const handleSearch = (value) => {
    setSearchText(value);
    if (value) {
      const filtered = queues.filter((queue) =>
        queue.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredQueues(filtered);
    } else {
      setFilteredQueues(queues); // Si no hay texto en el campo de búsqueda, mostrar todas las colas
    }
  };

  // useEffect para obtener las colas cuando el componente se monte
  useEffect(() => {
    fetchQueues();
  }, []);

  // Configuración de columnas para la tabla
  const columns = [
    {
      title: "Usuario",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Ancho de banda",
      dataIndex: "max-limit",
      key: "max-limit",
      render: (text) => (
        <span style={{ color: text === "1000/1000" ? "red" : "inherit" }}>{text}</span>
      ),
      // Habilitar ordenación en la columna de ancho de banda
      sorter: (a, b) => {
        const limitA = a["max-limit"].split("/")[0].replace("k", "") * 1;
        const limitB = b["max-limit"].split("/")[0].replace("k", "") * 1;
        return limitA - limitB;
      },
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, queue) => (
        <>
          <Button
            type="primary"
            danger
            onClick={() => blockUser(queue[".id"])}
            disabled={queue["max-limit"] === "1k/1k"}
            style={{ marginRight: 8 }}
          >
            Bloquear
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: 'green', borderColor: 'green' }}
            onClick={() => unblockUser(queue[".id"], queue.comment)}
          >
            Desbloquear
          </Button>
        </>
      ),
    },
  ];

  return (
    <ConfigProvider locale={{ locale: 'es_ES' }}> {/* Aquí se establece el idioma en español */}
    <div>
      
      
      {/* Campo de búsqueda */}
      <Input
        placeholder="Buscar por nombre"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: 20, width: 300 }}
      />
      
      {loading ? (
        <Spin tip="Cargando..." />
      ) : (
        <Table
          dataSource={filteredQueues}
          columns={columns}
          rowKey={(queue) => queue[".id"]}
          pagination={{
            pageSize: 150, // Número de filas por página
            total: filteredQueues.length, // Total de elementos en la tabla
            showSizeChanger: false, // Deshabilitar cambio de tamaño de página
            pageSizeOptions: ['50'], // Solo permitir una opción de tamaño de página
            current: 1, // Página inicial
            showTotal: (total) => `Total ${total} usuarios`, // Mensaje total de elementos
          }}
          scroll={{ y: 800 }} // Si la tabla es demasiado grande, se puede ajustar para mostrar el scroll
        />
      )}
    </div>
  </ConfigProvider>
  );
};

export default Welcome;
