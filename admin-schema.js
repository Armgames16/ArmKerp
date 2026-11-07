/* Admin privilege and account suspension state. No first-run default admin. */
const db=require('./database');
db.exec(`CREATE TABLE IF NOT EXISTS admin_users(user_id INTEGER PRIMARY KEY,granted_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS admin_suspensions(user_id INTEGER PRIMARY KEY,reason TEXT NOT NULL,created_at INTEGER NOT NULL,actor_id INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS admin_audit(id INTEGER PRIMARY KEY AUTOINCREMENT,actor_id INTEGER NOT NULL,action TEXT NOT NULL,target_id INTEGER,created_at INTEGER NOT NULL);`);
module.exports=db;
