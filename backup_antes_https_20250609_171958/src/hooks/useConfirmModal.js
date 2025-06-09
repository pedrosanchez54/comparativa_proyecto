import { useState } from 'react';

const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [loading, setLoading] = useState(false);

  const openConfirmModal = (config) => {
    setModalConfig({
      title: "Confirmar acción",
      message: "¿Estás seguro de que quieres continuar?",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
      type: "warning",
      ...config
    });
    setIsOpen(true);
  };

  const closeConfirmModal = () => {
    if (!loading) {
      setIsOpen(false);
      setModalConfig({});
      setLoading(false);
    }
  };

  const confirm = async (action) => {
    try {
      setLoading(true);
      await action();
      closeConfirmModal();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    isOpen,
    modalConfig,
    loading,
    openConfirmModal,
    closeConfirmModal,
    confirm
  };
};

export default useConfirmModal; 