import React, { useState, useMemo } from 'react';
import './RightToolbar.css';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const items = [
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
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [activeId, setActiveId] = useState(null);
  const asideRef = React.useRef(null);

  const itemsById = useMemo(() => {
    const map = {};
    for (const it of items) map[it.id] = it;
    return map;
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }
  const VISIBLE_LIMIT = 4;
  const hiddenCount = Math.max(0, items.length - VISIBLE_LIMIT);

  React.useEffect(() => {
    function handleDocClick(e) {
      if (!asideRef.current) return;
      if (!asideRef.current.contains(e.target)) setActiveId(null);
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  return (
    <aside ref={asideRef} className={`right-toolbar ${open ? 'expanded' : 'collapsed'}`} aria-label="Quick access tools">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="rt-inner">
            {open
              ? (
                // expanded: show all items
                <>
                  {order.map((id) => (
                    <SortableItem key={id} item={itemsById[id]} activeId={activeId} onToggleLabel={(id) => setActiveId((p) => (p === id ? null : id))} />
                  ))}
                </>
              )
              : (
                // collapsed: show first VISIBLE_LIMIT items
                <>
                  {order.slice(0, VISIBLE_LIMIT).map((id) => (
                    <SortableItem key={id} item={itemsById[id]} activeId={activeId} onToggleLabel={(id) => setActiveId((p) => (p === id ? null : id))} />
                  ))}
                </>
              )}

            {/* always render the small circular toggle under the 4th item */}
            <div className="rt-item rt-toggle-wrapper rt-toggle-positioned">
              <button
                className={`rt-toggle minimal ${open ? 'open' : ''}`}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? 'Collapse toolbar' : 'Expand toolbar'}
                title={open ? 'Collapse' : 'Show more'}
              >
                <svg className="rt-chevron" viewBox="0 0 24 24" aria-hidden focusable="false">
                  <path d="M6 9 L12 15 L18 9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
              </button>
            </div>
          </div>
        </SortableContext>
      </DndContext>

      
    </aside>
  );
}

function SortableItem({ item, activeId, onToggleLabel }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : 'auto',
    opacity: isDragging ? 0.85 : 1,
  };
  const localRef = React.useRef(null);
  const [labelPos, setLabelPos] = React.useState(null);

  function handleClick(e) {
    // show label and open link immediately in a new tab
    const isActive = activeId === item.id;
    if (typeof onToggleLabel === 'function') onToggleLabel(item.id);

    if (!isActive) {
      try {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } catch (err) {
        const w = window.open();
        if (w) w.location = item.href;
      }
    }

    // compute label position when activated
    if (!isActive && localRef.current) {
      const r = localRef.current.getBoundingClientRect();
      // position the label relative to the element's right edge
      const rightPx = Math.round(window.innerWidth - r.right + 8);
      const topPx = Math.round(r.top + r.height / 2);
      setLabelPos({ right: rightPx, top: topPx });
    }
  }

  const isActive = activeId === item.id;

  // clear pending timer when active state becomes false or on unmount
  React.useEffect(() => {
    return () => {};
  }, [isActive]);

  // recompute label position on resize/scroll while active
  React.useEffect(() => {
    if (!isActive) return;
    function recompute() {
      if (!localRef.current) return;
      const r = localRef.current.getBoundingClientRect();
      const rightPx = Math.round(window.innerWidth - r.right + 8);
      const topPx = Math.round(r.top + r.height / 2);
      setLabelPos({ right: rightPx, top: topPx });
    }
    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, true);
    return () => {
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute, true);
    };
  }, [isActive]);

  const combinedRef = (el) => {
    setNodeRef(el);
    localRef.current = el;
  };

  return (
    <div ref={combinedRef} style={style} {...attributes} {...listeners} className={`rt-item ${isDragging ? 'dragging' : ''}`} data-id={item.id}>
      <a
        className="rt-link"
        href={item.href}
        onClick={handleClick}
        aria-expanded={isActive}
        aria-label={item.label}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="rt-icon" aria-hidden>
          {getIcon(item.id)}
        </span>
        <span className="rt-label visually-hidden">{item.label}</span>
      </a>

      {isActive && labelPos && (
        <div className="rt-inline-label" role="status" aria-live="polite" style={{position: 'fixed', right: `${labelPos.right}px`, top: `${labelPos.top}px`, transform: 'translateY(-50%)'}}>
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
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 38L24 6l18 32H6z" fill="#0F9D58" />
          <path d="M6 38h12L24 28 18 20 6 38z" fill="#F4B400" />
          <path d="M30 38h12L24 6 30 20 30 38z" fill="#4285F4" />
        </svg>
      );
    case 'g-docs':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="3" fill="#1A73E8" />
          <rect x="5" y="6" width="14" height="2" rx="1" fill="#fff" />
          <rect x="5" y="10" width="14" height="2" rx="1" fill="#fff" />
          <rect x="5" y="14" width="9" height="2" rx="1" fill="#fff" />
        </svg>
      );
    case 'g-sheets':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="3" fill="#0F9D58" />
          <rect x="5" y="5" width="14" height="14" fill="#fff" rx="1" />
          <path d="M7 8h3v3H7zM11 8h3v3h-3zM7 12h3v3H7zM11 12h3v3h-3z" fill="#0F9D58" />
        </svg>
      );
    case 'g-slides':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="3" fill="#F9AB00" />
          <path d="M7 7h10v10H7z" fill="#fff" />
          <path d="M9 9v6l4-3-4-3z" fill="#F9AB00" />
        </svg>
      );
    case 'ms-onedrive':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 15a4 4 0 0 1 7-3 5 5 0 0 1 9 1v1H6z" fill="#0078D4" />
        </svg>
      );
    case 'ms-word':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="3" fill="#2B579A" />
          <path d="M7 7h3l2 4 2-4h3v10h-3l-2-4-2 4H7V7z" fill="#fff" />
        </svg>
      );
    case 'ms-excel':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="3" fill="#217346" />
          <path d="M7 7h10v10H7z" fill="#fff" />
          <path d="M9 9l3 3-3 3" stroke="#217346" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'ms-ppt':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="3" fill="#D24726" />
          <path d="M7 7h10v10H7z" fill="#fff" />
          <path d="M9 9h4a2 2 0 010 4h-4V9z" fill="#D24726" />
        </svg>
      );
    default:
      return <span>📁</span>;
  }
}
