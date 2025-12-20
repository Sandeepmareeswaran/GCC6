import React, { useState, useMemo } from 'react';
import './RightToolbar.css';
import { useTheme } from '../context/ThemeContext';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const initialItems = [
  // Google Workspace
  { id: 'g-drive', label: 'Google Drive', href: 'https://drive.google.com/drive/my-drive' },
  { id: 'g-docs', label: 'Google Docs', href: 'https://docs.google.com/document/' },
  { id: 'g-sheets', label: 'Google Sheets', href: 'https://docs.google.com/spreadsheets/' },
  { id: 'g-slides', label: 'Google Slides', href: 'https://docs.google.com/presentation/' },
  // Microsoft Office Online
  { id: 'ms-onedrive', label: 'OneDrive', href: 'https://onedrive.live.com/' },
  { id: 'ms-word', label: 'Word Online', href: 'https://office.live.com/start/Word.aspx' },
  { id: 'ms-excel', label: 'Excel Online', href: 'https://office.live.com/start/Excel.aspx' },
  { id: 'ms-ppt', label: 'PowerPoint', href: 'https://office.live.com/start/PowerPoint.aspx' },
];

export default function RightToolbar() {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(initialItems.map((i) => i.id));
  const [hoveredId, setHoveredId] = useState(null);
  const { currentTheme, theme } = useTheme();
  const VISIBLE_LIMIT = 4;

  const itemsById = useMemo(() => {
    const map = {};
    for (const it of initialItems) map[it.id] = it;
    return map;
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  const visibleItems = open ? order : order.slice(0, VISIBLE_LIMIT);

  const styles = {
    toolbar: {
      position: 'fixed',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 6px',
      background: theme === 'dark' ? 'rgba(30, 30, 45, 0.98)' : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      boxShadow: theme === 'dark'
        ? '0 4px 16px rgba(0, 0, 0, 0.3)'
        : '0 4px 16px rgba(34, 197, 94, 0.12)',
      border: `2px solid ${currentTheme.accent}`,
      width: '52px',
    },
    toggleBtn: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: currentTheme.accent,
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '4px',
    },
  };

  return (
    <aside style={styles.toolbar}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {visibleItems.map((id) => (
            <SortableItem
              key={id}
              item={itemsById[id]}
              isHovered={hoveredId === id}
              onHover={() => setHoveredId(id)}
              onLeave={() => setHoveredId(null)}
              theme={theme}
              currentTheme={currentTheme}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Toggle Button */}
      <button
        style={{
          ...styles.toggleBtn,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Show less' : 'Show more'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </aside>
  );
}

function SortableItem({ item, isHovered, onHover, onLeave, theme, currentTheme }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : 'auto',
    opacity: isDragging ? 0.85 : 1,
  };

  const itemStyles = {
    wrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtn: {
      width: '38px',
      height: '38px',
      borderRadius: '50%',
      background: isDragging
        ? currentTheme.accentLight
        : theme === 'dark'
          ? 'linear-gradient(135deg, #2d2d3d 0%, #1e1e2d 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: isDragging ? `2px solid ${currentTheme.accent}` : `1px solid ${theme === 'dark' ? '#3d3d4d' : 'rgba(0, 0, 0, 0.06)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: 'all 0.15s ease',
      textDecoration: 'none',
      boxShadow: isDragging
        ? `0 8px 20px rgba(34, 197, 94, 0.25)`
        : isHovered
          ? `0 4px 12px rgba(34, 197, 94, 0.15)`
          : theme === 'dark'
            ? '0 2px 6px rgba(0, 0, 0, 0.2)'
            : '0 2px 6px rgba(0, 0, 0, 0.05)',
      transform: isHovered && !isDragging ? 'scale(1.05)' : 'scale(1)',
    },
    tooltip: {
      position: 'absolute',
      right: '50px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: theme === 'dark' ? '#f1f5f9' : '#1e1e2d',
      color: theme === 'dark' ? '#1e1e2d' : '#ffffff',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 10000,
      pointerEvents: 'none',
    },
    tooltipArrow: {
      position: 'absolute',
      right: '-5px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 0,
      height: 0,
      borderTop: '5px solid transparent',
      borderBottom: '5px solid transparent',
      borderLeft: `5px solid ${theme === 'dark' ? '#f1f5f9' : '#1e1e2d'}`,
    },
    icon: {
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  const handleClick = (e) => {
    if (!isDragging) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...itemStyles.wrapper, ...style }}
      {...attributes}
      {...listeners}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        style={itemStyles.iconBtn}
        onClick={handleClick}
        title={item.label}
      >
        <span style={itemStyles.icon}>{getIcon(item.id)}</span>
      </div>
      {isHovered && !isDragging && (
        <div style={itemStyles.tooltip}>
          <div style={itemStyles.tooltipArrow}></div>
          {item.label}
        </div>
      )}
    </div>
  );
}

function getIcon(id) {
  switch (id) {
    case 'g-drive':
      return (
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path d="M6 38L24 6l18 32H6z" fill="#0F9D58" />
          <path d="M6 38h12L24 28 18 20 6 38z" fill="#F4B400" />
          <path d="M30 38h12L24 6 30 20 30 38z" fill="#4285F4" />
        </svg>
      );
    case 'g-docs':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="3" fill="#1A73E8" />
          <rect x="5" y="6" width="14" height="2" rx="1" fill="#fff" />
          <rect x="5" y="10" width="14" height="2" rx="1" fill="#fff" />
          <rect x="5" y="14" width="9" height="2" rx="1" fill="#fff" />
        </svg>
      );
    case 'g-sheets':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="3" fill="#0F9D58" />
          <rect x="5" y="5" width="14" height="14" fill="#fff" rx="1" />
          <path d="M7 8h3v3H7zM11 8h3v3h-3zM7 12h3v3H7zM11 12h3v3h-3z" fill="#0F9D58" />
        </svg>
      );
    case 'g-slides':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="3" fill="#F9AB00" />
          <path d="M7 7h10v10H7z" fill="#fff" />
          <path d="M9 9v6l4-3-4-3z" fill="#F9AB00" />
        </svg>
      );
    case 'ms-onedrive':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M6 15a4 4 0 0 1 7-3 5 5 0 0 1 9 1v1H6z" fill="#0078D4" />
        </svg>
      );
    case 'ms-word':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="3" fill="#2B579A" />
          <path d="M7 7h3l2 4 2-4h3v10h-3l-2-4-2 4H7V7z" fill="#fff" />
        </svg>
      );
    case 'ms-excel':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="3" fill="#217346" />
          <path d="M7 7h10v10H7z" fill="#fff" />
          <path d="M9 9l3 3-3 3" stroke="#217346" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'ms-ppt':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="3" fill="#D24726" />
          <path d="M7 7h10v10H7z" fill="#fff" />
          <path d="M9 9h4a2 2 0 010 4h-4V9z" fill="#D24726" />
        </svg>
      );
    default:
      return <span>📁</span>;
  }
}
