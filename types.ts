export interface HypnoticCommand {
  text: string;
  id: string;
}

export enum AppState {
  IDLE = 'IDLE',
  HYPNOTIZING = 'HYPNOTIZING',
}

export type Language = 'en' | 'zh' | 'ja' | 'de' | 'es' | 'ar' | 'ko';

export interface Theme {
  id: string;
  backgroundGradient: string;
  circleColorOdd: string;
  circleColorEven: string;
  accentColor: string;
  buttonGradient: string;
  glowColor: string;
  textColor: string;
}
