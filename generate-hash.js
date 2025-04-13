const bcrypt = require('bcryptjs');

const password = 'Bepro-034056036';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log('New hash:', hash);