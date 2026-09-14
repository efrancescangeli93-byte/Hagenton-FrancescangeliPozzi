import { NavLink } from 'react-router-dom';

const voci = [
  { path: '/', label: 'Temi', icon: 'category' },
  { path: '/progressi', label: 'Progressi', icon: 'bar_chart' },
];

export default function Navigazione() {
  return (
    <nav className="nav" aria-label="Navigazione principale">
      {voci.map(v => (
        <NavLink
          key={v.path}
          to={v.path}
          end={v.path === '/'}
          className={({ isActive }) => 'nav-voce' + (isActive ? ' attiva' : '')}
        >
          <span className="material-symbols-outlined nav-icona" aria-hidden="true">{v.icon}</span>
          <span>{v.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
