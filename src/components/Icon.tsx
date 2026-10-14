const paths: Record<string, React.ReactNode> = {
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
    </>
  ),
  telegram: <path d="m21.5 4.5-3.2 15.2c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.1 13.4 1.4 12c-1-.3-1-1 .2-1.5L20.2 3.4c.9-.3 1.6.2 1.3 1.1z" />,
  whatsapp: (
    <>
      <path d="M3.5 20.5l1.3-4.3A8.6 8.6 0 1 1 8 19.4z" />
      <path d="M9 8.6c.2-.5.6-.6 1-.6.2 0 .5.6.8 1.3.1.3 0 .5-.2.8l-.4.4c.4.9 1.4 1.9 2.4 2.4l.5-.5c.2-.2.5-.3.8-.2.6.3 1.2.6 1.2.8 0 .5-.2 1-.7 1.3-.6.3-1.6.2-3-.5a7 7 0 0 1-2.9-3c-.5-1-.7-1.8-.5-2.2z" />
    </>
  ),
  vk: <path d="M3 7h3.2c.2 0 .4.1.5.3.8 2.2 1.9 4 3 4.5V7.6c0-.3.2-.6.6-.6h2.5c.3 0 .5.2.5.5v3.3c1 0 2.5-2 3.2-3.5.1-.2.3-.3.5-.3H20c.4 0 .6.3.5.7-.5 1.5-2.4 3.8-2.4 3.8 1.2 1.1 2.4 2.5 2.9 3.6.2.4-.1.9-.5.9h-3c-.2 0-.4-.1-.5-.3-.7-1-1.6-2-2.5-2.2V16c0 .3-.2.5-.5.5h-1.3C8 16.5 4.6 13 3 7.6c-.1-.3.1-.6.4-.6z" />,
  bag: (
    <>
      <path d="M5 7h14l-1 14H6z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </>
  ),
  menu: <path d="M3 7h18M3 12h18M3 17h18" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  chat: <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.4A8.5 8.5 0 1 1 21 12z" />,
  play: <path d="M7 4.5v15l13-7.5z" />,
  sound: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </>
  ),
  mute: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="m22 9-6 6M16 9l6 6" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8h4l2-3h6l2 3h4v12H3z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  leaf: <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14zm0 0 7-7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  check: <path d="m5 12 5 5 9-10" />,
  send: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />,
  truck: (
    <>
      <path d="M2 6h12v10H2zM14 9h4l3 3v4h-7" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </>
  ),
}

export function Icon({ name, className = 'ico', title }: { name: keyof typeof paths | string; className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  )
}
