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

// Distância máxima aceitável (em metros) entre o celular e a loja no momento da batida
const RAIO_PERMITIDO_METROS = 150;

function inicioDoDia() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------- GEOLOCALIZAÇÃO ----------
function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000; // raio da Terra em metros
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function obterLocalizacaoAtual() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocalização não suportada neste navegador."));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    });
  });
}

// ---------- REGISTRO DO PONTO ----------
async function proximoTipoDeRegistro(funcionarioId) {
  const inicio = inicioDoDia();

  // Consulta só com IGUALDADE (funcionarioId) — não precisa de índice composto.
  // O filtro por data e a ordenação são feitos aqui no JavaScript.
  const snap = await db
    .collection("registros")
    .where("funcionarioId", "==", funcionarioId)
    .get();

  const registrosHoje = snap.docs
    .map((d) => d.data())
    .filter((r) => r.timestamp && r.timestamp.toDate() >= inicio)
    .sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

  if (registrosHoje.length >= SEQUENCIA.length) {
    return null; // já completou os 4 pontos do dia
  }
  return SEQUENCIA[registrosHoje.length];
}

// coords (opcional): { latitude, longitude } do celular no momento da batida
async function registrarPonto(funcionario, deviceId, lojaId, coords = null) {
  const tipo = await proximoTipoDeRegistro(funcionario.id);

  if (!tipo) {
    return { ok: false, motivo: "JORNADA_COMPLETA" };
  }

  const dados = {
    funcionarioId: funcionario.id,
    funcionarioNome: funcionario.nome,
    lojaId: lojaId,
    deviceId: deviceId,
    tipo: tipo,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (coords && coords.latitude != null && coords.longitude != null) {
    dados.latitude = coords.latitude;
    dados.longitude = coords.longitude;
  }

  await db.collection("registros").add(dados);

  return { ok: true, tipo, label: LABELS[tipo] };
}
