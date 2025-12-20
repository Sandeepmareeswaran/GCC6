import React, { useEffect, useState } from "react";
import "./TodoList.css";
import { auth } from "../../config/FirebaseConfig";
import { getTodos, saveTodos, subscribeTodos } from "../../services/todoService";
import { Timestamp } from "firebase/firestore";
import { useLanguage } from "../../context/LanguageContext";
import { DynamicText } from "../TranslatedText";

const initial = [
  { id: "c1", title: "Delayed", key: "delayed", color: "#ff5c8a", items: [] },
  { id: "c2", title: "Today", key: "today", color: "#33b1ff", items: [] },
  { id: "c3", title: "This week", key: "week", color: "#7b61ff", items: [] },
  { id: "c4", title: "This month", key: "month", color: "#ffb86b", items: [] },
  { id: "c5", title: "Upcoming", key: "upcoming", color: "#3ad29f", items: [] },
  { id: "c6", title: "No due date", key: "nodue", color: "#9e9e9e", items: [] }
];

export default function TodoList() {
  const [cols, setCols] = useState(initial);
  const { t } = useLanguage();

  // ensure saved data always contains our default columns (merge saved items into defaults)
  const mergeCols = (colsData) => {
    try {
      const base = Object.fromEntries(initial.map(c => [c.key, { ...c, items: [] }]));
      if (!colsData || !Array.isArray(colsData)) return Object.values(base);
      for (const c of colsData) {
        if (!c || !c.key) continue;
        if (base[c.key]) {
          base[c.key] = { ...base[c.key], ...c, items: c.items ?? [] };
        } else {
          base[c.key] = { ...c, items: c.items ?? [] };
        }
      }
      return Object.values(base);
    } catch (e) {
      return initial;
    }
  };
  const getUserEmail = () => auth.currentUser?.email || window.localStorage.getItem("userEmail") || "guest";

  // Subscribe to remote todos and load initial data
  useEffect(() => {
    const email = getUserEmail();
    let unsub;
    const isLegacy = (colsData) => {
      try {
        if (!Array.isArray(colsData)) return false;
        for (const c of colsData) {
          if (!c || !Array.isArray(c.items)) continue;
          for (const it of c.items) {
            if (it && (it.owner === "SANDEEP M" || (typeof it.title === 'string' && it.title.includes('Submit trip')))) return true;
          }
        }
      } catch (e) { }
      return false;
    };
    try {
      unsub = subscribeTodos(email, data => {
        if (data) {
          if (isLegacy(data)) {
            try { saveTodos(email, initial).catch(() => { }); } catch (e) { }
            setCols(initial);
          } else setCols(mergeCols(data));
        }
      });
    } catch (e) { }

    (async () => {
      try {
        const fetched = await getTodos(email);
        if (fetched) {
          if (isLegacy(fetched)) {
            try { saveTodos(email, initial).catch(() => { }); } catch (e) { }
            setCols(initial);
          } else setCols(mergeCols(fetched));
        }
      } catch (e) { }
    })();

    return () => { if (unsub) unsub(); };
  }, []);

  const saveAndSet = (updater) => {
    setCols(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { saveTodos(getUserEmail(), next).catch(() => { }); } catch (e) { }
      return next;
    });
  };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", owner: "", date: "", column: "nodue" });
  const [editing, setEditing] = useState(null);

  function onDragStart(e, fromColKey, itemId) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ from: fromColKey, id: itemId }));
  }

  function onDrop(e, toColKey) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    const { from, id } = JSON.parse(raw);
    if (from === toColKey) return;

    saveAndSet(prev => {
      const copy = prev.map(c => ({ ...c, items: [...c.items] }));
      const fromCol = copy.find(c => c.key === from);
      const toCol = copy.find(c => c.key === toColKey);
      if (!fromCol || !toCol) return prev;
      const idx = fromCol.items.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      const [item] = fromCol.items.splice(idx, 1);
      try { item.lastEdited = Timestamp.now(); } catch (e) { }
      toCol.items.unshift(item);
      return copy;
    });
  }

  function onDragOver(e) {
    e.preventDefault();
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCol, setModalCol] = useState(null);
  const [modalData, setModalData] = useState({ title: "", owner: "", date: "", description: "", subtasks: [], status: "Open", createdAt: "", lastEdited: "" });
  const [expanded, setExpanded] = useState({});

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }
  function formatRelativeTime(val) {
    if (!val) return "";
    let then;
    if (val && typeof val === 'object' && typeof val.toDate === 'function') then = val.toDate().getTime();
    else then = new Date(val).getTime();
    const now = Date.now();
    const sec = Math.floor((now - then) / 1000);
    if (sec < 60) return `${sec} ${t('sec')}${sec === 1 ? "" : "s"} ${t('ago')}`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} ${t('min')}${min === 1 ? "" : "s"} ${t('ago')}`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs} ${t('hour')}${hrs === 1 ? "" : "s"} ${t('ago')}`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} ${t('day')}${days === 1 ? "" : "s"} ${t('ago')}`;
    return (val && typeof val === 'object' && typeof val.toDate === 'function') ? val.toDate().toLocaleString() : new Date(val).toLocaleString();
  }

  function formatLocal(val) {
    if (!val) return "";
    return (val && typeof val === 'object' && typeof val.toDate === 'function') ? val.toDate().toLocaleString() : new Date(val).toLocaleString();
  }

  function openModal(colKey, item) {
    if (item) {
      setEditing({ id: item.id, colKey });
      setModalData({
        title: item.title || "",
        owner: item.owner || "",
        date: item.date || "",
        description: item.description || "",
        subtasks: item.subtasks ? [...item.subtasks] : [],
        createdAt: item.createdAt || "",
        lastEdited: item.lastEdited || "",
        status: item.status || "Open"
      });
      setModalCol(colKey);
      setModalOpen(true);
    } else {
      setEditing(null);
      setModalData({ title: "", owner: "", date: "", description: "", subtasks: [], status: "Open", createdAt: "", lastEdited: "" });
      setModalCol(colKey);
      setModalOpen(true);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setModalCol(null);
    setModalData({ title: "", owner: "", date: "", description: "", subtasks: [], status: "Open" });
    setEditing(null);
  }

  function handleModalInput(e) {
    const { name, value } = e.target;
    setModalData(d => ({ ...d, [name]: value }));
  }

  function addSubtask(text) {
    if (!text || !text.trim()) return;
    setModalData(d => ({ ...d, subtasks: [{ id: `s-${Date.now()}`, title: text.trim(), done: false }, ...d.subtasks] }));
  }

  function toggleSubtask(id) {
    setModalData(d => ({ ...d, subtasks: d.subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s) }));
  }

  function removeSubtask(id) {
    setModalData(d => ({ ...d, subtasks: d.subtasks.filter(s => s.id !== id) }));
  }

  function saveModal() {
    if (!modalData.title || !modalData.title.trim()) return alert(t("Please enter a title"));
    if (editing) {
      saveAndSet(prev => {
        const copy = prev.map(c => ({ ...c, items: [...c.items] }));
        const existing = copy.flatMap(c => c.items).find(i => i.id === editing.id);
        const createdAt = existing?.createdAt || Timestamp.now();
        const lastEdited = Timestamp.now();
        const fromCol = copy.find(c => c.key === editing.colKey);
        if (fromCol) {
          const idx = fromCol.items.findIndex(i => i.id === editing.id);
          if (idx !== -1) fromCol.items.splice(idx, 1);
        }
        const target = copy.find(c => c.key === modalCol);
        const updated = { id: editing.id, title: modalData.title.trim(), owner: modalData.owner.trim() || "", date: modalData.date || "", description: modalData.description || "", subtasks: modalData.subtasks || [], status: modalData.status, createdAt, lastEdited };
        if (target) target.items.unshift(updated);
        return copy;
      });
    } else {
      const id = `t-${Date.now()}`;
      const createdAt = Timestamp.now();
      const newItem = { id, title: modalData.title.trim(), owner: modalData.owner.trim() || "", date: modalData.date || "", description: modalData.description || "", subtasks: modalData.subtasks || [], status: modalData.status, createdAt, lastEdited: createdAt };
      saveAndSet(prev => prev.map(c => c.key === modalCol ? { ...c, items: [newItem, ...c.items] } : c));
    }
    closeModal();
  }

  function handleInput(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function addTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert(t("Please enter a title"));
    if (editing) {
      saveAndSet(prev => {
        const copy = prev.map(c => ({ ...c, items: [...c.items] }));
        const existing = copy.flatMap(c => c.items).find(i => i.id === editing.id);
        const createdAt = existing?.createdAt || Timestamp.now();
        const lastEdited = Timestamp.now();
        const fromCol = copy.find(c => c.key === editing.colKey);
        if (fromCol) {
          const idx = fromCol.items.findIndex(i => i.id === editing.id);
          if (idx !== -1) fromCol.items.splice(idx, 1);
        }
        const target = copy.find(c => c.key === form.column);
        const updated = { id: editing.id, title: form.title.trim(), owner: form.owner.trim() || "", date: form.date || "", createdAt, lastEdited };
        if (target) target.items.unshift(updated);
        return copy;
      });
      setEditing(null);
    } else {
      const id = `t-${Date.now()}`;
      const createdAt = Timestamp.now();
      const newItem = { id, title: form.title.trim(), owner: form.owner.trim() || "", date: form.date || "", createdAt, lastEdited: createdAt };
      saveAndSet(prev => prev.map(c => c.key === form.column ? { ...c, items: [newItem, ...c.items] } : c));
    }
    setForm({ title: "", owner: "", date: "", column: form.column });
    setShowForm(false);
  }

  function startEdit(item, colKey) {
    setEditing({ id: item.id, colKey });
    setForm({ title: item.title || "", owner: item.owner || "", date: item.date || "", column: colKey });
    setShowForm(true);
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ title: "", owner: "", date: "", column: "nodue" });
    setShowForm(false);
  }

  function deleteTask(id, colKey) {
    if (!confirm || window.confirm(t("Delete this task?"))) {
      saveAndSet(prev => prev.map(c => c.key === colKey ? { ...c, items: c.items.filter(i => i.id !== id) } : c));
    }
  }

  return (
    <div className="todo-root">
      <div className="todo-toolbar">
        <div>{t('ToDo')}</div>
      </div>
      {showForm && (
        <form className="add-form" onSubmit={addTask}>
          <input name="title" placeholder={t("Task title")} value={form.title} onChange={handleInput} />
          <input name="owner" placeholder={t("Owner")} value={form.owner} onChange={handleInput} />
          <input name="date" type="date" value={form.date} onChange={handleInput} />
          <select name="column" value={form.column} onChange={handleInput}>
            {cols.map(c => <option key={c.key} value={c.key}>{t(c.title)}</option>)}
          </select>
          <button type="submit" className="add-submit">{editing ? t('Save') : t('Add')}</button>
          {editing && <button type="button" className="add-cancel" onClick={cancelEdit}>{t('Cancel')}</button>}
        </form>
      )}
      <div className="board-wrap">
        {modalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-panel" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-status">
                  <label>{t('Status')}</label>
                  <select name="status" value={modalData.status} onChange={handleModalInput}>
                    <option>{t('Open')}</option>
                    <option>{t('In Progress')}</option>
                    <option>{t('Done')}</option>
                  </select>
                </div>
                <div className="modal-dates">
                  <label>{t('Due')}</label>
                  <input type="date" name="date" value={modalData.date} onChange={handleModalInput} />
                </div>
              </div>
              <div className="modal-body">
                <input name="title" className="modal-title" placeholder={t("Task title")} value={modalData.title} onChange={handleModalInput} />
                <div className="modal-row">
                  <input name="owner" placeholder={t("Assign to")} value={modalData.owner} onChange={handleModalInput} />
                </div>
                {modalData.createdAt && <div className="modal-created"><span className="modal-clock">🕒</span> {formatRelativeTime(modalData.createdAt)} ({formatLocal(modalData.createdAt)})</div>}
                {modalData.lastEdited && modalData.lastEdited !== modalData.createdAt && <div className="modal-updated">{t('Updated')}: {formatRelativeTime(modalData.lastEdited)} ({formatLocal(modalData.lastEdited)})</div>}
                <label>{t('Description')}</label>
                <textarea name="description" rows={4} value={modalData.description} onChange={handleModalInput}></textarea>

                <div className="subtasks">
                  <div className="subtasks-header">{t('Subtasks')}</div>
                  <div className="subtasks-list">
                    {modalData.subtasks.map(s => (
                      <div key={s.id} className="subtask-row">
                        <input type="checkbox" checked={!!s.done} onChange={() => toggleSubtask(s.id)} />
                        <div className="subtask-title"><DynamicText>{s.title}</DynamicText></div>
                        <button className="subtask-remove" onClick={() => removeSubtask(s.id)}>x</button>
                      </div>
                    ))}
                  </div>
                  <div className="subtask-add">
                    <input placeholder={t("New subtask")} id="__mini_subtask_input" onKeyDown={(e) => { if (e.key === 'Enter') { addSubtask(e.target.value); e.target.value = ''; } }} />
                    <button onClick={() => { const el = document.getElementById('__mini_subtask_input'); addSubtask(el.value); el.value = ''; }}>{t('Add')}</button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn" onClick={saveModal}>{editing ? t('Save') : t('Add')}</button>
                <button className="btn ghost" onClick={closeModal}>{t('Cancel')}</button>
              </div>
            </div>
          </div>
        )}
        {cols.map(col => (
          <div
            className="board-column"
            key={col.id}
            onDragOver={onDragOver}
            onDrop={e => onDrop(e, col.key)}
          >
            <div className="column-header" style={{ borderTopColor: col.color }}>
              <div className="col-title">{t(col.title)}</div>
              <div className="col-header-right">
                <div className="col-count">{col.items.length}</div>
                <button className="col-add-btn" onClick={() => openModal(col.key)}>+</button>
              </div>
            </div>

            <div className="column-body">
              {col.items.map(item => (
                <div
                  key={item.id}
                  className="todo-card"
                  draggable
                  onDragStart={e => onDragStart(e, col.key, item.id)}
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="card-top">
                    <div className="badge">{t(item.status || 'Open')}</div>
                    <div className="owner"><DynamicText>{item.owner}</DynamicText></div>
                  </div>
                  <div className="card-actions">
                    <button className="card-btn" onClick={(e) => { e.stopPropagation(); openModal(col.key, item); }}>{t('Edit')}</button>
                    <button className="card-btn danger" onClick={(e) => { e.stopPropagation(); deleteTask(item.id, col.key); }}>{t('Delete')}</button>
                  </div>
                  <div className="card-title"><DynamicText>{item.title}</DynamicText></div>
                  {item.date && <div className="card-date">{item.date}</div>}
                  {item.createdAt && <div className="card-created"><span className="card-clock">🕒</span> {formatRelativeTime(item.createdAt)}</div>}
                  {item.lastEdited && item.lastEdited !== item.createdAt && <div className="card-updated">{t('Updated')}: {formatRelativeTime(item.lastEdited)}</div>}
                  {expanded[item.id] && (
                    <div className="card-expanded">
                      {item.description && <div className="card-desc"><DynamicText>{item.description}</DynamicText></div>}
                      {item.subtasks && item.subtasks.length > 0 && (
                        <div className="card-subtasks">
                          {item.subtasks.map(s => (
                            <div key={s.id} className="subtask-row">
                              <input type="checkbox" checked={!!s.done} readOnly />
                              <div className="subtask-title"><DynamicText>{s.title}</DynamicText></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
