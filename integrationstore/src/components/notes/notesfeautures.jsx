import React, { useState, useEffect } from "react";
import "./notesfeautures.css";
import { db } from "../../config/FirebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const NotesFeatures = () => {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("personal");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Categories
  const categories = [
    { id: "personal", label: "Personal", icon: "👤" },
    { id: "work", label: "Work", icon: "💼" },
    { id: "ideas", label: "Ideas", icon: "💡" },
    { id: "important", label: "Important", icon: "⭐" },
    { id: "history", label: "History", icon: "📚" }
  ];

  // Priority levels
  const priorities = [
    { id: "high", label: "High Priority", color: "#f94144" },
    { id: "medium", label: "Medium Priority", color: "#f8961e" },
    { id: "low", label: "Low Priority", color: "#4cc9f0" }
  ];

  // Load notes from localStorage
  useEffect(() => {
    const loadNotes = async () => {
      const savedNotes = localStorage.getItem("professionalNotes");
      // try to get user email from localStorage (set at registration/login)
      const userEmail = localStorage.getItem("userEmail");

      // If user email exists, prefer Firestore data
      if (userEmail) {
        try {
          const docRef = doc(db, "Gccusernotes", userEmail);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (Array.isArray(data.notes)) {
              setNotes(data.notes);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("Error fetching notes from Firestore:", err);
        }
      }

      // fallback to localStorage
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
      setIsLoading(false);
    };

    // simulate slight delay for loading UI consistency
    setTimeout(loadNotes, 300);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("professionalNotes", JSON.stringify(notes));

      // Also save to Firestore if we have a logged-in user email
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        const saveToFirestore = async () => {
          try {
            const docRef = doc(db, "Gccusernotes", userEmail);
            await setDoc(docRef, { notes: notes, updatedAt: serverTimestamp() }, { merge: true });
          } catch (err) {
            console.error("Error saving notes to Firestore:", err);
          }
        };
        saveToFirestore();
      }
    }
  }, [notes, isLoading]);

  // Update character count
  useEffect(() => {
    setCharacterCount(input.length);
  }, [input]);

  // Handle add note
  const handleAddNote = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    
    const newNote = {
      id: Date.now(),
      text: input,
      category: category,
      priority: priority,
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      pinned: false
    };
    
    setNotes([newNote, ...notes]);
    setInput("");
    setCategory("personal");
    setPriority("medium");
  };

  // Handle delete note
  const handleDeleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  // Handle pin/unpin note
  const handlePinNote = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ));
  };

  // Handle edit note
  const handleEditNote = (id) => {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setInput(noteToEdit.text);
      setCategory(noteToEdit.category);
      setPriority(noteToEdit.priority);
      handleDeleteNote(id);
    }
  };

  // Handle clear all notes
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all notes? This action cannot be undone.")) {
      setNotes([]);
      localStorage.removeItem("professionalNotes");
    }
  };

  // Handle export notes
  const handleExportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `notes_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Handle import notes
  const handleImportNotes = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const importedNotes = JSON.parse(event.target.result);
          if (Array.isArray(importedNotes)) {
            setNotes(importedNotes);
            alert('Notes imported successfully!');
          } else {
            alert('Invalid notes file format.');
          }
        } catch (error) {
          alert('Error importing notes. Please check the file format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      if (filter === "all") return true;
      if (filter === "pinned") return note.pinned;
      return note.category === filter;
    })
    .filter(note => 
      note.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Statistics
  const totalNotes = notes.length;
  const pinnedNotes = notes.filter(note => note.pinned).length;
  const importantNotes = notes.filter(note => note.category === 'important').length;

  // Get character counter class
  const getCharCounterClass = () => {
    if (characterCount >= 450) return "danger";
    if (characterCount >= 400) return "warning";
    return "";
  };

  return (
    <div className="notes-app-container">
      {/* Header */}
      <header className="notes-header">
        <div className="header-content">
          <h1>📝 Professional Notes</h1>
          <p>Organize your thoughts, ideas, and tasks in one place. Stay productive and focused.</p>
        </div>
        <div className="notes-stats">
          <div className="stat-item">
            <span className="stat-number">{totalNotes}</span>
            <span className="stat-label">Total Notes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{pinnedNotes}</span>
            <span className="stat-label">Pinned</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{importantNotes}</span>
            <span className="stat-label">Important</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="notes-main-grid">
        {/* Left Panel - Add Note Form */}
        <div className="add-note-panel">
          <div className="panel-header">
            <h2>✏️ Add New Note</h2>
            <span className={`char-counter ${getCharCounterClass()}`}>
              {characterCount}/500 characters
            </span>
          </div>

          <form onSubmit={handleAddNote}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              placeholder="Write your note here... You can add multiple lines and format your thoughts."
              className="notes-textarea"
              rows="8"
            />

            <div className="form-grid">
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="priority-select"
                >
                  {priorities.map(pri => (
                    <option key={pri.id} value={pri.id}>
                      <span className={`priority-indicator priority-${pri.id}`}></span>
                      {pri.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleClearAll}
                className="btn btn-danger"
                disabled={notes.length === 0}
              >
                🗑️ Clear All
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={input.trim() === ""}
              >
                💾 Save Note
              </button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="action-btn" onClick={handleExportNotes}>
              <span className="action-icon">📤</span>
              <span className="action-label">Export</span>
            </div>
            <div className="action-btn" onClick={handleImportNotes}>
              <span className="action-icon">📥</span>
              <span className="action-label">Import</span>
            </div>
            <div className="action-btn" onClick={() => window.print()}>
              <span className="action-icon">🖨️</span>
              <span className="action-label">Print</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Notes List */}
        <div className="notes-list-panel">
          <div className="search-filters-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Notes
            </button>
            <button 
              className={`filter-btn ${filter === "pinned" ? "active" : ""}`}
              onClick={() => setFilter("pinned")}
            >
              📌 Pinned
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${filter === cat.id ? "active" : ""}`}
                onClick={() => setFilter(cat.id)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="loading">Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No notes found</h3>
              <p>
                {search 
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Start by adding your first note using the form on the left!"
                }
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <div 
                  key={note.id} 
                  className={`note-card ${note.pinned ? 'pinned' : ''}`}
                >
                  <span className={`category-badge badge-${note.category}`}>
                    {categories.find(c => c.id === note.category)?.icon} {categories.find(c => c.id === note.category)?.label}
                  </span>
                  
                  <div className="note-content">
                    {note.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <div className="note-footer">
                    <div className="note-meta">
                      <span className="note-date">
                        {formatDate(note.createdAt)}
                      </span>
                      <div>
                        <span className={`priority-indicator priority-${note.priority}`}></span>
                        <small>{note.priority} priority</small>
                      </div>
                    </div>
                    
                    <div className="note-actions">
                      <button 
                        onClick={() => handleEditNote(note.id)}
                        className="icon-btn"
                        title="Edit note"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handlePinNote(note.id)}
                        className={`icon-btn pin-btn ${note.pinned ? 'active' : ''}`}
                        title={note.pinned ? "Unpin note" : "Pin note"}
                      >
                        📌
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="icon-btn delete-btn"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesFeatures;