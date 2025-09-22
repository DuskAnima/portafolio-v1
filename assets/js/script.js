// assets/js/script.js (reemplaza la parte de ScrollSpy dinámico)

document.addEventListener('DOMContentLoaded', function () {
    /* ---------------- Gradient background (tu código) ---------------- */
    const body = document.body;
    const gradientBg = document.createElement('div');
    gradientBg.id = 'gradient-bg';
    body.appendChild(gradientBg);

    body.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const gradientSize = 150;
        gradientBg.style.background = `radial-gradient(circle at ${mouseX}px ${mouseY}px, #00d4ff, #090979, #020024 ${gradientSize}px)`;
        gradientBg.style.opacity = 1;
    });
    body.addEventListener('mouseleave', () => { gradientBg.style.opacity = 0; });

    /* ---------------- ScrollSpy personalizado ---------------- */
    const debug = false; // true para logs en consola
    const navSelector = '#navbar-example';
    const navLinksSelector = `${navSelector} a.nav-link`;
    const sectionsSelector = 'section[id]';
    let offset = 0;
    let sections = []; // {id, el, top}

    // Obtiene altura navbar + aplica scroll-margin-top
    function recomputeOffsetAndSections() {
        const header = document.querySelector('header.navbar');
        offset = header ? Math.ceil(header.getBoundingClientRect().height) + 6 : 100;
        if (debug) console.log('OFFSET recalculado:', offset);

        // actualiza scroll-margin-top en cada sección
        document.querySelectorAll(sectionsSelector).forEach(sec => {
            sec.style.scrollMarginTop = `${offset}px`;
        });

        // calcular posiciones absolutas iniciales (se actualizarán en scroll si necesario)
        sections = Array.from(document.querySelectorAll(sectionsSelector)).map(sec => {
            return {
                id: sec.id,
                el: sec,
                // top absoluto: distancia desde el top del doc
                top: Math.floor(sec.getBoundingClientRect().top + window.scrollY)
            };
        });

        // orden por top ascendente (por si el DOM está en orden distinto)
        sections.sort((a, b) => a.top - b.top);

        if (debug) {
            console.log('Secciones:', sections.map(s => ({ id: s.id, top: s.top })));
        }
    }

    // Actualiza los 'top' en caso de reflow (lazy images, fonts, etc.)
    function refreshSectionTops() {
        sections.forEach(s => {
            s.top = Math.floor(s.el.getBoundingClientRect().top + window.scrollY);
        });
        if (debug) console.log('Tops refrescados:', sections.map(s => ({ id: s.id, top: s.top })));
    }

    // Activa nav link por id
    function setActiveNav(id) {
        const links = document.querySelectorAll(navLinksSelector);
        links.forEach(a => {
            if (a.getAttribute('href') === `#${id}`) {
                a.classList.add('active');
                a.setAttribute('aria-current', 'true');
            } else {
                a.classList.remove('active');
                a.removeAttribute('aria-current');
            }
        });
    }

    // Lógica para decidir sección activa según scroll
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollPos = Math.floor(window.scrollY + offset + 1); // +1 para que no quede justo en el borde
                // si las posiciones están muy desincronizadas, refrescar
                // Condición simple: si el top de la primera sección > scrollPos - 200 -> refrescar
                if (sections.length && Math.abs(sections[0].top - (sections[0].el.getBoundingClientRect().top + window.scrollY)) > 3) {
                    refreshSectionTops();
                }

                // Encuentra todas las secciones cuyo top <= scrollPos, y escoge la última
                const visible = sections.filter(s => s.top <= scrollPos);
                let activeId;
                if (visible.length) {
                    activeId = visible[visible.length - 1].id;
                } else {
                    // si ninguna cumple (ej: estamos encima del primer elemento), activa el primero
                    activeId = sections[0] ? sections[0].id : null;
                }

                if (activeId) setActiveNav(activeId);
                if (debug) console.log('scrollY', window.scrollY, 'scrollPos', scrollPos, 'active', activeId);

                ticking = false;
            });
            ticking = true;
        }
    }

    // Inicialización
    recomputeOffsetAndSections();
    // forzar un refresh ligero después de carga completa (fonts, imgs)
    window.addEventListener('load', () => {
        setTimeout(() => {
            recomputeOffsetAndSections();
            onScroll();
        }, 200);
    });

    // listeners
    window.addEventListener('scroll', onScroll, { passive: true });

    // recalcula al resize o cuando el DOM cambie
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            recomputeOffsetAndSections();
            onScroll();
        }, 120);
    });

    // Si hay movimiento dinámico que altera el DOM, observa cambios y recalcula
    const observer = new MutationObserver((mutations) => {
        // sólo hacer recompute si hay cambios de layout relevantes
        let needs = false;
        for (const m of mutations) {
            if (m.type === 'childList' || m.type === 'subtree' || m.type === 'attributes') {
                needs = true; break;
            }
        }
        if (needs) {
            // pequeño debounce
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                recomputeOffsetAndSections();
                onScroll();
            }, 150);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Asegurar que clicks en nav anclan y marcan la sección (evitar que el smooth-scroll tarde y marque mal)
    document.querySelectorAll(navLinksSelector).forEach(a => {
        a.addEventListener('click', (ev) => {
            // permitir comportamiento normal de ancla; sólo marcar inmediatamente
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                const id = href.slice(1);
                setActiveNav(id);
                // recalcula (en caso de que el click abra/cierre algo)
                setTimeout(() => recomputeOffsetAndSections(), 80);
            }
        });
    });

    // Ejecutar una vez para fijar el estado inicial
    onScroll();
});

/* ---------------- jQuery toggle  ---------------- */
$(document).ready(function () {
    $('#tech > h2').click(function () {
        $(this).next('ul').slideToggle('fast');
        $(this).toggleClass('open');
    });
});
