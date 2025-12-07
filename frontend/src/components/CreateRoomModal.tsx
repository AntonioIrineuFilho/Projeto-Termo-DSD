import { useState } from "react";
import { Button, Form, Message, Modal, useToaster } from "rsuite";
import { usePlayerContext } from "../context/PlayerContext";

export default function CreateRoomModal() {
  const toaster = useToaster();
  const { createRoom } = usePlayerContext();

  const [open, setOpen] = useState(false);
  const [formValue, setFormValue] = useState({
    username: "",
    password: "",
  });

  const handleClose = () => {
    setFormValue({
      username: "",
      password: "",
    });
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await createRoom(formValue.username, formValue.password);
    } catch {
      handleClose();

      toaster.push(<Message type="error">Erro ao criar a sala</Message>, {
        placement: "topCenter",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <Button appearance="primary" onClick={handleOpen}>
        Criar Sala
      </Button>

      <Modal open={open} onClose={handleClose} size="xs">
        <Modal.Header>
          <Modal.Title>Criar Sala</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid onChange={setFormValue} formValue={formValue}>
            <Form.Group controlId="username">
              <Form.Label>Nome de usuário</Form.Label>
              <Form.Control name="username" type="text" />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Senha (opcional)</Form.Label>
              <Form.Control name="password" type="password" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} appearance="subtle">
            Cancelar
          </Button>

          <Button type="submit" onClick={handleSubmit} appearance="primary">
            Criar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
