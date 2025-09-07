export interface WebSocketEmissionTarget {
  userId: number;
  event: string;
  data: any;
}

export interface MessageEmissionResultDto {
  message: any;
  emissions: WebSocketEmissionTarget[];
}

export interface ReadEmissionResultDto {
  emissions: WebSocketEmissionTarget[];
}
