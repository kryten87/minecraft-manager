import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavButtonProps {
  labels: { when: string, label: string, path: string }[];
  style?: Record<string, string>;
};

export const NavButton: FC<NavButtonProps> = (props: NavButtonProps) => {
  const location = useLocation();
  const { label, path } = props.labels.find((lbl) => lbl.when === location.pathname) || {};
  if (label === undefined || path === undefined) {
    console.warn(`unable to find matching NavButton path for "${location.pathname}"`);
    return null;
  }
  return (
    <Link to={ path } role="button" style={ props.style || {} }>
      { label }
    </Link>
  );
};