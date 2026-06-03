const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const numero = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const numero4 = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4
});

let ultimaSimulacao = null;

function valor(id) {
  const element = document.getElementById(id);
  return Number(String(element.value).replace(',', '.')) || 0;
}

function texto(id) {
  return document.getElementById(id).value.trim();
}

function hojeBR() {
  return new Date().toLocaleDateString('pt-BR');
}

function anoAtual() {
  return new Date().getFullYear();
}

function setText(id, content) {
  const element = document.getElementById(id);
  if (element) element.textContent = content;
}

function gerarNumeroOrcamento() {
  const ano = anoAtual();
  const chave = `cim-asfalto-sequencial-${ano}`;
  const ultimo = Number(localStorage.getItem(chave)) || 0;
  const proximo = ultimo + 1;
  localStorage.setItem(chave, String(proximo));
  return `CIM-ASF-${ano}-${String(proximo).padStart(5, '0')}`;
}

function montarAlertasTecnicos({espessuraCm, distancia, area}) {
  const alertas = [];

  if (espessuraCm < 3) {
    alertas.push('Espessuras inferiores a 3 cm normalmente são utilizadas apenas em situações específicas de reperfilagem.');
  }

  if (distancia > 100) {
    alertas.push('Grandes distâncias podem impactar a logística e a temperatura de aplicação da massa asfáltica.');
  }

  if (area < 500) {
    alertas.push('Obras de pequena dimensão podem apresentar custo unitário superior à média, em razão da mobilização operacional.');
  }

  const box = document.getElementById('alertasTecnicos');

  if (!alertas.length) {
    box.className = 'alert-box ok';
    box.innerHTML = 'Sem alertas técnicos automáticos para os parâmetros informados.';
    return [];
  }

  box.className = 'alert-box';
  box.innerHTML = `<strong>Alertas técnicos:</strong><ul>${alertas.map(a => `<li>${a}</li>`).join('')}</ul>`;
  return alertas;
}

document.getElementById('calcForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const numeroOrcamento = gerarNumeroOrcamento();

  const municipio = texto('municipio');
  const obra = texto('obra');
  const local = texto('local');

  const responsavelNome = texto('responsavelNome');
  const responsavelCargo = texto('responsavelCargo');
  const responsavelSecretaria = texto('responsavelSecretaria');
  const responsavelEmail = texto('responsavelEmail');
  const responsavelTelefone = texto('responsavelTelefone');

  const extensao = valor('extensao');
  const largura = valor('largura');
  const espessuraCm = valor('espessura');
  const distancia = valor('distancia');
  const precoTon = valor('precoTon');
  const precoKmTon = valor('precoKmTon');
  const densidade = valor('densidade');

  const espessuraM = espessuraCm / 100;
  const area = extensao * largura;
  const volume = area * espessuraM;
  const toneladas = volume * densidade;
  const valorCbuq = toneladas * precoTon;
  const qtdTransporte = toneladas * distancia;
  const valorTransporte = qtdTransporte * precoKmTon;
  const total = valorCbuq + valorTransporte;

  const extensaoKm = extensao / 1000;
  const custoM2 = area > 0 ? total / area : 0;
  const custoMetroLinear = extensao > 0 ? total / extensao : 0;
  const custoKmVia = extensaoKm > 0 ? total / extensaoKm : 0;
  const consumoM2 = area > 0 ? toneladas / area : 0;
  const toneladasKm = extensaoKm > 0 ? toneladas / extensaoKm : 0;

  const alertas = montarAlertasTecnicos({espessuraCm, distancia, area});

  ultimaSimulacao = {
    numeroOrcamento, municipio, obra, local,
    responsavelNome, responsavelCargo, responsavelSecretaria, responsavelEmail, responsavelTelefone,
    extensao, largura, espessuraCm, espessuraM, distancia, precoTon, precoKmTon, densidade,
    area, volume, toneladas, valorCbuq, qtdTransporte, valorTransporte, total,
    extensaoKm, custoM2, custoMetroLinear, custoKmVia, consumoM2, toneladasKm, alertas
  };

  setText('numeroOrcamento', numeroOrcamento);
  setText('area', numero.format(area));
  setText('volume', numero.format(volume));
  setText('toneladas', numero.format(toneladas));
  setText('custoM2', moeda.format(custoM2));
  setText('custoMetroLinear', moeda.format(custoMetroLinear));
  setText('custoKmVia', moeda.format(custoKmVia));
  setText('consumoM2', numero4.format(consumoM2));
  setText('toneladasKm', numero.format(toneladasKm));

  setText('calcCbuq', `${numero.format(toneladas)} t × ${moeda.format(precoTon)}`);
  setText('calcTransporte', `${numero.format(toneladas)} t × ${numero.format(distancia)} km × ${moeda.format(precoKmTon)}`);
  setText('valorCbuq', moeda.format(valorCbuq));
  setText('valorTransporte', moeda.format(valorTransporte));
  setText('total', moeda.format(total));

  setText('pNumeroOrcamento', `${numeroOrcamento} — SIMULAÇÃO PRELIMINAR`);
  setText('pMunicipio', municipio || '-');
  setText('pObra', obra || '-');
  setText('pLocal', local || '-');
  setText('pData', hojeBR());

  setText('pResponsavelNome', responsavelNome || '-');
  setText('pResponsavelCargo', responsavelCargo || '-');
  setText('pResponsavelSecretaria', responsavelSecretaria || '-');
  setText('pResponsavelEmail', responsavelEmail || '-');
  setText('pResponsavelTelefone', responsavelTelefone || '-');

  setText('pExtensao', `${numero.format(extensao)} m`);
  setText('pLargura', `${numero.format(largura)} m`);
  setText('pEspessura', `${numero.format(espessuraCm)} cm (${numero.format(espessuraM)} m)`);
  setText('pDistancia', `${numero.format(distancia)} km`);
  setText('pDensidade', `${numero.format(densidade)} t/m³`);

  setText('pMemArea', `${numero.format(extensao)} m × ${numero.format(largura)} m`);
  setText('pArea', `${numero.format(area)} m²`);

  setText('pMemVolume', `${numero.format(area)} m² × ${numero.format(espessuraM)} m`);
  setText('pVolume', `${numero.format(volume)} m³`);

  setText('pMemToneladas', `${numero.format(volume)} m³ × ${numero.format(densidade)} t/m³`);
  setText('pToneladas', `${numero.format(toneladas)} t`);

  setText('pMemCustoM2', `${moeda.format(total)} ÷ ${numero.format(area)} m²`);
  setText('pCustoM2', `${moeda.format(custoM2)} por m²`);

  setText('pMemCustoMetroLinear', `${moeda.format(total)} ÷ ${numero.format(extensao)} m`);
  setText('pCustoMetroLinear', `${moeda.format(custoMetroLinear)} por metro linear`);

  setText('pMemCustoKmVia', `${moeda.format(total)} ÷ ${numero.format(extensaoKm)} km`);
  setText('pCustoKmVia', `${moeda.format(custoKmVia)} por quilômetro de via`);

  setText('pMemConsumoM2', `${numero.format(toneladas)} t ÷ ${numero.format(area)} m²`);
  setText('pConsumoM2', `${numero4.format(consumoM2)} t/m²`);

  setText('pMemToneladasKm', `${numero.format(toneladas)} t ÷ ${numero.format(extensaoKm)} km`);
  setText('pToneladasKm', `${numero.format(toneladasKm)} t/km`);

  setText('pQtdCbuq', numero.format(toneladas));
  setText('pPrecoTon', moeda.format(precoTon));
  setText('pValorCbuq', moeda.format(valorCbuq));

  setText('pQtdTransporte', numero.format(qtdTransporte));
  setText('pPrecoKmTon', moeda.format(precoKmTon));
  setText('pValorTransporte', moeda.format(valorTransporte));

  setText('pTotal', moeda.format(total));
});

function enviarSolicitacaoCIM() {
  if (!ultimaSimulacao) {
    alert('Primeiro preencha os dados e clique em CALCULAR.');
    return;
  }

  const s = ultimaSimulacao;
  const assunto = `Solicitação de Orçamento Oficial - ${s.numeroOrcamento}`;

  const corpo = `Solicitação de Orçamento Oficial - Usina de Asfalto do CIM

Número da simulação: ${s.numeroOrcamento} - SIMULAÇÃO PRELIMINAR
Data: ${hojeBR()}

Município: ${s.municipio}
Obra: ${s.obra}
Local/Rua: ${s.local}

Responsável pela solicitação:
Nome: ${s.responsavelNome}
Cargo: ${s.responsavelCargo}
Secretaria: ${s.responsavelSecretaria}
E-mail: ${s.responsavelEmail}
Telefone: ${s.responsavelTelefone}

Dados técnicos:
Extensão: ${numero.format(s.extensao)} m
Largura média: ${numero.format(s.largura)} m
Espessura: ${numero.format(s.espessuraCm)} cm
Distância da usina: ${numero.format(s.distancia)} km
Densidade adotada: ${numero.format(s.densidade)} t/m³

Quantitativos:
Área: ${numero.format(s.area)} m²
Volume: ${numero.format(s.volume)} m³
Massa estimada: ${numero.format(s.toneladas)} t

Orçamento estimado:
CBUQ Faixa B aplicado: ${moeda.format(s.valorCbuq)}
Transporte: ${moeda.format(s.valorTransporte)}
Total estimado: ${moeda.format(s.total)}

Indicadores:
Custo por m²: ${moeda.format(s.custoM2)}
Custo por metro linear: ${moeda.format(s.custoMetroLinear)}
Custo por quilômetro de via: ${moeda.format(s.custoKmVia)}
Consumo de CBUQ por m²: ${numero4.format(s.consumoM2)} t/m²
Toneladas por km: ${numero.format(s.toneladasKm)} t/km

Alertas técnicos:
${s.alertas.length ? s.alertas.map(a => `- ${a}`).join('\n') : 'Sem alertas técnicos automáticos.'}

Solicitamos análise técnica e emissão de orçamento oficial pelo CIM.

Observação: a presente simulação possui caráter preliminar e não substitui análise técnica, vistoria, projeto executivo, processo administrativo, empenho, transferência, programação operacional ou orçamento oficial emitido pelo CIM.`;

  const mailto = `mailto:engenharia@cimamurel.sc.gov.br?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  window.location.href = mailto;
}
