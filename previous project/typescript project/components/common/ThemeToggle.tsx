import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-light-text/80 dark:text-dark-text/80 hover:bg-light-primary/10 dark:hover:bg-dark-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:ring-offset-transparent transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
    );
};

export default ThemeToggle;