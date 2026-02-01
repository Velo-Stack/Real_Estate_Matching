const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');
(async()=>{
  try{
    const user = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    console.log('user:', user && { id: user.id, email: user.email, role: user.role, status: user.status });
    const isValid = await bcrypt.compare('password123', user.password);
    console.log('password ok?', isValid);
  }catch(err){
    console.error('err', err);
  } finally{ await prisma.$disconnect(); }
})();
