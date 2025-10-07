export interface NavbarProps {
  scrollY: number;
}

export interface HeroProps {
  scrollY: number;
}

export interface ImmersiveBreakProps {
  quote: string;
  author: string;
  backgroundType?: "iss" | "moon" | "mars";
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
