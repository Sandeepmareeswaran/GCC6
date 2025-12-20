import React from 'react';
import NotesFeatures from '../components/notes/notesfeautures';
import { useTheme } from '../context/ThemeContext';

function Notes() {
    const { currentTheme } = useTheme();

    return (
        <div style={{
            background: currentTheme.bgPrimary,
            minHeight: '100vh',
            color: currentTheme.textPrimary
        }}>
            <NotesFeatures />
        </div>
    );
}

export default Notes;