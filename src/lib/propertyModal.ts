import { supabase } from '@lib/supabase';

export interface PropertyModalOptions {
  onPropertyCreated: (property: any) => void;
}

function esc(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function show(id: string) { const el = document.getElementById(id); if (el) el.style.display = ''; }
function hide(id: string) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

let landlordsList: any[] = [];

async function loadLandlordsForModal() {
  const { data } = await supabase.from('landlords').select('id, name').order('name');
  landlordsList = data || [];
  const sel = document.getElementById('np-landlord') as HTMLSelectElement;
  if (!landlordsList.length) {
    sel.innerHTML = '<option value="">— No landlords —</option>';
    show('no-landlords-msg');
  } else {
    hide('no-landlords-msg');
    sel.innerHTML = '<option value="">— Select landlord —</option>' +
      landlordsList.map(l => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('');
  }
}

function openModal() {
  ['np-addr1','np-addr2','np-city','np-zip','np-neighborhood','np-notes'].forEach(id => {
    (document.getElementById(id) as HTMLInputElement).value = '';
  });
  (document.getElementById('np-landlord') as HTMLSelectElement).value = '';
  hide('modal-error');
  hide('quick-landlord-form');
  document.getElementById('btn-toggle-ql')!.innerHTML =
    `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Quick-create landlord`;
  loadLandlordsForModal();
  document.getElementById('modal-backdrop')!.style.display = '';
  document.getElementById('modal-new-property')!.style.display = '';
}

function closeModal() {
  hide('modal-backdrop');
  hide('modal-new-property');
}

export function initPropertyModal(options: PropertyModalOptions): void {
  document.getElementById('btn-new-property')?.addEventListener('click', openModal);
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', closeModal);

  let qlVisible = false;
  document.getElementById('btn-toggle-ql')?.addEventListener('click', () => {
    qlVisible = !qlVisible;
    document.getElementById('quick-landlord-form')!.style.display = qlVisible ? '' : 'none';
    document.getElementById('btn-toggle-ql')!.innerHTML = qlVisible
      ? `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg> Cancel`
      : `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Quick-create landlord`;
  });

  document.getElementById('btn-create-landlord')?.addEventListener('click', async () => {
    const name  = (document.getElementById('ql-name')  as HTMLInputElement).value.trim();
    const phone = (document.getElementById('ql-phone') as HTMLInputElement).value.trim();
    const email = (document.getElementById('ql-email') as HTMLInputElement).value.trim();
    const type  = (document.getElementById('ql-type')  as HTMLSelectElement).value;
    if (!name || !phone || !email || !type) { alert('Fill in all required landlord fields.'); return; }

    const btn = document.getElementById('btn-create-landlord') as HTMLButtonElement;
    btn.disabled = true; btn.textContent = 'Creating…';

    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('landlords')
      .insert([{ name, phone, email, type, user_id: session?.user.id }])
      .select().single();

    btn.disabled = false; btn.textContent = 'Create Landlord';
    if (error) { alert('Failed to create landlord: ' + error.message); return; }

    landlordsList.push(data);
    const sel = document.getElementById('np-landlord') as HTMLSelectElement;
    sel.innerHTML = '<option value="">— Select landlord —</option>' +
      landlordsList.map(l => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('');
    sel.value = data.id;
    hide('no-landlords-msg');

    ['ql-name','ql-phone','ql-email'].forEach(id => (document.getElementById(id) as HTMLInputElement).value = '');
    (document.getElementById('ql-type') as HTMLSelectElement).value = '';
    qlVisible = false;
    hide('quick-landlord-form');
    document.getElementById('btn-toggle-ql')!.innerHTML =
      `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Quick-create landlord`;
  });

  document.getElementById('btn-modal-save')?.addEventListener('click', async () => {
    const addr1        = (document.getElementById('np-addr1')        as HTMLInputElement).value.trim();
    const addr2        = (document.getElementById('np-addr2')        as HTMLInputElement).value.trim();
    const city         = (document.getElementById('np-city')         as HTMLInputElement).value.trim();
    const zip          = (document.getElementById('np-zip')          as HTMLInputElement).value.trim();
    const neighborhood = (document.getElementById('np-neighborhood') as HTMLInputElement).value.trim();
    const notes        = (document.getElementById('np-notes')        as HTMLTextAreaElement).value.trim();
    const landlordId   = (document.getElementById('np-landlord')     as HTMLSelectElement).value;
    const npBedrooms   = (document.getElementById('np-bedrooms')     as HTMLSelectElement).value;
    const npBathrooms  = (document.getElementById('np-bathrooms')    as HTMLSelectElement).value;
    const npType       = (document.getElementById('np-type')         as HTMLSelectElement).value;

    const errEl = document.getElementById('modal-error')!;
    if (!addr1 || !city || !zip || !landlordId) {
      errEl.textContent = 'Address line 1, city, zip code, and landlord are required.';
      errEl.style.display = '';
      return;
    }
    hide('modal-error');

    const btn = document.getElementById('btn-modal-save') as HTMLButtonElement;
    btn.disabled = true; btn.textContent = 'Creating…';

    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        address_line1: addr1,
        address_line2: addr2 || null,
        city,
        zip_code: zip,
        neighborhood: neighborhood || null,
        notes: notes || null,
        landlord_id: landlordId,
        user_id: session?.user.id,
        bedrooms:      npBedrooms  ? parseInt(npBedrooms)    : null,
        bathrooms:     npBathrooms ? parseFloat(npBathrooms) : null,
        property_type: npType      || null,
      }])
      .select('*, landlord:landlords(id, name)')
      .single();

    btn.disabled = false; btn.textContent = 'Create Property';

    if (error) {
      errEl.textContent = 'Failed to create property: ' + error.message;
      errEl.style.display = '';
      return;
    }

    closeModal();
    options.onPropertyCreated(data);
  });
}
