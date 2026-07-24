const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const STATUS_COLORS = {
  'Planejada': '#2477A8',
  'Em andamento': '#D97706',
  'Concluída': '#168557',
  'Pausada': '#B83B45'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatarData(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');
  const [year, month, day] = date.toISOString().slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function mapaUrl(localizacao) {
  if (!localizacao || typeof localizacao.lat !== 'number' || typeof localizacao.long !== 'number') return '';
  return `https://www.google.com/maps?q=${localizacao.lat},${localizacao.long}`;
}

function dataUriToBuffer(dataUri) {
  if (typeof dataUri !== 'string' || !dataUri.startsWith('data:')) return null;
  const match = dataUri.match(/^data:(image\/(?:png|jpeg|jpg));base64,(.+)$/);
  if (!match) return null;
  return { type: match[1].includes('png') ? 'png' : 'jpg', buffer: Buffer.from(match[2], 'base64') };
}

function wrapText(text, maxLength = 85) {
  const words = String(text ?? '').split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function addPdfText(page, font, text, x, y, size = 11, color = rgb(0.12, 0.23, 0.34)) {
  page.drawText(String(text ?? ''), { x, y, size, font, color });
  return y - size - 7;
}

async function gerarPdf(obra, fiscalizacoes) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595;
  const margin = 42;
  const navy = rgb(0.09, 0.23, 0.34);
  const green = rgb(0.09, 0.52, 0.34);

  let page = pdf.addPage([pageWidth, 842]);
  let y = 790;
  page.drawRectangle({ x: margin, y: y - 42, width: 42, height: 42, color: green });
  page.drawText('CO', { x: margin + 7, y: y - 27, size: 15, font: bold, color: rgb(1, 1, 1) });
  page.drawText('Cadastro de Obras', { x: margin + 56, y: y - 20, size: 22, font: bold, color: navy });
  y -= 78;
  y = addPdfText(page, bold, 'RELATÓRIO DA OBRA', margin, y, 12, green);
  y = addPdfText(page, bold, obra.nome, margin, y, 25, navy);
  y = addPdfText(page, regular, `Gerado em ${formatarData(new Date())}`, margin, y - 3, 10, rgb(0.42, 0.5, 0.56));
  y -= 10;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.86, 0.9, 0.88) });
  y -= 28;
  y = addPdfText(page, bold, `Status: ${obra.status || 'Em andamento'}`, margin, y, 12, green);
  y = addPdfText(page, regular, `Responsável: ${obra.responsavel}`, margin, y, 12);
  y = addPdfText(page, regular, `Período: ${formatarData(obra.dataInicio)} até ${formatarData(obra.dataFim)}`, margin, y, 12);
  y -= 8;
  y = addPdfText(page, bold, 'Descrição da obra', margin, y, 13, navy);
  for (const line of wrapText(obra.descricao, 82)) y = addPdfText(page, regular, line, margin, y, 11);
  if (obra.localizacao) {
    y -= 8;
    y = addPdfText(page, bold, 'Localização', margin, y, 13, navy);
    y = addPdfText(page, regular, `Latitude: ${obra.localizacao.lat} | Longitude: ${obra.localizacao.long}`, margin, y, 11);
    y = addPdfText(page, regular, mapaUrl(obra.localizacao), margin, y, 9, rgb(0.12, 0.45, 0.65));
  }
  const obraPhoto = dataUriToBuffer(obra.foto);
  if (obraPhoto && y > 220) {
    try {
      const image = obraPhoto.type === 'png' ? await pdf.embedPng(obraPhoto.buffer) : await pdf.embedJpg(obraPhoto.buffer);
      const scale = Math.min(360 / image.width, 180 / image.height);
      page.drawImage(image, { x: margin, y: y - image.height * scale, width: image.width * scale, height: image.height * scale });
      y -= image.height * scale + 18;
    } catch (_) {}
  }

  y -= 12;
  y = addPdfText(page, bold, `Fiscalizações (${fiscalizacoes.length})`, margin, y, 16, navy);
  for (const fiscalizacao of fiscalizacoes) {
    if (y < 130) { page = pdf.addPage([pageWidth, 842]); y = 790; }
    y = addPdfText(page, bold, `${formatarData(fiscalizacao.data)} — ${fiscalizacao.status}`, margin, y, 12, green);
    y = addPdfText(page, regular, `Observações: ${fiscalizacao.observacoes}`, margin, y, 10);
    if (fiscalizacao.localizacao) y = addPdfText(page, regular, `GPS: ${fiscalizacao.localizacao.lat}, ${fiscalizacao.localizacao.long}`, margin, y, 9);
    y -= 8;
  }
  for (const fiscalizacao of fiscalizacoes) {
    const photo = dataUriToBuffer(fiscalizacao.foto);
    if (!photo) continue;
    page = pdf.addPage([pageWidth, 842]);
    y = 790;
    y = addPdfText(page, bold, 'Registro fotográfico', margin, y, 16, navy);
    y = addPdfText(page, regular, `${formatarData(fiscalizacao.data)} — ${fiscalizacao.status}`, margin, y, 11);
    try {
      const image = photo.type === 'png' ? await pdf.embedPng(photo.buffer) : await pdf.embedJpg(photo.buffer);
      const scale = Math.min(500 / image.width, 560 / image.height);
      page.drawImage(image, { x: margin, y: y - image.height * scale, width: image.width * scale, height: image.height * scale });
    } catch (_) {}
  }
  const bytes = await pdf.save();
  return Buffer.from(bytes).toString('base64');
}

function gerarHtml(obra, fiscalizacoes) {
  const status = obra.status || 'Em andamento';
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS['Em andamento'];
  const location = mapaUrl(obra.localizacao);
  const fiscalHtml = fiscalizacoes.length
    ? fiscalizacoes.map((fiscalizacao) => {
        const color = STATUS_COLORS[fiscalizacao.status] || '#64748B';
        const photo = typeof fiscalizacao.foto === 'string' && fiscalizacao.foto.startsWith('data:image/')
          ? `<img src="${fiscalizacao.foto}" alt="Foto da fiscalização" style="max-width:240px;border-radius:10px;margin-top:12px;display:block;" />`
          : '';
        return `<div style="border:1px solid #e3ece8;border-radius:12px;padding:16px;margin:12px 0;">
          <div><strong>${formatarData(fiscalizacao.data)}</strong>
          <span style="background:${color}18;color:${color};padding:5px 9px;border-radius:999px;margin-left:8px;font-weight:700;">${escapeHtml(fiscalizacao.status)}</span></div>
          <p><strong>Observações:</strong> ${escapeHtml(fiscalizacao.observacoes)}</p>
          ${fiscalizacao.localizacao ? `<p><strong>GPS:</strong> ${fiscalizacao.localizacao.lat}, ${fiscalizacao.localizacao.long}</p>` : ''}
          ${photo}
        </div>`;
      }).join('')
    : '<p style="color:#718096;">Nenhuma fiscalização cadastrada.</p>';

  return `<!doctype html><html><body style="margin:0;background:#f4f8f6;font-family:Arial,sans-serif;color:#183b56;">
  <div style="max-width:720px;margin:auto;background:#fff;">
    <div style="background:#147a50;padding:28px 32px;color:#fff;"><span style="display:inline-block;background:#fff;color:#147a50;border-radius:12px;padding:10px;font-weight:800;margin-right:10px;">CO</span><strong style="font-size:24px;">Cadastro de Obras</strong><div style="margin-top:22px;font-size:28px;font-weight:800;">${escapeHtml(obra.nome)}</div><span style="display:inline-block;background:${statusColor};padding:7px 12px;border-radius:999px;margin-top:10px;font-weight:700;">${escapeHtml(status)}</span></div>
    <div style="padding:28px 32px;">
      <p><strong>Responsável:</strong> ${escapeHtml(obra.responsavel)}</p>
      <p><strong>Período:</strong> ${formatarData(obra.dataInicio)} até ${formatarData(obra.dataFim)}</p>
      <p><strong>Descrição da obra:</strong> ${escapeHtml(obra.descricao)}</p>
      ${obra.localizacao ? `<p><strong>Localização:</strong> ${obra.localizacao.lat}, ${obra.localizacao.long} — <a href="${location}">Abrir no Google Maps</a></p>` : ''}
      ${obra.foto && obra.foto.startsWith('data:image/') ? `<img src="${obra.foto}" alt="Foto da obra" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;" />` : ''}
      <hr style="border:0;border-top:1px solid #e3ece8;margin:28px 0;">
      <h2>Fiscalizações da obra <span style="color:#718096;font-size:16px;">(${fiscalizacoes.length})</span></h2>
      ${fiscalHtml}
    </div>
    <div style="background:#f4f8f6;padding:18px 32px;color:#718096;font-size:12px;">Cadastro de Obras · Relatório gerado em ${formatarData(new Date())}</div>
  </div></body></html>`;
}

async function gerarRelatorio(obra, fiscalizacoes) {
  return { html: gerarHtml(obra, fiscalizacoes), pdfBase64: await gerarPdf(obra, fiscalizacoes) };
}

module.exports = { gerarRelatorio, formatarData };
