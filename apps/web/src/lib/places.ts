// Municípios disponíveis na demo. Coordenada = ponto de consulta do NASA POWER (~0,5°), não o talhão.
export interface Place {
  ibge: string;
  name: string;
  lat: number;
  lon: number;
}

export const PLACES: Place[] = [
  { ibge: "3170206", name: "Uberlândia (MG)", lat: -18.92, lon: -48.28 },
];
