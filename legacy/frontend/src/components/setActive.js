// utils/setActivePage.js
export default function setActivePage(pageId) {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
      if (link.id === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  