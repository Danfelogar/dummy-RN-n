import { ReactNode } from 'react';

export interface ElementForContext {
  name: string;
  component: ReactNode;
}

export interface PortalProps {
  children: ReactNode;
  name: string;
}
