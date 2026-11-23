const db = require('./core/db');

const announcements = [
  {
    title: '¡Bienvenidos a OrphionMC: La Gran Odisea en el Olimpo Comienza!',
    prefix: 'OFICIAL',
    is_pinned: 1,
    content: `# ⚡ ¡BIENVENIDOS A ORPHIONMC MMORPG 1.21.x!

> "Los antiguos dioses observan desde las alturas del monte sagrado. Solo aquellos de corazón indomable ascenderán a la gloria eterna."

¡Saludos, guerreros y exploradores! Nos enorgullece abrir oficialmente las puertas de **OrphionMC**, una experiencia **Survival RPG mitológica** desarrollada minuciosamente sobre la versión 1.21.x de Minecraft. Nuestro servidor combina la exploración clásica con sistemas profundos de juego de rol inspirados en las leyendas de la Antigua Grecia.

---

## 🏛️ NUESTRAS 6 CLASES LEGENDARIAS (MMOCore)
En OrphionMC cada jugador forja su propio destino a través de nuestro sistema de clases:

* **⚔️ GUERRERO**: El baluarte del frente. Especialista en combate cuerpo a cuerpo con alta resistencia física, regeneración y embestidas devastadoras.
* **🔮 MAGO**: Amo de las energías arcanas y elementales. Invoca tormentas eléctricas, ráfagas de fuego y campos de contención a distancia consumiendo maná.
* **🏹 ARQUERO**: Tirador certero y maestro de la velocidad. Dispara flechas perforantes cargadas de veneno y lluvia de proyectiles antes de que el enemigo se acerque.
* **🗡️ ASESINO**: Letal, sombrío y sigiloso. Experto en ataques por la espalda, golpes críticos mortales y desvanecimiento táctico entre las sombras.
* **🌿 CHAMÁN / SOPORTE**: El guardián espiritual del grupo. Canaliza tótems curativos, bendiciones divinas y control de masas para salvar a su hermandad.
* **🎭 BARDO (Rango VIP)**: Una clase de prestigio y maestría musical. Sus cánticos inspiran a los aliados otorgando mejoras masivas de daño, velocidad y auras protectoras.

---

## 🗺️ CÓMO EMPEZAR TU VIAJE
Comandos Esenciales:
* \`/menu\` — Abre el menú interactivo principal con acceso a todas las funciones.
* \`/spawn\` — Regresa a la Acrópolis central en cualquier momento.
* \`/perfil\` — Administra tus atributos, maestrías y árbol de habilidades.

¡Reúne a tu hermandad, afila tu acero y que los Dioses guíen tus pasos en OrphionMC!`
  },
  {
    title: 'Furia Celestial: Caída de Meteoritos y el Despertar del Kraken en Alta Mar',
    prefix: 'EVENTO',
    is_pinned: 1,
    content: `# ☄️ EVENTOS DINÁMICOS DEL MUNDO ABIERTO

> "El cielo se tiñe de carmesí y los mares rugen con cólera desatada. El mundo de OrphionMC está vivo y en constante peligro."

Para romper la monotonía del survival convencional, nuestro mundo cuenta con un ecosistema dinámico de **Eventos en Tiempo Real** que desafiarán a exploradores novatos y veteranos por igual.

---

## 🌠 1. CAÍDA DE METEORITOS & BESTIAS PREHISTÓRICAS
Periódicamente, una alarma retumbará en el cielo anunciando la caída inminente de un meteorito cósmico:
* **El Impacto**: Un bólido caerá en coordenadas aleatorias del mundo salvaje generando un cráter humeante.
* **Las Bestias**: El cráter estará custodiado por criaturas prehistóricas y aberraciones estelares de combate feroz.
* **El Botín**: Quienes derroten a las bestias podrán extraer **Fragmentos de Meteorito**, minerales celestiales y llaves para forjar equipo único.

## 🦑 2. MARES DE TERROR: EL KRAKEN Y NAVÍOS CORSARIOS
Navegar por las aguas profundas de OrphionMC requiere tripulaciones bien armadas:
* **Invasión de Barcos Piratas**: Navíos espectrales patrullan los océanos. Puedes abordarlos con tu grupo para reclamar el tesoro del capitán.
* **El Rugido del Kraken**: En medio de tormentas, los tentáculos colosales del Kraken emergerán para envolver embarcaciones desprevenidas.

## 🌪️ 3. TORNADOS EN EL DESIERTO & PESCA VIVA
* Al cruzar los desiertos áridos, mantén los ojos abiertos ante vórtices de arena que destruyen todo a su paso.
* Los pescadores disfrutarán del sistema de **Pesca Viva**: los peces saltan fuera del agua e incluso tesoros mitológicos pueden emerger con tu caña.

¡Prepárate siempre para lo inesperado!`
  },
  {
    title: 'Las Cámaras de los Dioses: Desafía a Zeus, Poseidón y Cerbero en Mazmorras Instanciadas',
    prefix: 'RAIDS',
    is_pinned: 1,
    content: `# 🏛️ MAZMORRAS INSTANCIADAS (MYTHICDUNGEONS)

> "Solo los héroes más valientes se atreven a descender a las profundidades del Tártaro o escalar los picos prohibidos del Olimpo."

Llega el sistema definitivo de cooperación y combate en equipo: **Mazmorras Instanciadas de OrphionMC**. Olvídate del robo de salas o la interferencia de otros jugadores; cada grupo ingresa a su propia instancia privada para vivir una experiencia cinematográfica.

---

## ⚡ LOS GRANDES JEFES MITOLÓGICOS (3D MODELENGINE)
Cada mazmorra culmina en una arena diseñada a medida con mecánicas y fases de combate personalizadas:
* **👑 ZEUS, SEÑOR DEL OLIMPO**: Invoca rayos en cadena, tormentas eléctricas y sobrecargas de energía. Esquivar sus áreas de choque es vital para sobrevivir.
* **🌊 POSEIDÓN, REY DE LOS OCÉANOS**: Controla tsunamis, oleadas aplastantes y remolinos de absorción que arrastran a los jugadores al fondo abisal.
* **🔥 CERBERO, GUARDIÁN DEL INFRAMUNDO**: La bestia de tres cabezas arroja fuego infernal, desgarra armaduras y persigue al miembro más vulnerable del equipo.
* **🐍 MEDUSA**: Su mirada petrifica a los incautos que no logran cubrirse a tiempo tras las columnas del templo.
* **⏳ CRONOS & ANUBIS**: Desafíos de dificultad titánica para los gremios de mayor nivel.

---

## 🛡️ SISTEMA DE PARTYS Y BOTÍN PRIVADO (ANTI-ROBO)
* **Forma tu equipo**: Usa \`/party create\` e invita a tus camaradas con \`/party invite <jugador>\`.
* **Private Drops**: Gracias a nuestra integración exclusiva, las recompensas al derrotar a los jefes se distribuyen individualmente para cada miembro del equipo. ¡Nadie podrá robar tu merecido botín legendario!
* **Dificultad Progresiva**: Desde mazmorras básicas de entrenamiento para nuevos jugadores (Cuevas 1 a 10) hasta incursiones míticas de élite.

¿Tienes lo necesario para vencer a un Dios?`
  },
  {
    title: 'La Forja Divina: Cajas Elementales 3D, Armas Legendarias y Zona AFK',
    prefix: 'UPDATE',
    is_pinned: 0,
    content: `# 🎁 CAJAS MÍTICAS ELEMENTALES & FORJA DEL OLIMPO

> "Hefesto ha avivado los fuegos sagrados de su fragua para bendecir a los mortales con artefactos de poder inigualable."

Presentamos la actualización visual y de recompensas de OrphionMC, con modelos interactivos en 3D que cobran vida ante tus ojos impulsados por **Nexo**, **ModelEngine** y **PhoenixCrates**.

---

## 🔥 LAS 4 CAJAS DE LOS ELEMENTOS PRIMORDIALES
En el centro de la Acrópolis encontrarás los altares elementales:
* **🌋 CAJA DE FUEGO (Fragua de Hefesto)**: Armas ígneas con daño residual, armaduras reforzadas con magma y cosméticos llameantes.
* **💧 CAJA DE AGUA (Abismo de Poseidón)**: Tridentes bendecidos, perlas de teletransporte rápido y elixires de apnea infinita.
* **🌱 CAJA DE TIERRA (Titanes de Gea)**: Martillos colosales con empuje tectónico, escudos de basalto y runas de regeneración.
* **🌪️ CAJA DE VIENTO (Suspiro de Éolo)**: Dagas ultrarrápidas, arcos de doble disparo y planeadores místicos.

---

## 🕊️ ZONA SAGRADA DE DESCANSO (SANTUARIO AFK)
¿Necesitas un respiro del combate?
* Visita nuestro **Santuario de Meditación AFK** con \`/afk\`.
* Mientras descansas de tus aventuras, acumularás fragmentos celestiales, orbes de experiencia y llaves elementales de forma pasiva y segura.

¡Abre las cajas, descubre tu próxima reliquia y conviértete en la envidia de todo el reino!`
  },
  {
    title: 'Leyes del Olimpo y Seguridad: Reglas de Convivencia y Vinculación Oficial',
    prefix: 'REGLAS',
    is_pinned: 0,
    content: `# 📜 NORMAS DE LA COMUNIDAD & JUEGO LIMPIO

> "Un gran reino se construye con honor, respeto y justicia entre todos sus guerreros."

Para garantizar una experiencia sana y divertida para toda nuestra comunidad, el equipo de Staff de **OrphionMC** establece las siguientes directrices obligatorias en el servidor, foro y Discord.

---

## ⚖️ LAS LEYES SAGRADAS
1. **Respeto Mutuo**: Queda prohibido el acoso, la discriminación, los insultos graves o las provocaciones tóxicas en los canales globales de chat.
2. **Juego Limpio y Cero Trampas**: El uso de clientes modificados (hacks, autoclickers, x-ray, automatizaciones ilegales) resultará en una sanción permanente e inapelable. Disponemos de sistemas automáticos de detección de trampas activos 24/7.
3. **Respeto a las Protecciones**: Queda prohibido el griefing masivo en las proximidades de terrenos protegidos (Piedras de Protección Míticas). El sistema de claims protege tu hogar; cuida quién tiene permisos en tu parcela.
4. **Comercio Seguro**: Utiliza siempre el comando \`/trade <jugador>\` para intercambiar objetos de forma segura y evitar estafas. El Staff no devolverá ítems perdidos por intercambios informales o tirados al suelo.
5. **No Abuso de Exploits / Bugs**: Cualquier fallo o exploit descubierto en la economía, mazmorras o habilidades debe ser reportado de inmediato en el foro o por ticket en Discord. El abuso intencionado acarreará reseteo de cuenta o sanción.

---

## 🛡️ CANALES OFICIALES DE SOPORTE
* **Foro de Soporte**: Utiliza la categoría de *Soporte Técnico* para dudas o problemas con tu cuenta.
* **Discord Oficial**: Abre un ticket privado para consultas sobre la tienda, vinculación o reportes con pruebas en video.

¡Gracias a todos por hacer de OrphionMC una comunidad legendaria!`
  }
];

db.get("SELECT id FROM users WHERE role = 'admin' LIMIT 1", [], (err, admin) => {
  if (err || !admin) {
    console.error("No admin user found:", err);
    process.exit(1);
  }
  const adminId = admin.id;
  console.log("Using admin user ID:", adminId);

  db.get("SELECT id FROM categories WHERE type = 'announcement' LIMIT 1", [], async (err, category) => {
    if (err || !category) {
      console.error("No announcement category found:", err);
      process.exit(1);
    }
    const catId = category.id;
    console.log("Using announcement category ID:", catId);

    for (const ann of announcements) {
      await new Promise((resolve, reject) => {
        db.get("SELECT id FROM threads WHERE category_id = ? AND title = ?", [catId, ann.title], (err, existing) => {
          if (err) return reject(err);
          if (existing) {
            console.log(`Thread '${ann.title}' already exists with ID ${existing.id}. Updating content...`);
            db.run(
              "UPDATE threads SET content = ?, prefix = ?, is_pinned = ? WHERE id = ?",
              [ann.content, ann.prefix, ann.is_pinned, existing.id],
              (err) => {
                if (err) return reject(err);
                console.log(`Thread ${existing.id} updated.`);
                resolve();
              }
            );
          } else {
            console.log(`Inserting thread '${ann.title}'...`);
            db.run(
              "INSERT INTO threads (category_id, user_id, title, content, prefix, is_pinned) VALUES (?, ?, ?, ?, ?, ?)",
              [catId, adminId, ann.title, ann.content, ann.prefix, ann.is_pinned],
              function(err) {
                if (err) return reject(err);
                console.log(`Thread created with ID ${this.lastID}`);
                resolve();
              }
            );
          }
        });
      });
    }

    console.log("All announcements processed successfully!");
    process.exit(0);
  });
});
