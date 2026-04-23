import { FC, Fragment, ReactNode, useState } from 'react';
import { PortalContext } from './Portal';

interface PortalProviderProps {
  children: ReactNode;
}

interface Element {
  name: string;
  component: ReactNode;
}

export const PortalProvider: FC<PortalProviderProps> = ({ children }) => {
  const [components, setComponents] = useState<Record<string, ReactNode>>({});

  const addComponent = ({ name, component }: Element) => {
    setComponents(prevComponents => ({
      ...prevComponents,
      [name]: component,
    }));
  };

  const removeComponent = (name: string) => {
    setComponents(prevComponents => {
      const newComponents = { ...prevComponents };
      delete newComponents[name];
      return newComponents;
    });
  };

  return (
    <PortalContext.Provider value={{ addComponent, removeComponent }}>
      <Fragment>{children}</Fragment>
      <Fragment>
        {Object.entries(components).map(([name, Component]) => (
          <Fragment key={name}>{Component}</Fragment>
        ))}
      </Fragment>
    </PortalContext.Provider>
  );
};
