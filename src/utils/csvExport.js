/**
 * Helper function to parse dates into YYYY-MM-DD string
 */
export const getDayKey = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Export daily usage and print statistics to CSV file
 * @param {Array} rawHistoryData - Array of objects with { date, sessions_count, selections_count }
 */
export const exportDailyHistoryCSV = (rawHistoryData) => {
  if (!rawHistoryData || rawHistoryData.length === 0) {
    alert("Nessun dato storico disponibile per l'esportazione.");
    return;
  }

  const historyMap = {};
  const parsedDates = [];

  rawHistoryData.forEach(item => {
    const key = getDayKey(item.date);
    if (key) {
      historyMap[key] = item;
    }
    const d = new Date(item.date);
    if (!isNaN(d.getTime())) {
      parsedDates.push(d);
    }
  });

  let endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  if (parsedDates.length > 0) {
    const maxParsed = new Date(Math.max(...parsedDates));
    if (maxParsed > endDate) endDate = new Date(maxParsed);
  }

  let startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);
  if (parsedDates.length > 0) {
    const minParsed = new Date(Math.min(...parsedDates));
    minParsed.setHours(0, 0, 0, 0);
    if (minParsed < startDate) {
      startDate = new Date(minParsed);
    }
  }

  const rows = [
    ["Data (Date)", "Sessioni Create - Utilizzo (Sessions)", "Richieste Stampa (Print Requests)"]
  ];

  let curr = new Date(startDate);
  while (curr <= endDate) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    const existing = historyMap[key];

    const sCount = existing ? (existing.sessions_count || 0) : 0;
    const pCount = existing ? (existing.selections_count || 0) : 0;

    rows.push([key, sCount, pCount]);

    curr.setDate(curr.getDate() + 1);
  }

  const csvString = "\uFEFF" + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `nexthouse_utilizzo_e_stampe_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export detailed print selections list to CSV file
 * @param {Array} selections - Array of print selection objects
 */
export const exportSelectionsCSV = (selections) => {
  if (!selections || selections.length === 0) {
    alert("Nessuna richiesta di stampa disponibile per l'esportazione.");
    return;
  }

  const rows = [
    ["ID", "Data e Ora (Date/Time)", "Nome Ospite (Guest Name)", "Numero Prenotazione (Booking Number)", "Stato (Status)", "Numero Foto (Photo Count)"]
  ];

  selections.forEach(sel => {
    let nameStr = sel.name || '';
    let guestName = nameStr;
    let bookingNum = '';
    if (nameStr.includes(' | Booking: ')) {
      const parts = nameStr.split(' | Booking: ');
      guestName = parts[0];
      bookingNum = parts[1] || '';
    }

    const photoCount = Array.isArray(sel.photo_ids) ? sel.photo_ids.length : (Array.isArray(sel.photos) ? sel.photos.length : 0);
    const dateStr = sel.created_at ? new Date(sel.created_at).toLocaleString() : '';

    rows.push([
      sel.id,
      dateStr,
      guestName,
      bookingNum,
      sel.status || 'pending',
      photoCount
    ]);
  });

  const csvString = "\uFEFF" + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `nexthouse_richieste_stampa_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
