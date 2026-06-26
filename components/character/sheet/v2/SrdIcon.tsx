'use client';

import { Icon } from '@iconify/react';
import { ensureGameIconsRegistered } from '@/lib/srd/iconRegistry';

ensureGameIconsRegistered();

interface Props {
  icon: string;
  size?: number;
  color?: string;
}

export default function SrdIcon({ icon, size = 16, color = 'var(--fg-2)' }: Props) {
  return <Icon icon={`game-icons:${icon}`} width={size} height={size} color={color} style={{ flexShrink: 0 }} />;
}
