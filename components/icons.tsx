import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export function ScissorsIcon(props: IconProps) { return <svg {...base} {...props}><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="m8.6 8.5 11.4 7M8.6 15.5 20 8M14 12l6 4"/></svg> }
export function StoreIcon(props: IconProps) { return <svg {...base} {...props}><path d="M3 9h18l-2-5H5L3 9Z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></svg> }
export function PinIcon(props: IconProps) { return <svg {...base} {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg> }
export function CityIcon(props: IconProps) { return <svg {...base} {...props}><path d="M4 21V7l6-3v17M10 10l10-3v14M7 10h.01M7 14h.01M7 18h.01M14 11h.01M18 10h.01M14 15h.01M18 14h.01M14 19h.01M18 18h.01"/></svg> }
export function ClockIcon(props: IconProps) { return <svg {...base} {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> }
export function CalendarIcon(props: IconProps) { return <svg {...base} {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg> }
export function CameraIcon(props: IconProps) { return <svg {...base} {...props}><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4.5Z"/><circle cx="12" cy="13" r="4"/></svg> }
export function MailIcon(props: IconProps) { return <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg> }
export function SearchIcon(props: IconProps) { return <svg {...base} {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg> }
