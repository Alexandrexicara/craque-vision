const Subscription = require('./models/subscription.model');

// Executa a cada hora: bloqueia assinaturas expiradas
async function checkExpiredSubscriptions() {
  try {
    const blocked = await Subscription.blockExpired();
    if (blocked.length > 0) {
      console.log(`🔒 ${blocked.length} assinatura(s) bloqueada(s) por expiração:`);
      blocked.forEach(s => {
        console.log(`   - Sub #${s.id} (user ${s.user_id}) expirou em ${new Date(s.expires_at).toLocaleDateString('pt-BR')}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro no scheduler de expiração:', error.message);
  }
}

// Executa imediatamente ao iniciar e depois a cada 1 hora
function startScheduler() {
  console.log('⏰ Scheduler de verificação de assinaturas iniciado (a cada 1h)');
  checkExpiredSubscriptions();
  setInterval(checkExpiredSubscriptions, 60 * 60 * 1000);
}

module.exports = { startScheduler, checkExpiredSubscriptions };
