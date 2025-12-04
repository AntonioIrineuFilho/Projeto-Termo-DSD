export interface IRoom {
  id: string;
  code: string;
  password?: string;
  players: { name: string }[];
  status: "Aguardando" | "Em andamento" | "Finalizada";
  type: "Privada" | "Publica";
}
