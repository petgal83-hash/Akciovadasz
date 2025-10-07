
import React from 'react';
import { Store } from './types';

export const STORES: { name: Store; logo: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  {
    name: Store.TESCO,
    logo: (props) => (
      <svg {...props} viewBox="0 0 100 40">
        <rect width="100" height="40" fill="#00539f"/>
        <text x="50" y="25" fill="white" textAnchor="middle" fontSize="20" fontWeight="bold">TESCO</text>
      </svg>
    ),
  },
  {
    name: Store.AUCHAN,
    logo: (props) => (
       <svg {...props} viewBox="0 0 100 40">
        <rect width="100" height="40" fill="#d71920"/>
        <text x="50" y="25" fill="white" textAnchor="middle" fontSize="20" fontWeight="bold">Auchan</text>
      </svg>
    ),
  },
  {
    name: Store.LIDL,
    logo: (props) => (
      <svg {...props} viewBox="0 0 100 40">
        <rect width="100" height="40" fill="#0050aa"/>
        <text x="50" y="25" fill="#ffed00" textAnchor="middle" fontSize="20" fontWeight="bold">LIDL</text>
      </svg>
    ),
  },
  {
    name: Store.ALDI,
    logo: (props) => (
       <svg {...props} viewBox="0 0 100 40">
        <rect width="100" height="40" fill="#004d91"/>
        <text x="50" y="25" fill="white" textAnchor="middle" fontSize="20" fontWeight="bold">ALDI</text>
      </svg>
    ),
  },
  {
    name: Store.SPAR,
    logo: (props) => (
      <svg {...props} viewBox="0 0 100 40">
        <rect width="100" height="40" fill="#00843d"/>
        <text x="50" y="25" fill="white" textAnchor="middle" fontSize="20" fontWeight="bold">SPAR</text>
      </svg>
    ),
  },
  {
    name: Store.PENNY,
    logo: (props) => (
       <svg {...props} viewBox="0 0 100 40">
        <rect width="100" height="40" fill="#d81f26"/>
        <text x="50" y="25" fill="#ffcd00" textAnchor="middle" fontSize="20" fontWeight="bold">PENNY</text>
      </svg>
    ),
  },
];
