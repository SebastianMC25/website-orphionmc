const db = require('./core/db');

// Reset artificial views to 0 so all views tracked are 100% genuine and real
db.run("UPDATE threads SET views = 0", [], function(err) {
  if (err) {
    console.error("Error resetting views:", err);
    process.exit(1);
  }
  console.log(`Reset views to 0 for ${this.changes} threads. Views are now real.`);
  
  db.all("SELECT id, title, views FROM threads", [], (err, rows) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("Current real views:", rows);
    process.exit(0);
  });
});
