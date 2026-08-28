export interface NotificationRule {
  id: string;
  title: string;
  trigger: string;
  channels: string[];
  assigned?: string[];
  status: boolean;
}



export interface EscalationRule {
  id: string;
  title: string;
  condition: string;  
  action: string[];   
  channels: string[];
  assigned: string[];
  status: boolean;
}