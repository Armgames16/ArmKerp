/* Run only locally: npm run admin:grant -- <existing-username> */
const db=require('./admin-schema');
const name=process.argv[2];
if(!name){console.error('Usage: npm run admin:grant -- <existing-username>');process.exit(1);}
const user=db.prepare('SELECT id,username FROM users WHERE username=?').get(name);
if(!user){console.error('Existing account not found. Register and log in first.');process.exit(1);}
db.prepare('INSERT OR IGNORE INTO admin_users(user_id,granted_at) VALUES(?,?)').run(user.id,Date.now());
console.log('Admin role granted to '+user.username+'. Keep access to this computer private.');
