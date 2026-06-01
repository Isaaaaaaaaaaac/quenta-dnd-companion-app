'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavItem { path: string; label: string; icon: string; gold?: boolean; }

interface Props {
  isDm: boolean;
  isSuperAdmin: boolean;
  initials: string;
  userName: string;
  userRole: string;
  signOutSlot: React.ReactNode;
}

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Super Admin',
  dm:         'Dungeon Master',
  player:     'Giocatore',
};

export default function MobileNavDrawer({
  isDm, isSuperAdmin, initials, userName, userRole, signOutSlot,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  const navItems: NavItem[] = [
    ...(isDm
      ? [
          { path: '/campaigns',  label: 'Campagne',    icon: '🏕' },
          { path: '/characters', label: 'Personaggi',  icon: '⚔' },
        ]
      : [
          { path: '/my-characters', label: 'I miei personaggi', icon: '⚔' },
        ]
    ),
    ...(isSuperAdmin ? [{ path: '/admin', label: 'Admin', icon: '⚙', gold: true }] : []),
  ];

  return (
    <>
      {/* ── Hamburger button ─────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--gold)', fontSize: 22, lineHeight: 1,
          padding: '0 4px', display: 'flex', alignItems: 'center',
        }}
      >
        ☰
      </button>

      {/* ── Overlay ──────────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.5)',
          zIndex: 499,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity .25s',
        }}
      />

      {/* ── Drawer ───────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100dvh',
        width: 280,
        background: 'var(--bg-deep)',
        borderRight: '1px solid var(--border-leather-dim)',
        zIndex: 500,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
        boxShadow: open ? '4px 0 24px rgba(0,0,0,.45)' : 'none',
      }}>

        {/* Top row: Logo + chiudi */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 var(--s-3)', height: 48, flexShrink: 0,
          borderBottom: '1px solid var(--border-leather-dim)',
        }}>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700,
            letterSpacing: '.12em', color: 'var(--gold)',
          }}>
            QUENTA
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Chiudi menu"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--fg-2)', fontSize: 18, lineHeight: 1,
              padding: 4, display: 'flex', alignItems: 'center',
              borderRadius: 'var(--r-sm)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Nav list */}
        <nav style={{ flex: 1, padding: 'var(--s-1) 0', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--s-2)',
                  padding: 'var(--s-2) var(--s-3)',
                  textDecoration: 'none',
                  color: active
                    ? 'var(--gold)'
                    : item.gold
                    ? 'var(--gold)'
                    : 'var(--fg-1)',
                  background: active ? 'var(--gold-soft)' : 'none',
                  borderLeft: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '.02em',
                  transition: 'all .18s',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = 'var(--gold-soft)';
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = 'none';
                }}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Bottom: profilo + logout */}
        <div style={{
          padding: 'var(--s-2) var(--s-3)',
          borderTop: '1px solid var(--border-leather)',
          flexShrink: 0,
        }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-sm)', flexShrink: 0,
              background: 'var(--gold)', color: 'var(--bg-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 700,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
                color: 'var(--fg-1)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {userName}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: '10px',
                color: 'var(--fg-2)', letterSpacing: '.04em', textTransform: 'uppercase',
              }}>
                {ROLE_LABEL[userRole] ?? 'Giocatore'}
              </div>
            </div>
          </div>

          {/* Sign out (server-rendered slot) */}
          {signOutSlot}
        </div>
      </div>
    </>
  );
}
