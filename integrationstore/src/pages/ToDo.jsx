import React from "react";
import TodoList from "../components/todo/TodoList";
import { useTheme } from "../context/ThemeContext";

function ToDO() {
    const { currentTheme } = useTheme();

    return (
        <div style={{
            padding: 8,
            background: currentTheme.bgPrimary,
            minHeight: '100vh',
            color: currentTheme.textPrimary
        }}>
            <TodoList />
        </div>
    );
}

export default ToDO;
