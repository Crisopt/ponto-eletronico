// ============================================================
// LÓGICA DE DECISÃO DO PONTO
// Dado um funcionário, olha os registros dele NO DIA DE HOJE
// e decide automaticamente qual é o próximo tipo de batida.
// Sequência esperada: entrada -> saida_almoco -> volta_almoco -> saida
// ============================================================

const SEQUENCIA = ["entrada", "saida_almoco", "volta_almoco", "saida"];

const LABELS = {
  entrada: "Entrada",
  saida_almoco: "Saída para almoço",
  volta_almoco: "Volta do almoço",
  saida: "Saída (fim do turno)"
};

function inicioDoDia() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function proximoTipoDeRegistro(funcionarioId) {
  const inicio = inicioDoDia();
  const snap = await db
    .collection("registros")
    .where("funcionarioId", "==", funcionarioId)
    .where("timestamp", ">=", inicio)
    .orderBy("timestamp", "asc")
    .get();

  const registrosHoje = snap.docs.map((d) => d.data());

  if (registrosHoje.length >= SEQUENCIA.length) {
    return null; // já completou os 4 pontos do dia
  }
  return SEQUENCIA[registrosHoje.length];
}

async function registrarPonto(funcionario, deviceId, lojaId) {
  const tipo = await proximoTipoDeRegistro(funcionario.id);

  if (!tipo) {
    return { ok: false, motivo: "JORNADA_COMPLETA" };
  }

  await db.collection("registros").add({
    funcionarioId: funcionario.id,
    funcionarioNome: funcionario.nome,
    lojaId: lojaId,
    deviceId: deviceId,
    tipo: tipo,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  return { ok: true, tipo, label: LABELS[tipo] };
}
