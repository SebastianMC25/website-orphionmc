const db = require('./core/db');

const title = 'Eventos del Servidor: Guía Completa de Sistemas en Vivo';
const prefix = 'EVENTOS';
const content = `# ⚡ GUÍA OFICIAL: EVENTOS DINÁMICOS DEL SERVIDOR

> "El mundo de OrphionMC no es un páramo estático. Peligros celestiales, bestias abisales y caravanas itinerantes cobran vida a tu alrededor."

Para ofrecer una experiencia Survival RPG inmersiva y única, nuestro servidor cuenta con un ecosistema completo de **12 eventos y sistemas dinámicos** programados en tiempo real. Ya sea que estés explorando a pie, navegando por los mares profundos o sobrevolando los cielos de Grimdar, el entorno reacciona a tus acciones.

---

> 📖 **ACCEDE A LA WIKI OFICIAL DE EVENTOS**
> Para conocer las estadísticas detalladas, recompensas de botín y ver los **videos cinemáticos grabados directamente en el servidor real**, visita nuestra guía interactiva:
> 👉 **[Entrar a la Wiki de Eventos del Servidor](wiki/eventos.html)**

---

## 🌪️ EVENTOS CLIMÁTICOS & TERRESTRES

* **☄️ Caída de Meteorito & Furia Prehistórica (\`meteor_dino\`)**:
  Un bólido ardiente surca los cielos y se estrella en coordenadas aleatorias del mundo salvaje. El cráter humeante expone minerales cósmicos raros, custodiados ferozmente por dinosaurios y bestias de combate que defienden el impacto.
* **🌪️ Vórtice del Desierto (\`desierto_tornado\`)**:
  Al cruzar los biomas áridos, torbellinos de arena repentinos generan una poderosa fuerza de succión gravitatoria. Los exploradores desprevenidos son absorbidos hacia el ojo del tornado y expulsados por los aires sufriendo daño de asfixia y caída.
* **👺 Emboscadas de Goblins (\`goblins\`)**:
  Criaturas astutas y codiciosas aguardan escondidas en los accesos y senderos de los bosques. Al dejar de correr o descansar, pueden saltar en grupo para intentar saquearte o soltar jugosas bolsas de oro si logras repelerlos.
* **📯 El Cuerno de Caza Ancestral (\`randomspawn\`)**:
  Al explorar los rincones más salvajes o al hacer sonar el Cuerno de Caza, la tierra tiembla y hordas de criaturas mitológicas son convocadas en oleadas progresivas para poner a prueba tu temple guerrero.

---

## 🌊 EVENTOS MARÍTIMOS & EN ALTA MAR

* **🦑 El Despertar del Kraken (\`kraken\`)**:
  Durante las noches de tormenta en aguas de océano profundo, el mítico Kraken emerge desde el abismo. Sus colosales tentáculos rodean y azotan tu embarcación; sólo las tripulaciones más coordinadas lograrán sobrevivir a su furia marina.
* **⚔️ Combate Naval de Barcos Corsarios (\`barco\`)**:
  Naves piratas espectrales patrullan las rutas comerciales marítimas. Puedes maniobrar para abordarlos en pleno mar, limpiar la cubierta enemiga y reclamar el botín del cofre del capitán.
* **🌊 Oleaje Feroz & Físicas de Navegación (\`olas\`)**:
  El océano cuenta con físicas de marea dinámicas. Olas gigantescas y corrientes impredecibles sacudirán tu nave, requiriendo pericia náutica para no zozobrar en mitad de una tempestad.
* **⛵ Encuentros Aleatorios en Bote (\`randomspawn_bote\`)**:
  Incursiones marinas espontáneas mientras surcas los mares: restos de naufragios flotantes, monstruos de las profundidades y tesoros a la deriva que recompensan la exploración naval.
* **🎣 Pesca Dinámica Viva (\`pesca_viva\`)**:
  La pesca tradicional ha sido rediseñada mediante integración física. Al tirar de tu caña, los peces saltan fuera del agua hacia tus manos o emergen criaturas y monstruos marinos de combate disparados directamente desde el agua hacia el pescador.

---

## 🎪 EVENTOS SOCIALES & CAZA AÉREA

* **🎪 El Gran Circo Itinerante (\`circo_evento\`)**:
  Cada 60 minutos, una caravana mágica ambulante se traslada entre las principales ciudades de OrphionMC (*Nitromia*, *Atir*, *Agnar*, *Lubeck* y *Pueblonorte*). Ofrece desafíos de habilidad, fuegos artificiales, comerciantes ambulantes y recompensas exclusivas por tiempo limitado.
* **🐉 Caza Aérea de Dragones (\`caza_aerea_dragones\`)**:
  En el reino de Grimdar a gran altitud, los cielos pertenecen a los Dragones Celestiales y Colosos Alados. Al surcar los cielos con tus monturas voladoras o rutas de vuelo, entrarás en combate aéreo tridimensional en tiempo real.
* **🎈 Globos Aerostáticos de Suministros (\`globos\`)**:
  Globos flotantes atraviesan los horizontes de Grimdar soltando cargamentos de suministros, planos de forja y pociones especiales para los aventureros que sigan su trayectoria.

---

> 💡 **RECUERDA**: Para ver las cinemáticas de cada uno de estos 12 sistemas en acción, consulta la **[Wiki de Eventos del Servidor](wiki/eventos.html)**. ¡Prepara tus armas y que los Dioses te acompañen en cada expedición!`;

db.run(
  "UPDATE threads SET title = ?, prefix = ?, content = ? WHERE id = 2",
  [title, prefix, content],
  function(err) {
    if (err) {
      console.error("Error updating thread 2:", err);
      process.exit(1);
    }
    console.log(`Thread 2 updated successfully! Rows changed: ${this.changes}`);
    process.exit(0);
  }
);
