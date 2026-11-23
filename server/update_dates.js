const db = require('./core/db');

const updates = [
  { id: 1, date: '2026-08-15 14:00:00', views: 0 }, // Bienvenidos (hace ~3 meses)
  { id: 5, date: '2026-08-28 17:30:00', views: 0 }, // Normativa y Leyes (finales de agosto)
  { id: 3, date: '2026-09-25 19:15:00', views: 0 }, // Mazmorras & Jefes (septiembre)
  { id: 4, date: '2026-10-22 18:40:00', views: 0 }, // Cajas Elementales (octubre)
  { id: 2, date: '2026-11-16 20:10:00', views: 0 }, // Eventos Meteoritos & Kraken (noviembre)
];

(async () => {
  for (const item of updates) {
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE threads SET created_at = ?, views = ? WHERE id = ?",
        [item.date, item.views, item.id],
        function(err) {
          if (err) return reject(err);
          console.log(`Thread ${item.id} updated with date ${item.date} and ${item.views} views.`);
          resolve();
        }
      );
    });
  }

  console.log("All thread dates updated successfully!");
  process.exit(0);
})();
