/* WishingASR v65.5: local backups, personal date planner and invitation-card export. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const FAVORITES_KEY = 'wishingasr-favorites';
  const PERSONAL_DATES_KEY = 'wishingasr-personal-dates-v1';

  function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      link.remove();
      throw new Error('Your browser could not start the download. Try another browser or check download permissions.');
    } finally {
      if (objectUrl) window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    }
  }

  function readFavorites() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.text === 'string').slice(0, 50) : [];
    } catch (_) {
      return [];
    }
  }

  // A portable JSON backup complements the readable TXT export already on the page.
  $('backupFavorites')?.addEventListener('click', () => {
    const items = readFavorites();
    if (!items.length) {
      $('favoriteStatus').textContent = 'There are no saved wishes to back up yet.';
      return;
    }
    const backup = {
      product: 'WishingASR',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      items: items.map((item) => ({ text: item.text, created: item.created || null }))
    };
    downloadBlob(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' }), 'wishingasr-saved-wishes-backup.json');
    $('favoriteStatus').textContent = `${items.length} saved ${items.length === 1 ? 'wish' : 'wishes'} backed up as JSON.`;
  });

  $('importFavorites')?.addEventListener('click', () => $('favoritesImportFile')?.click());
  $('favoritesImportFile')?.addEventListener('change', async (event) => {
    const input = event.currentTarget;
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('The backup is too large. Please choose a file under 1 MB.');
      const payload = JSON.parse(await file.text());
      const incoming = Array.isArray(payload) ? payload : payload && payload.product === 'WishingASR' && Array.isArray(payload.items) ? payload.items : null;
      if (!incoming) throw new Error('This does not look like a WishingASR saved-wishes backup.');
      const valid = incoming.slice(0, 200).map((item) => ({
        text: typeof item?.text === 'string' ? item.text.trim().slice(0, 10000) : '',
        created: typeof item?.created === 'string' && !Number.isNaN(Date.parse(item.created)) ? item.created : new Date().toISOString()
      })).filter((item) => item.text);
      if (!valid.length) throw new Error('The backup does not contain any valid saved wishes.');
      const combined = readFavorites();
      const seen = new Set(combined.map((item) => item.text.trim().toLocaleLowerCase()));
      let added = 0;
      valid.forEach((item) => {
        const key = item.text.toLocaleLowerCase();
        if (!seen.has(key) && combined.length < 50) {
          seen.add(key);
          combined.push(item);
          added += 1;
        }
      });
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(combined));
      $('favoriteList').innerHTML = combined.length
        ? combined.map((item, index) => `<div class="favorite-item"><p></p><div class="favorite-actions"><button class="small-button" data-copy-favorite="${index}" type="button">Copy</button><button class="small-button" data-remove="${index}" type="button" aria-label="Remove saved wish ${index + 1}">Remove</button></div></div>`).join('')
        : '<p class="tool-note">No saved wishes yet. Create a wish and tap “Save”.</p>';
      // Populate text safely; do not interpolate user backup content into HTML.
      [...$('favoriteList').querySelectorAll('.favorite-item p')].forEach((node, index) => { node.textContent = combined[index].text; });
      $('favoriteStatus').textContent = added
        ? `${added} ${added === 1 ? 'wish' : 'wishes'} restored. ${combined.length} saved wishes are now on this device.`
        : 'No new wishes were added. Duplicates were skipped or the 50-item limit was reached.';
    } catch (error) {
      $('favoriteStatus').textContent = error.message || 'Could not restore this backup.';
    } finally {
      input.value = '';
    }
  });

  // Birthday / anniversary dates are stored locally and exported as recurring ICS events.
  function isValidDateString(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const check = new Date(year, month - 1, day);
    return check.getFullYear() === year && check.getMonth() === month - 1 && check.getDate() === day;
  }

  function readPersonalDates() {
    try {
      const value = JSON.parse(localStorage.getItem(PERSONAL_DATES_KEY) || '[]');
      return Array.isArray(value) ? value.filter((item) => item && typeof item.name === 'string' && item.name.trim() && isValidDateString(item.date) && ['Birthday', 'Anniversary'].includes(item.type)).slice(0, 100) : [];
    } catch (_) {
      return [];
    }
  }

  function nextAnnualDate(dateString) {
    const parts = dateString.split('-').map(Number);
    const month = parts[1] - 1;
    const day = parts[2];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const build = (year) => {
      // Treat 29 February birthdays as 28 February in non-leap years.
      const lastDay = new Date(year, month + 1, 0).getDate();
      return new Date(year, month, Math.min(day, lastDay));
    };
    let next = build(now.getFullYear());
    if (next < now) next = build(now.getFullYear() + 1);
    return next;
  }

  function dateLabel(date) {
    return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  function renderPersonalDates() {
    const host = $('personalReminderList');
    if (!host) return;
    const items = readPersonalDates().map((item) => ({ ...item, next: nextAnnualDate(item.date) }))
      .sort((a, b) => a.next - b.next);
    if (!items.length) {
      host.innerHTML = '<p class="tool-note">No personal dates saved yet. Add a birthday or anniversary above.</p>';
      return;
    }
    host.innerHTML = items.map((item) => `<div class="favorite-item"><p><strong>${escapeHtml(item.name)}</strong><br>${escapeHtml(item.type)} · Next: ${escapeHtml(dateLabel(item.next))}</p><button class="small-button" type="button" data-remove-personal-date="${escapeHtml(item.id)}">Remove</button></div>`).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  $('addPersonalReminder')?.addEventListener('click', () => {
    const name = $('personalReminderName').value.trim();
    const type = $('personalReminderType').value;
    const date = $('personalReminderDate').value;
    if (!name || !date) {
      $('personalReminderStatus').textContent = 'Please enter a name and date.';
      return;
    }
    const parts = date.split('-').map(Number);
    const check = new Date(parts[0], parts[1] - 1, parts[2]);
    if (check.getFullYear() !== parts[0] || check.getMonth() !== parts[1] - 1 || check.getDate() !== parts[2]) {
      $('personalReminderStatus').textContent = 'Please choose a valid calendar date.';
      return;
    }
    const list = readPersonalDates();
    const duplicate = list.some((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase() && item.type === type && item.date.slice(5) === date.slice(5));
    if (duplicate) {
      $('personalReminderStatus').textContent = 'That person and annual date are already saved.';
      return;
    }
    if (list.length >= 100) {
      $('personalReminderStatus').textContent = 'The local planner can store up to 100 dates. Export your calendar before removing older entries.';
      return;
    }
    list.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: name.slice(0, 60), type, date, created: new Date().toISOString() });
    try {
      localStorage.setItem(PERSONAL_DATES_KEY, JSON.stringify(list));
      $('personalReminderName').value = '';
      renderPersonalDates();
      $('personalReminderStatus').textContent = `${type} saved on this device. Export the calendar file to add it to your calendar app.`;
    } catch (_) {
      $('personalReminderStatus').textContent = 'Browser storage is unavailable or full. Export or clear site data before trying again.';
    }
  });

  $('personalReminderList')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-personal-date]');
    if (!button) return;
    const list = readPersonalDates().filter((item) => item.id !== button.dataset.removePersonalDate);
    try {
      localStorage.setItem(PERSONAL_DATES_KEY, JSON.stringify(list));
      renderPersonalDates();
      $('personalReminderStatus').textContent = 'Date removed from this device.';
    } catch (_) {
      $('personalReminderStatus').textContent = 'Could not update local storage.';
    }
  });

  function icsEscape(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/\r\n?/g, '\\n').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }
  function toIcsDate(date) {
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  }
  $('exportPersonalReminders')?.addEventListener('click', () => {
    const list = readPersonalDates();
    if (!list.length) {
      $('personalReminderStatus').textContent = 'Save at least one birthday or anniversary first.';
      return;
    }
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//WishingASR//Personal Date Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    list.forEach((item) => {
      const start = nextAnnualDate(item.date);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
      const uid = `${item.id || Date.now()}@wishingasr.local`;
      const title = `${item.type}: ${item.name}`;
      lines.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${toIcsDate(start)}`, `DTEND;VALUE=DATE:${toIcsDate(end)}`, 'RRULE:FREQ=YEARLY', `SUMMARY:${icsEscape(title)}`, `DESCRIPTION:${icsEscape('Annual date saved with WishingASR. Exported from this browser.')}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(title)}`, 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    downloadBlob(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }), 'wishingasr-birthdays-anniversaries.ics');
    $('personalReminderStatus').textContent = `${list.length} recurring dates exported. Open the .ics file with your calendar app.`;
  });
  renderPersonalDates();

  // A share-ready invitation artwork export using the invitation's live text.
  function invitationText() {
    const title = $('inviteEvent').value.trim() || 'A Special Gathering';
    const date = $('inviteDate').value;
    const time = $('inviteTime').value;
    const place = $('invitePlace').value.trim();
    const host = $('inviteHost').value.trim();
    const formattedDate = date ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date to be confirmed';
    return `YOU’RE INVITED ✨\n\n${title}\n\nWe’d love for you to join us and make the occasion more memorable.\n\n${formattedDate}${time ? ` · ${time}` : ''}${place ? `\nVenue: ${place}` : ''}${host ? `\nHosted by: ${host}` : ''}\n\nPlease join us for a lovely time together.\nMade with WishingASR`;
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const paragraphs = String(text).replace(/\r\n?/g, '\n').split('\n');
    const output = [];
    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) { output.push(''); continue; }
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(test).width > maxWidth) { output.push(line); line = word; }
        else line = test;
      }
      if (line) output.push(line);
    }
    while (output.length && output[output.length - 1] === '') output.pop();
    return output;
  }

  async function exportInvitationCard() {
    const text = invitationText();
    const theme = $('inviteCardTheme').value;
    const format = $('inviteCardFormat').value;
    const dimensions = { story: [1080, 1920], square: [1080, 1080], landscape: [1920, 1080] }[format] || [1080, 1920];
    const palettes = {
      gold: ['#17131f', '#4a2c42', '#f4c879', '#fff8ee'],
      rose: ['#261622', '#63334b', '#ffb5c8', '#fff5f8'],
      emerald: ['#0d2421', '#214b40', '#d9c27b', '#f3fff8']
    };
    const [start, end, accent, foreground] = palettes[theme] || palettes.gold;
    if (document.fonts?.ready) await Promise.race([document.fonts.ready.catch(() => null), new Promise((resolve) => setTimeout(resolve, 700))]);
    const canvas = document.createElement('canvas');
    canvas.width = dimensions[0];
    canvas.height = dimensions[1];
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable in this browser.');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height * .32, 5, canvas.width / 2, canvas.height * .32, canvas.width * .7);
    glow.addColorStop(0, `${accent}44`);
    glow.addColorStop(1, `${accent}00`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const margin = Math.min(canvas.width, canvas.height) * .055;
    ctx.strokeStyle = `${accent}cc`;
    ctx.lineWidth = Math.max(2, canvas.width * .003);
    ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
    ctx.strokeStyle = `${accent}55`;
    ctx.lineWidth = Math.max(1, canvas.width * .0014);
    ctx.strokeRect(margin * 1.45, margin * 1.45, canvas.width - margin * 2.9, canvas.height - margin * 2.9);
    ctx.textAlign = 'center';
    ctx.fillStyle = accent;
    ctx.font = `700 ${Math.max(20, canvas.width * .027)}px Arial, sans-serif`;
    ctx.fillText('W I S H I N G A S R', canvas.width / 2, canvas.height * .17);
    const top = canvas.height * .27;
    const bottom = canvas.height * .78;
    const maxWidth = canvas.width * .74;
    let fontSize = Math.min(canvas.width * .068, canvas.height * .055);
    let lines = [];
    let lineHeight = 0;
    while (fontSize >= 24) {
      ctx.font = `600 ${fontSize}px "DM Sans", "Noto Sans Devanagari", Arial, sans-serif`;
      lines = wrapCanvasText(ctx, text, maxWidth);
      lineHeight = fontSize * 1.38;
      if (lines.length * lineHeight <= bottom - top) break;
      fontSize -= 2;
    }
    if (fontSize < 24) throw new Error('This invitation is too long for the selected design. Shorten the message or choose a taller format.');
    ctx.font = `600 ${fontSize}px "DM Sans", "Noto Sans Devanagari", Arial, sans-serif`;
    ctx.fillStyle = foreground;
    ctx.shadowColor = 'rgba(0,0,0,.22)';
    ctx.shadowBlur = 8;
    const totalHeight = lines.length * lineHeight;
    let y = top + Math.max(fontSize, (bottom - top - totalHeight) / 2 + fontSize);
    lines.forEach((line) => { ctx.fillText(line, canvas.width / 2, y, maxWidth); y += lineHeight; });
    ctx.shadowBlur = 0;
    ctx.fillStyle = accent;
    ctx.font = `500 ${Math.max(16, canvas.width * .019)}px Arial, sans-serif`;
    ctx.fillText('MADE TO SHARE JOY', canvas.width / 2, canvas.height * .88);
    const blob = await new Promise((resolve, reject) => {
      const fallback = () => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const raw = atob(dataUrl.split(',')[1]);
          const bytes = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
          resolve(new Blob([bytes], { type: 'image/png' }));
        } catch (error) { reject(error); }
      };
      try { if (canvas.toBlob) canvas.toBlob((result) => result ? resolve(result) : fallback(), 'image/png'); else fallback(); }
      catch (_) { fallback(); }
    });
    downloadBlob(blob, `wishingasr-invitation-${format}.png`);
  }

  $('downloadInviteText')?.addEventListener('click', () => {
    const text = invitationText();
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), 'wishingasr-invitation.txt');
    $('inviteStatus').textContent = 'Invitation text downloaded.';
  });
  $('downloadInviteCard')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    if (button.disabled) return;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    $('inviteStatus').textContent = 'Preparing your invitation card…';
    try {
      await exportInvitationCard();
      $('inviteStatus').textContent = 'Invitation card downloaded. Check the selected format before sharing.';
    } catch (error) {
      console.error(error);
      $('inviteStatus').textContent = error.message || 'Could not export the invitation card. Try a shorter message or another format.';
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
})();
