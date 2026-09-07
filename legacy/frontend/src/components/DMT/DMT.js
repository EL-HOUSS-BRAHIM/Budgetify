// DMT.js
import React, { useEffect, useRef } from 'react';
import '../../css/DMT/DMT.module.css'; // CSS module for component-specific styles

function DMT() {
    const toggleRef = useRef(null);

    useEffect(() => {
        const DMT = toggleRef.current;
        const body = document.body;

        const handleToggle = () => {
            body.classList.toggle('dark_mode'); // Toggle dark mode class on the body
            const icon = DMT.querySelector('i');
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        };

        if (DMT) {
            DMT.addEventListener('click', handleToggle);
        }

        return () => {
            if (DMT) {
                DMT.removeEventListener('click', handleToggle);
            }
        };
    }, []);

    return (
        <button ref={toggleRef} className="dark_mode_toggle" aria-label="Toggle dark mode">
            <i className="fas fa-moon"></i>
        </button>
    );
}

export default DMT;