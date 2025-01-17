export enum InstanceState {
  NOT_EXIST = "NOT_EXIST",
  REGISTRING = "REGISTRING",
  NOT_REGISTERED = "NOT_REGISTERED",
  SUBMIT_REGISTER = "SUBMIT_REGISTER",
  OFFLINE = "OFFLINE",
  PREPARING = "PREPARING",
  RUNNING = "RUNNING",
}

export type Instance = {
  id: number;
  login_id: string | null;
  login_pw: string | null;
  resource_ip: string;
  state: InstanceState;
};

export type MacroData = {
  id: number;
  subscribe: boolean;
  tax: boolean;
  gatcha: boolean;
  gatcha_half: boolean;
  exploration: boolean;
  next_execute_time: Date | null;
};

export type User = {
  id: number;
  user_id: string;
  is_expired: boolean;
  expired_at: Date;
  instance: Instance | null;
  macro_data: MacroData | null;
};
