// ============================================================================
// MOTOR RPG 2D MULTI-NIVEL - LA MARIPOSA PERDIDA (MISTERIO EXISTENCIAL + IMÁGENES)
// ============================================================================

const canvas = document.getElementById("juegoCanvas");
const ctx = canvas.getContext("2d");

const cajaDialogo = document.getElementById("cajaDialogo");
const nombreDialogo = document.getElementById("nombreDialogo");
const textoDialogo = document.getElementById("textoDialogo");

// CONTROLES
let teclas = {};
window.addEventListener("keydown", (e) => { teclas[e.key] = true; });
window.addEventListener("keyup", (e) => { teclas[e.key] = false; });

// ESTADOS DEL JUEGO
let estadoJuego = "MENU";
let opcionMenu = 0; 
let tiempoIntro = 0;
let teclaEspacioPulsada = false;
let teclaBackPulsada = false; // nueva bandera para evitar repetición con Backspace

// ENTIDADES GLOBALES
let jugador = { x: 50, y: 300, w: 80, h: 120, color: "#ffb6c1", velocidad: 3, imagen: new Image() }; // velocidad reducida (antes 5)
jugador.imagen.src = "images/lara.png"; // <--- Aquí pones el nombre de tu imagen

// Reemplazado: Lucky ahora tiene una imagen y tamaño mayor
let lucky = { x: 30, y: 320, w: 120, h: 120, color: "#d35400", nombre: "Lucky", activo: true, imagen: new Image() };
lucky.imagen.src = "images/lucky.png";
let imagenTitulo = new Image();
imagenTitulo.src = "images/maintitle.png";

// SISTEMA DE DIÁLOGO AVANZADO
let npcActual = null;
let indiceDialogo = 0;
let enDialogo = false;
let enOpciones = false;
let opcionSeleccionada = 0;

// DATOS DE LOS ESCENARIOS
const escenarios = [
    {
        nombre: "Cuarto de Lara",
        bg: "#1e272e",
        imagenSrc: "images/cuartolara.jpeg", // fondo del cuarto de Lara
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        salida: { x: 750, y: 250, w: 50, h: 100, color: "#2ecc71" },
        muebles: [
            { x: 50, y: 50, w: 200, h: 100, color: "rgba(44, 62, 80, 0.5)" },
            { x: 500, y: 50, w: 100, h: 50, color: "rgba(52, 73, 94, 0.5)" }
        ],
        npcs: [
            { 
                x: 520, y: 120, w: 30, h: 30, color: "rgba(255,255,255,0.2)", nombre: "Tarro Vacío", 
                dialogo: [
                    "El cristal está intacto, pero la mariposa no está.", 
                    "Es como si se hubiera evaporado en el aire. No tiene sentido.", 
                    "Lucky lleva 20 minutos ladrándole a esa esquina vacía del cuarto."
                ] 
            }
        ],
        objetos: [
            { x: 300, y: 400, w: 15, h: 15, color: "#95a5a6", nombre: "Reloj Parado", recogido: false, texto: "El segundero tiembla intentando avanzar, pero vuelve hacia atrás. El tiempo parece haberse estancado." }
        ]
    },
    {
        nombre: "Casa de Lara (Pasillo)",
        bg: "#2d3436",
        imagenSrc: "images/salonlara.png", // <-- Imagen añadida aquí
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        salida: { x: 750, y: 250, w: 50, h: 100, color: "#2ecc71" },
        muebles: [ { x: 200, y: 400, w: 400, h: 50, color: "rgba(17, 17, 17, 0.5)" } ],
        npcs: [
           { 
                x: 400, y: 250, 
                w: 80, h: 120, // Aumentado para que se vea bien la imagen
                color: "#b2bec3", 
                nombre: "Mamá", 
                imagenSrc: "images/madrelara.png", // <--- Imagen añadida aquí
                dialogo: [
                    "Lara, la cena estará lista en... no recuerdo qué te iba a decir.",
                    "Qué extraño, últimamente pierdo el hilo de mis pensamientos. Hay un silencio muy pesado en la casa hoy.",
                    "No vayas muy lejos. Las calles están... demasiado vacías."
                ] 
            }
        ],
        objetos: []
    },
    {
        nombre: "Pino Montano (Calle)",
        bg: "#2f3640",
        imagenSrc: "images/pinoloco.png", // <-- PON AQUÍ TU IMAGEN
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        salida: { x: 750, y: 250, w: 50, h: 100, color: "#2ecc71" },
        muebles: [ { x: 300, y: 100, w: 40, h: 40, color: "rgba(241, 196, 15, 0.5)" }, { x: 600, y: 450, w: 40, h: 40, color: "rgba(241, 196, 15, 0.5)" } ],
        npcs: [
          { 
                x: 550, 
                y: 270,        // Bajamos el número de Y para que sus pies sigan tocando el suelo (al ser más alto)
                w: 100,        // Un poco más ancho que Lara (80)
                h: 150,        // Más alto que Lara (120)
                color: "#c0392b", 
                nombre: "Akuma", 
                imagenSrc: "images/akuma.png", 
                dialogo: [
                    "El aura de este lugar ha cambiado, Lara.",
                    "La mariposa no se ha ido, ha sido consumida por el silencio."
                ] 
            },
            { 
                x: 360, y: 300, w: jugador.w, h: jugador.h, color: "#34495e", nombre: "Dai", 
                imagenSrc: "images/dai.png",
                dialogo: [
                    "L-Lara... acércate despacio. ¿Escuchas la radio?",
                    "No hay emisoras. Solo capta un sonido hueco. Como si no hubiera nadie transmitiendo desde el otro lado de la ciudad.",
                    "Tu mariposa era especial. Era lo único vibrante aquí. Mira a Lucky cómo tiembla, él también lo sabe.",
                    "Hay un tren en Santa Justa. Creo que deberías ir a investigar."
                ] 
            }
        ],
        objetos: []
    },
    {
        nombre: "Autobús TUSSAM (Cinemática)",
        bg: "#111",
        imagenSrc: "images/autobuscinema.png", // imagen cinematica corregida
        tipo: "cinematica",
        texto: "El autobús avanza sin emitir ruido de motor.\nLos pasajeros miran al frente. Ninguno parpadea.\nLucky gruñe en voz baja a una mujer que mira fijamente a la nada.",
        duracion: 6
    },
    {
        nombre: "Exterior Santa Justa",
        bg: "#1a1a1a",
        imagenSrc: "images/santajustaext.png", // <-- PON AQUÍ TU IMAGEN
        maskSrc: "images/santajusta_mask.png", // imagen máscara: paredes/obstáculos en negro
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        // SALIDA situada en la puerta visible en el fondo (ajusta X/Y/W/H si hace falta)
        salida: { x: 520, y: 140, w: 120, h: 220, color: "#2ecc71" },
        entrada: { x: 0, y: 250, w: 50, h: 100, color: "#e74c3c" }, // ejemplo: colisiona a la izquierda para volver atrás
        muebles: [],
        npcs: [
            { 
                x: 400, y: 300, w: 40, h: 40, color: "#e74c3c", nombre: "Gitanillo", 
                dialogo: [
                    "Eh, niña. Dame un euro, ¿no?",
                    {
                        texto: "¿Le das un euro?",
                        opciones: [
                            { texto: "Sí, ten un euro.", siguiente: 2 },
                            { texto: "No tengo suelto ahora mismo.", siguiente: 3 }
                        ]
                    },
                    "Gracias. Ten cuidado ahí dentro... la gente entra a la estación, pero sus sombras se quedan fuera. (Fin)",
                    "Pues tú sabrás. Se nota en el aire. El que entra ahí no vuelve a ser el mismo. (Fin)"
                ] 
            }
        ],
        objetos: []
    },
    {
        nombre: "Interior Santa Justa (Andenes)",
        bg: "#222222",
        imagenSrc: "images/santajustaint.png", // <-- PON AQUÍ TU IMAGEN
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        salida: { x: 750, y: 250, w: 50, h: 100, color: "#e67e22" },
        muebles: [ { x: 0, y: 100, w: 800, h: 50, color: "rgba(85, 85, 85, 0.5)" } ],
        npcs: [
            { 
                x: 200, y: 200, w: jugador.w, h: jugador.h, color: "#95a5a6", nombre: "Morillo",
                imagenSrc: "images/morillo.png",
                dialogo: ["Llevo esperando el tren de las 9:24 desde ayer. Te juro que he visto el sol salir dos veces, pero el reloj sigue igual."] 
            },
            { 
                x: 500, y: 400, w: 40, h: 40, color: "#e84393", nombre: "La Missyaoi", 
                dialogo: ["El aire pesa muchísimo en este andén. Mira mi pelo, ni siquiera se mueve con el viento del túnel."] 
            }
        ],
        objetos: [
            { x: 100, y: 500, w: 15, h: 15, color: "white", nombre: "Billete Antiguo", recogido: false, texto: "Un billete de tren. Está fechado hace 10 años, pero parece recién impreso." }
        ]
    },
    {
        nombre: "Interior del Tren",
        bg: "#2c3e50",
        imagenSrc: "images/tren.png", // <-- PON AQUÍ TU IMAGEN
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        salida: null, 
        muebles: [
            { x: 100, y: 150, w: 100, h: 50, color: "rgba(52, 73, 94, 0.5)" },
            { x: 300, y: 150, w: 100, h: 50, color: "rgba(52, 73, 94, 0.5)" },
            { x: 500, y: 150, w: 100, h: 50, color: "rgba(52, 73, 94, 0.5)" }
        ],
        npcs: [
            { 
                x: 650, y: 250, w: 40, h: 40, color: "#bdc3c7", nombre: "Revisor", 
                dialogo: [
                    "Lara nota que el tren está en silencio total. No hay vibración del motor sobre las vías.",
                    "Billete, por favor. ¿Viaja usted con su billete validado?",
                    {
                        texto: "¿Tienes billete?",
                        opciones: [
                            { texto: "Sí, aquí tiene.", accion: "pasar_tren" },
                            { texto: "No lo encuentro...", siguiente: 3 }
                        ]
                    },
                    "Escúcheme bien. Viajar sin billete significa vagar por los andenes sin llegar nunca a su destino.",
                    "Pero hoy... hoy todo está del revés. Puede quedarse. Total, parece que las vías se han vuelto infinitas hoy. (Fin)"
                ] 
            }
        ],
        objetos: []
    },
    {
        nombre: "Estación de Los Rosales",
        bg: "#1a1a1a",
        imagenSrc: "", // <-- PON AQUÍ TU IMAGEN
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        salida: { x: 750, y: 250, w: 50, h: 100, color: "#2ecc71" },
        muebles: [ { x: 380, y: 280, w: 40, h: 40, color: "rgba(211, 84, 0, 0.5)" } ],
        npcs: [
            { 
                x: 430, y: 300, w: 40, h: 40, color: "#7f8c8d", nombre: "Yonki", 
                dialogo: [
                    "Jeje... acércate al fuego, niña. Es lo único que da calor real en este barrio frío.", 
                    "Yuso y Guille llevan días sin salir. Dicen que han visto algo extraño al fondo de su cuarto."
                ] 
            }
        ],
        objetos: []
    },
    {
        nombre: "Casa de Yuso (Entrada)",
        bg: "#2b2b2b",
        imagenSrc: "", // <-- PON AQUÍ TU IMAGEN
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        salida: { x: 750, y: 250, w: 50, h: 100, color: "#2ecc71" },
        muebles: [],
        npcs: [
            { 
                x: 400, y: 200, w: 40, h: 40, color: "#c0392b", nombre: "Madre Yuso (Reyes)", 
                dialogo: [
                    "Lara... qué bien que vienes. Guille y Yuso llevan horas callados en la habitación.",
                    "He intentado abrir, pero hace muchísimo frío al tocar el pomo. Me da escalofríos. Pasa tú, por favor."
                ] 
            }
        ],
        objetos: []
    },
   {
        nombre: "Cuarto de Yuso",
        bg: "#111", 
        imagenSrc: "images/cuarto.png", // <-- cambia a tu archivo cuarto.png
        maskSrc: "images/cuarto_mask.png", // máscara para paredes del cuarto
        tipo: "jugable",
        inicio: { x: 50, y: 300 },
        salida: null, 
        muebles: [
            { x: 300, y: 50, w: 200, h: 100, color: "rgba(0,0,0,0.8)", nombre: "Rincón Oscuro" }
        ],
        npcs: [
            { 
                x: 120, y: 200, w: 80, h: 120, color: "#3498db", nombre: "Yuso", 
                imagenSrc: "images/yuso.png", solido: false, 
                dialogo: [
                    "Pasa, Lara. Siéntate si quieres. ¿Te has fijado en que hoy no ha amanecido?", 
                    "Todo está paralizado. La gente, la brisa, el polvo en el aire. Tu mariposa era la única chispa que nos quedaba.",
                    "Pero ha desaparecido. Y con ella, siento que el mundo se está quedando dormido para siempre."
                ] 
            },
            { 
                x: 280, y: 200, w: 80, h: 120, color: "#e67e22", nombre: "Guille", 
                imagenSrc: "images/guille.png", solido: false,
                dialogo: [
                    "Lucky es el único que parece entenderlo. Mírale. Le ladra a cosas que nosotros no logramos ver.",
                    "No te vayas, Lara. Quédate aquí. Al menos en la quietud no pasa nada malo."
                ] 
            },
            { 
                x: 450, y: 400, w: 40, h: 40, color: "#d35400", nombre: "Lucky (El Perro)", solido: false,
                dialogo: [
                    "¡GUAU! ¡GUAU! (Lucky gimotea y rasca el suelo con fuerza, como si intentara cavar una salida hacia un lugar donde el tiempo fluya con normalidad).",
                    "La habitación se queda en un silencio absoluto... (Fin de la historia)."
                ] 
            }
        ],
        objetos: []
    }
];

// =======================================================
// PRECARGA DE IMÁGENES (FONDOS Y NPCs)
// =======================================================
escenarios.forEach(nivel => {
    // Cargar fondo del nivel
    if (nivel.imagenSrc && nivel.imagenSrc !== "") {
        nivel.objImagen = new Image();
        nivel.imagenCargada = false;
        nivel.objImagen.onload = () => { nivel.imagenCargada = true; console.log("Fondo cargado:", nivel.imagenSrc); };
        nivel.objImagen.onerror = () => { console.warn("No se pudo cargar fondo:", nivel.imagenSrc); nivel.imagenCargada = false; };
        nivel.objImagen.src = nivel.imagenSrc;
    }
    // Por defecto las puertas/entradas son invisibles en el render; usa salidaVisible/entradaVisible = true para mostrarlas
    if (nivel.salida && nivel.salidaVisible === undefined) nivel.salidaVisible = false;
    if (nivel.entrada && nivel.entradaVisible === undefined) nivel.entradaVisible = false;
    // Cargar imágenes de NPCs y normalizar propiedades por defecto
    if (nivel.npcs) {
        nivel.npcs.forEach(npc => {
            if (npc.solido === undefined) npc.solido = true;         // por defecto sólidos salvo que se diga lo contrario
            if (npc.interactuable === undefined) npc.interactuable = true; // se puede hablar por defecto
            if (npc.seguir === undefined) npc.seguir = false;

            if (npc.imagenSrc && npc.imagenSrc !== "") {
                npc.objImagen = new Image();
                npc.imagenCargada = false;
                npc.objImagen.onload = () => { npc.imagenCargada = true; };
                npc.objImagen.onerror = () => { console.warn("No se pudo cargar NPC:", npc.imagenSrc); npc.imagenCargada = false; };
                npc.objImagen.src = npc.imagenSrc;
            }
        });
    }
});

// Precarga de Lara (Jugador)
jugador.imagen = new Image();
jugador.imagen.src = "images/lara.png";

let nivelActual = 0;

// =======================================================
// FUNCIONES DE CONTROL DE DIÁLOGO
// =======================================================

function cargarNivel(indice) {
    if (indice >= escenarios.length) return;
    nivelActual = indice;
    const nivel = escenarios[nivelActual];
    document.querySelector("h2").innerText = `Efecto Mariposa - ${nivel.nombre}`;

    // marcar controlable sólo cuando cargue el nivel
    jugador.controlable = false;
    
    if (nivel.tipo === "jugable") {
        // si la imagen ya estaba en caché y completa, marcarla como cargada para que se vea inmediatamente
        if (nivel.objImagen && nivel.objImagen.complete) nivel.imagenCargada = true;

        jugador.x = nivel.inicio.x;
        jugador.y = nivel.inicio.y;
        estadoJuego = "JUGANDO";
        lucky.x = jugador.x - 30;
        lucky.y = jugador.y + 20;

        // Asegurar que Lara no aparezca solapada con muebles o NPCs sólidos:
        let encontrado = intentarMovimiento(jugador.x, jugador.y);
        if (!encontrado) {
            const paso = 10;
            for (let yy = 0; yy <= canvas.height - jugador.h; yy += paso) {
                let roto = false;
                for (let xx = 0; xx <= canvas.width - jugador.w; xx += paso) {
                    if (intentarMovimiento(xx, yy)) {
                        jugador.x = xx;
                        jugador.y = yy;
                        encontrado = true;
                        roto = true;
                        break;
                    }
                }
                if (roto) break;
            }
        }
        if (!encontrado) {
            let intentos = 0;
            while (!intentarMovimiento(jugador.x, jugador.y) && intentos < 100) {
                jugador.x = Math.max(0, jugador.x - 5);
                jugador.y = Math.max(0, jugador.y - 5);
                intentos++;
            }
        }

        // permitir control tras breve retardo para evitar que inputs previos queden pegados
        setTimeout(() => { jugador.controlable = true; }, 50);

        console.log(`Cargado nivel ${nivel.nombre}. imagenCargada=${nivel.imagenCargada}, npcs=${nivel.npcs ? nivel.npcs.map(n=>n.nombre).join(",") : ""}`);
    } else if (nivel.tipo === "cinematica") {
        estadoJuego = "CINEMATICA";
        tiempoCinematica = nivel.duracion * 60;
    }
}

function hayColision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
    );
}

function intentarMovimiento(nuevaX, nuevaY) {
    const nivel = escenarios[nivelActual];
    const hitboxJugador = { x: nuevaX, y: nuevaY, w: jugador.w, h: jugador.h };
    if (nuevaX < 0 || nuevaX + jugador.w > canvas.width || nuevaY < 0 || nuevaY + jugador.h > canvas.height) return false;
    for (let mueble of nivel.muebles) { if (hayColision(hitboxJugador, mueble)) return false; }
    // Sólo considerar NPCs "sólidos" para bloqueo de movimiento (por defecto si no existe la propiedad, se considera sólido)
    if (nivel.npcs) {
        for (let npc of nivel.npcs) {
            // NO bloquear si el NPC está marcado como no sólido o si está siguiendo a Lara
            if (npc.solido === false) continue;
            if (npc.seguir) continue;
            if (hayColision(hitboxJugador, npc)) return false;
        }
    }
    return true;
}

function avanzarDialogo() {
    let nodoActual = npcActual.dialogo[indiceDialogo];
    
    if (typeof nodoActual === "string" && nodoActual.includes("(Fin)")) {
        cerrarDialogo();
        return;
    }

    indiceDialogo++;
    
    if (indiceDialogo >= npcActual.dialogo.length) {
        cerrarDialogo();
        return;
    }

    let siguienteNodo = npcActual.dialogo[indiceDialogo];

    if (typeof siguienteNodo === "string") {
        textoDialogo.innerHTML = siguienteNodo;
        enOpciones = false;
    } else {
        enOpciones = true;
        opcionSeleccionada = 0;
        dibujarOpciones(siguienteNodo);
    }
}

function cerrarDialogo() {
    enDialogo = false;
    enOpciones = false;
    cajaDialogo.style.display = "none";

    // Si el diálogo que se cierra es de Guille, hacer que empiece a seguir a Lara
    if (npcActual && npcActual.nombre === "Guille") {
        npcActual.seguir = true;
    }

    npcActual = null;
}

function ejecutarOpcion(opcion) {
    if (opcion.accion === "pasar_tren") {
        cerrarDialogo();
        cargarNivel(nivelActual + 1); 
    } else if (opcion.siguiente !== undefined) {
        indiceDialogo = opcion.siguiente;
        let nodoDestino = npcActual.dialogo[indiceDialogo];
        
        if (typeof nodoDestino === "string") {
            textoDialogo.innerHTML = nodoDestino;
            enOpciones = false;
        } else {
            enOpciones = true;
            opcionSeleccionada = 0;
            dibujarOpciones(nodoDestino);
        }
    } else {
        cerrarDialogo();
    }
}

function dibujarOpciones(nodoOpciones) {
    let html = `<p>${nodoOpciones.texto}</p><ul style="list-style:none; padding:0; margin-top:10px;">`;
    for (let i = 0; i < nodoOpciones.opciones.length; i++) {
        let opc = nodoOpciones.opciones[i];
        if (i === opcionSeleccionada) {
            html += `<li style="color:#ffdd57;">► ${opc.texto}</li>`;
        } else {
            html += `<li style="color:#fff;">  ${opc.texto}</li>`;
        }
    }
    html += "</ul>";
    textoDialogo.innerHTML = html;
}

// =======================================================
// BUCLE PRINCIPAL Y LÓGICA DE ACTUALIZACIÓN
// =======================================================

function actualizar() {
    if (estadoJuego === "MENU") {
        if (teclas["ArrowUp"] || teclas["w"]) opcionMenu = 0;
        if (teclas["ArrowDown"] || teclas["s"]) opcionMenu = 1;
        
        if (teclas[" "] && !teclaEspacioPulsada) {
            teclaEspacioPulsada = true;
            if (opcionMenu === 0) {
                estadoJuego = "INTRO";
                tiempoIntro = 360; 
            } else {
                alert("Las calles de Sevilla están vacías. No hay adónde salir.");
                opcionMenu = 0; 
            }
        } else if (!teclas[" "]) {
            teclaEspacioPulsada = false;
        }
        return;
    }

    if (estadoJuego === "INTRO") {
        tiempoIntro--;
        if (tiempoIntro <= 0 || (teclas[" "] && !teclaEspacioPulsada)) {
            teclaEspacioPulsada = true;
            cargarNivel(0);
        } else if (!teclas[" "]) {
            teclaEspacioPulsada = false;
        }
        return;
    }

    if (estadoJuego === "CINEMATICA") {
        tiempoCinematica--;
        if (tiempoCinematica <= 0) cargarNivel(nivelActual + 1);
        return;
    }

    if (estadoJuego === "JUGANDO") {
        const nivel = escenarios[nivelActual];

        if (enDialogo) {
            if (enOpciones) {
                let nodoOpciones = npcActual.dialogo[indiceDialogo];
                if ((teclas["ArrowUp"] || teclas["w"]) && !teclaEspacioPulsada) {
                    teclaEspacioPulsada = true;
                    opcionSeleccionada = Math.max(0, opcionSeleccionada - 1);
                    dibujarOpciones(nodoOpciones);
                } else if ((teclas["ArrowDown"] || teclas["s"]) && !teclaEspacioPulsada) {
                    teclaEspacioPulsada = true;
                    opcionSeleccionada = Math.min(nodoOpciones.opciones.length - 1, opcionSeleccionada + 1);
                    dibujarOpciones(nodoOpciones);
                } else if (teclas[" "] && !teclaEspacioPulsada) {
                    teclaEspacioPulsada = true;
                    ejecutarOpcion(nodoOpciones.opciones[opcionSeleccionada]);
                } else if (!teclas["ArrowUp"] && !teclas["ArrowDown"] && !teclas[" "]) {
                    teclaEspacioPulsada = false;
                }
            } else {
                if (teclas[" "] && !teclaEspacioPulsada) {
                    teclaEspacioPulsada = true;
                    avanzarDialogo();
                } else if (!teclas[" "]) {
                    teclaEspacioPulsada = false;
                }
            }
            return; 
        }

        // MOVIMIENTO: ahora probamos movimiento combinado primero (diagonal) para evitar quedar clavado
        if (jugador.controlable !== false) {
            let dx = 0; let dy = 0;
            if (teclas["ArrowUp"] || teclas["w"]) dy -= jugador.velocidad;
            if (teclas["ArrowDown"] || teclas["s"]) dy += jugador.velocidad;
            if (teclas["ArrowLeft"] || teclas["a"]) dx -= jugador.velocidad;
            if (teclas["ArrowRight"] || teclas["d"]) dx += jugador.velocidad;

            if (dx !== 0 || dy !== 0) {
                // intentar movimiento combinado
                if (intentarMovimiento(jugador.x + dx, jugador.y + dy)) {
                    jugador.x += dx;
                    jugador.y += dy;
                } else {
                    // intentar por ejes separados (suaviza colisiones contra esquinas)
                    if (dx !== 0 && intentarMovimiento(jugador.x + dx, jugador.y)) jugador.x += dx;
                    if (dy !== 0 && intentarMovimiento(jugador.x, jugador.y + dy)) jugador.y += dy;
                }
            }
        }

        if (lucky.activo) {
            let dxLucky = jugador.x - lucky.x;
            let dyLucky = jugador.y - lucky.y;
            let dist = Math.sqrt(dxLucky*dxLucky + dyLucky*dyLucky);
            
            if (dist > 60) {
                lucky.x += (dxLucky / dist) * (jugador.velocidad * 0.8);
                lucky.y += (dyLucky / dist) * (jugador.velocidad * 0.8);
            } else if (Math.random() < 0.01) {
                lucky.x += (Math.random() - 0.5) * 10;
                lucky.y += (Math.random() - 0.5) * 10;
            }
        }

        // Movimiento de NPCs que siguen a Lara (Yuso y/o Guille)
        if (nivel.npcs) {
            for (let npc of nivel.npcs) {
                if (npc.seguir) {
                    let dxN = jugador.x - npc.x;
                    let dyN = jugador.y - npc.y;
                    let distN = Math.hypot(dxN, dyN);
                    let velocidadNpc = Math.max(0.6, jugador.velocidad * 0.6); // velocidad relativa
                    let distanciaObjetivo = 70; // distancia a la que se mantienen de Lara
                    if (distN > distanciaObjetivo) {
                        npc.x += (dxN / distN) * velocidadNpc;
                        npc.y += (dyN / distN) * velocidadNpc;
                    } else if (distN < 40 && distN > 0) {
                        // si se acercan demasiado, retroceden ligeramente para evitar solape extremo
                        npc.x -= (dxN / distN) * 0.3;
                        npc.y -= (dyN / distN) * 0.3;
                    }
                }
            }
        }

        if (nivel.salida && hayColision(jugador, nivel.salida)) {
            cargarNivel(nivelActual + 1);
            return;
        }
        // Si el nivel define una "entrada", colisionar con ella vuelve al nivel anterior
        if (nivel.entrada && hayColision(jugador, nivel.entrada)) {
            if (nivelActual > 0) cargarNivel(Math.max(0, nivelActual - 1));
            return;
        }
        // Permitir volver manualmente con Backspace al nivel anterior
        if (!enDialogo) {
            if (teclas["Backspace"] && !teclaBackPulsada) {
                teclaBackPulsada = true;
                if (nivelActual > 0) cargarNivel(Math.max(0, nivelActual - 1));
                return;
            } else if (!teclas["Backspace"]) {
                teclaBackPulsada = false;
            }
        }

        if (teclas[" "] && !teclaEspacioPulsada) {
            teclaEspacioPulsada = true;
            const zonaInteraccion = { x: jugador.x - 20, y: jugador.y - 20, w: jugador.w + 40, h: jugador.h + 40 };

            for (let npc of nivel.npcs) {
                if (hayColision(zonaInteraccion, npc)) {
                    enDialogo = true;
                    npcActual = npc;
                    indiceDialogo = 0;
                    cajaDialogo.style.display = "block";
                    nombreDialogo.innerText = npc.nombre;

                    // Yuso se une a Lara en cuanto hablas con él
                    if (npc.nombre === "Yuso") {
                        npc.seguir = true;
                    }

                    let primerNodo = npc.dialogo[0];
                    if (typeof primerNodo === "string") {
                        textoDialogo.innerHTML = primerNodo;
                        enOpciones = false;
                    } else {
                        enOpciones = true;
                        opcionSeleccionada = 0;
                        dibujarOpciones(primerNodo);
                    }
                    return;
                }
            }

            if (nivel.objetos) {
                for (let obj of nivel.objetos) {
                    if (!obj.recogido && hayColision(zonaInteraccion, obj)) {
                        obj.recogido = true;
                        enDialogo = true;
                        npcActual = { nombre: "Has encontrado algo...", dialogo: [`${obj.nombre}`, obj.texto, "(Fin)"] };
                        indiceDialogo = 0;
                        cajaDialogo.style.display = "block";
                        nombreDialogo.innerText = npcActual.nombre;
                        textoDialogo.innerHTML = npcActual.dialogo[0];
                        return;
                    }
                }
            }
        } else if (!teclas[" "]) {
            teclaEspacioPulsada = false;
        }
    }
}

// =======================================================
// RENDERIZADO (DIBUJO)
// =======================================================

// =======================================================
// RENDERIZADO (DIBUJO)
// =======================================================

function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (estadoJuego === "MENU") {
        // Fondo oscuro (se usará como fallback si la imagen no carga)
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- Fondo imagen (cover) ---
        if (imagenTitulo && imagenTitulo.complete && imagenTitulo.naturalWidth) {
            const iw = imagenTitulo.naturalWidth;
            const ih = imagenTitulo.naturalHeight;
            const scale = Math.max(canvas.width / iw, canvas.height / ih);
            const sw = canvas.width / scale;
            const sh = canvas.height / scale;
            const sx = Math.max(0, Math.floor((iw - sw) / 2));
            const sy = Math.max(0, Math.floor((ih - sh) / 2));
            ctx.drawImage(imagenTitulo, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            ctx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.35);
        }

        // TÍTULO ELEGANTE
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        // usar la fuente elegida (Playfair Display); tamaño aumentado
        ctx.font = "700 56px 'Playfair Display', serif";
        // sombra sutil para elegancia y legibilidad
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 6;
        ctx.fillText("EFECTO MARIPOSA", canvas.width / 2, canvas.height * 0.72);
        // reset sombra para el resto del texto
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Opciones de menú (más discretas)
        ctx.font = "18px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillText((opcionMenu === 0 ? "> " : "") + "INICIAR HISTORIA", canvas.width / 2, canvas.height * 0.80);
        ctx.fillText((opcionMenu === 1 ? "> " : "") + "SALIR", canvas.width / 2, canvas.height * 0.86);

        ctx.textAlign = "left";
        return;
    }

    if (estadoJuego === "INTRO") {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("A veces, el mundo parece quedarse sin aliento.", canvas.width/2, 250);
        ctx.fillText("Lucky lleva horas ladrando a una esquina vacía de la habitación.", canvas.width/2, 290);
        ctx.fillText("Algo falta. Algo ha desaparecido.", canvas.width/2, 330);
        
        ctx.fillStyle = "#555";
        ctx.font = "14px Arial";
        ctx.fillText("[Cargando historia...]", canvas.width/2, 550);
        ctx.textAlign = "left";
        return;
    }

    const nivel = escenarios[nivelActual];

    // 1. DIBUJAR EL FONDO (usar la bandera de carga)
    if (nivel.objImagen && nivel.imagenCargada) {
        ctx.drawImage(nivel.objImagen, 0, 0, canvas.width, canvas.height);
    } else {
        // Si no hay imagen cargada, dibuja el color de fondo (evita quedarse todo negro si no se carga la imagen)
        ctx.fillStyle = nivel.bg || "#222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Si existe imagenSrc pero aún no cargó, opcionalmente se puede mostrar un indicador
        if (nivel.imagenSrc && !nivel.imagenCargada) {
            ctx.fillStyle = "#888";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Cargando fondo...", canvas.width/2, canvas.height - 20);
            ctx.textAlign = "left";
        }
    }

    if (estadoJuego === "CINEMATICA") {
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        let lineas = nivel.texto.split('\n');
        for (let i=0; i<lineas.length; i++) {
            ctx.fillText(lineas[i], canvas.width/2, 250 + (i * 30));
        }
        ctx.fillStyle = "#7f8c8d";
        ctx.fillText(`Llegando a la parada: ${Math.ceil(tiempoCinematica/60)}s`, canvas.width/2, 450);
        ctx.textAlign = "left";
        return;
    }

    // 2. DIBUJAR SALIDA Y MUEBLES
    // Si salidaVisible está activada se dibuja (por defecto está oculta)
    if (nivel.salida && nivel.salidaVisible) {
        ctx.fillStyle = nivel.salida.color;
        ctx.fillRect(nivel.salida.x, nivel.salida.y, nivel.salida.w, nivel.salida.h);
    }
    // Dibujar entrada (si existe y está marcada como visible)
    if (nivel.entrada && nivel.entradaVisible) {
        ctx.fillStyle = nivel.entrada.color || "#e74c3c";
        ctx.fillRect(nivel.entrada.x, nivel.entrada.y, nivel.entrada.w, nivel.entrada.h);
    }

    for (let mueble of nivel.muebles) {
        ctx.fillStyle = mueble.color;
        ctx.fillRect(mueble.x, mueble.y, mueble.w, mueble.h);
    }

    // 3. DIBUJAR OBJETOS RECOGIBLES
    if (nivel.objetos) {
        for (let obj of nivel.objetos) {
            if (!obj.recogido) {
                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.arc(obj.x + obj.w/2, obj.y + obj.h/2, obj.w/2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

  // 4. DIBUJAR NPCs
    for (let npc of nivel.npcs) {
        if (npc.objImagen && npc.objImagen.complete) {
            ctx.drawImage(npc.objImagen, npc.x, npc.y, npc.w, npc.h);
        } else {
            ctx.fillStyle = npc.color;
            ctx.fillRect(npc.x, npc.y, npc.w, npc.h);
        }
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(npc.nombre, npc.x, npc.y - 5);
    }

    // 5. DIBUJAR A LARA
    if (jugador.imagen && jugador.imagen.complete) {
        ctx.drawImage(jugador.imagen, jugador.x, jugador.y, jugador.w, jugador.h);
    } else {
        ctx.fillStyle = jugador.color;
        ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);
    }
    if (lucky.activo) {
        // Si la imagen de Lucky está cargada, dibujarla; si no, usar el cuadrado de color como fallback
        if (lucky.imagen && lucky.imagen.complete && lucky.imagen.naturalWidth !== 0) {
            ctx.drawImage(lucky.imagen, lucky.x, lucky.y, lucky.w, lucky.h);
        } else {
            ctx.fillStyle = lucky.color;
            ctx.fillRect(lucky.x, lucky.y, lucky.w, lucky.h);
        }
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText("Lucky", lucky.x - 5, lucky.y - 5);
    }

    // 5. DIBUJAR A LARA (¡Al final del todo para que quede por encima!)
    if (jugador.imagen.complete && jugador.imagen.naturalWidth !== 0) {
        // Si la imagen carga bien, la dibuja
        ctx.drawImage(jugador.imagen, jugador.x, jugador.y, jugador.w, jugador.h);
    } else {
        // Si no encuentra la imagen, dibuja el cuadrado rosa
        ctx.fillStyle = jugador.color;
        ctx.fillRect(jugador.x, jugador.y, jugador.w, jugador.h);
    }
    
    // Le dejamos el nombre encima
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("Lara", jugador.x, jugador.y - 5);
}

function gameLoop() {
    actualizar();
    dibujar();
    requestAnimationFrame(gameLoop);
}

// INICIAR EL BUCLE
gameLoop();