export interface HypnoticCommand {
  text: string;
  id: string;
}

export enum AppState {
  IDLE = 'IDLE',
  HYPNOTIZING = 'HYPNOTIZING',
}
