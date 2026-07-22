const config = window.SITE_CONFIG || {};
const configured = config.supabaseUrl && !config.supabaseUrl.includes('TU-PROYECTO') && config.supabaseAnonKey && !config.supabaseAnonKey.includes('TU_CLAVE');
const supabase = configured ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

const defaultServices = [
  { title: 'Maternidad', description: 'Una experiencia tranquila y cuidada para celebrar esta etapa.' },
  { title: 'Recién nacidos', description: 'Los primeros días, retratados con una mirada suave y atemporal.' },
  { title: 'Familia', description: 'Conexiones reales y memorias compartidas para volver a ellas siempre.' }
];
const defaultProducts = [
  { name: 'Fotografías impresas', description: 'Copias seleccionadas en tamaños 15×22 y 6×9 cm.' },
  { name: 'Retablos', description: 'Piezas para llenar de historia tus espacios.' },
  { name: 'Books y fotobooks', description: 'Una secuencia impresa para revivir cada detalle.' }
];
// Transcripción fiel de MATERNAS.jpg entregada por la cliente. No modificar precios sin autorización.
const defaultPrices = [
  { name: 'Sesión “Luz”', description: '2 tomas a elegir para: (1) fotos 15x22 + (1) 20x30 + (2) 6x9 cm | 1 vestuario | 1 personas | 40 minutos.', price: '$99.900' },
  { name: 'Sesión “Renacer”', description: '5 tomas a elegir para: (4) fotos 15x22 + (1) retablo 20x30 cm + (5) 6x9 | 2 vestuarios | Hasta 3 personas | 1 hora', price: '$199.900' },
  { name: 'Sesión “Book”', description: '10 tomas a elegir incluidas en 1 Carpeta Book 20x30 5 hojas cm | (1) Retablo 20x30 cm | 3 vestuarios | Hasta 4 personas | 1 hora y 30 min', price: '$450.000' },
  { name: 'Sesión “en Exteriores”', description: '15 tomas a elegir incluidas en 1 Fotobook 20x30 cm de 5 hojas | (1) Retablo 30x40 cm | 3 vestuarios | Hasta 4 personas | 2 horas', price: '$ 550.000' }
];
const $ = (s) => document.querySelector(s);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;' })[c]);
let data = { photos: [], services: defaultServices, products: defaultProducts, prices: defaultPrices, settings: null };

function setContact() {
  const number = (data.settings?.whatsapp_number || config.whatsappNumber || '573000000000').replace(/\D/g, '');
  const link = `https://wa.me/${number}?text=${encodeURIComponent('Hola, quisiera información sobre una sesión de fotografía.')}`;
  $('#whatsappButton').href = link; $('#whatsappFooter').href = link; $('#whatsappFooter').target = '_blank';
  $('#studioCity').textContent = data.settings?.city || config.city || 'Medellín, Colombia'; $('#year').textContent = new Date().getFullYear();
}
function render() {
  $('#serviceList').innerHTML = data.services.map((x) => `<article class="service"><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.description)}</p></article>`).join('');
  $('#productList').innerHTML = data.products.map((x) => `<div class="product-item"><div><b>${escapeHtml(x.name)}</b><small>${escapeHtml(x.description)}</small></div><span>↗</span></div>`).join('');
  $('#priceList').innerHTML = data.prices.map((x) => `<article class="price-card"><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.description)}</p><strong>${escapeHtml(x.price)}</strong></article>`).join('');
  $('#bookingService').innerHTML = data.prices.map((x) => `<option value="${escapeHtml(x.name)}">${escapeHtml(x.name)}</option>`).join('');
  const grid = $('#galleryGrid');
  grid.innerHTML = data.photos.map((photo) => `<article class="gallery-card"><img src="${encodeURI(photo.url)}" alt="${escapeHtml(photo.alt || photo.category || 'Fotografía de Luz Estudio')}" loading="lazy"><span class="gallery-caption">${escapeHtml(photo.category || '')}</span></article>`).join('');
  $('#galleryEmpty').style.display = data.photos.length ? 'none' : 'block';
  const featured = data.photos.filter((x) => x.featured);
  [['.hero-photo', featured[0]], ['.product-photo', featured[1] || featured[0]]].forEach(([selector, photo]) => { if (photo) { const el=$(selector); el.style.background=`url("${photo.url}") center/cover`; el.querySelector('span').style.display='none'; } });
  setContact();
}
async function loadContent() {
  if (!supabase) return render();
  const [photos, catalog, settings] = await Promise.all([supabase.from('photos').select('*').eq('published', true).order('sort_order'), supabase.from('catalog_items').select('*').eq('published', true).order('sort_order'), supabase.from('site_settings').select('*').eq('id',1).maybeSingle()]);
  if (!photos.error) data.photos = photos.data;
  if (!catalog.error && catalog.data.length) {
    ['service','product','price'].forEach((type) => { const items = catalog.data.filter((x) => x.type === type); if (items.length) data[`${type}s`] = items.map((x) => ({ title:x.name, name:x.name, description:x.description, price:x.price })); });
  }
  if (!settings.error) data.settings = settings.data;
  render();
}
function setupMenu() { const menu = $('.menu-toggle'); menu.addEventListener('click', () => { const open = $('.nav').classList.toggle('open'); menu.setAttribute('aria-expanded', open); }); $('.nav').addEventListener('click', () => $('.nav').classList.remove('open')); }
function setupBooking() { $('#bookingForm').addEventListener('submit', async (event) => { event.preventDefault(); const status = $('#formStatus'); status.textContent = 'Enviando solicitud…'; const form = Object.fromEntries(new FormData(event.currentTarget)); try { const response = await fetch('/.netlify/functions/appointment', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(form) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); status.textContent = '¡Gracias! Recibimos tu solicitud y te contactaremos pronto.'; event.currentTarget.reset(); } catch (error) { status.textContent = error.message; } }); }
function setupAdmin() {
  const dialog = $('#adminDialog'); $('#adminEntry').addEventListener('click', () => dialog.showModal()); $('[data-close]').addEventListener('click', () => dialog.close());
  $('#loginForm').addEventListener('submit', async (event) => { event.preventDefault(); const status = $('#loginStatus'); if (!supabase) return status.textContent = 'Configura Supabase antes de habilitar el acceso privado.'; const f = Object.fromEntries(new FormData(event.currentTarget)); status.textContent = 'Verificando…'; const { error } = await supabase.auth.signInWithPassword(f); if (error) return status.textContent = 'No fue posible iniciar sesión.'; showDashboard(); });
  $('#signOut').addEventListener('click', async () => { await supabase.auth.signOut(); $('#dashboardView').hidden = true; $('#loginView').hidden = false; });
  $('.dashboard-tabs').addEventListener('click', (e) => { if (!e.target.dataset.tab) return; $$('.dashboard-tabs button').forEach((b) => b.classList.toggle('active', b === e.target)); renderAdmin(e.target.dataset.tab); });
  if (supabase) supabase.auth.getSession().then(({data:{session}}) => session && showDashboard());
}
const $$ = (s) => [...document.querySelectorAll(s)];
function showDashboard() { $('#loginView').hidden = true; $('#dashboardView').hidden = false; renderAdmin('photos'); }
async function renderAdmin(tab) {
  const box = $('#dashboardContent'); box.innerHTML = 'Cargando…';
  if (tab === 'photos') { const {data:photos = []} = await supabase.from('photos').select('*').order('sort_order'); box.innerHTML = `<form class="admin-form" id="photoForm"><label>Archivo<input required type="file" name="file" accept="image/*"></label><label>Categoría<input required name="category" placeholder="Maternidad"></label><label>Texto alternativo<input name="alt" placeholder="Descripción de la foto"></label><label><input type="checkbox" name="featured"> Mostrar en inicio</label><button class="button">Subir fotografía <span>→</span></button></form><hr><div class="admin-grid">${photos.map(p=>`<article class="admin-photo"><img src="${encodeURI(p.url)}" alt=""><p>${escapeHtml(p.category || 'Sin categoría')}</p><button data-edit-photo="${p.id}">Editar</button> <button data-delete-photo="${p.id}">Eliminar</button></article>`).join('') || '<p>Aún no hay fotografías.</p>'}</div>`; $('#photoForm').addEventListener('submit', uploadPhoto); $$('[data-delete-photo]').forEach((b)=>b.addEventListener('click',()=>deletePhoto(b.dataset.deletePhoto))); $$('[data-edit-photo]').forEach((b)=>b.addEventListener('click',()=>editPhoto(photos.find(x=>x.id===b.dataset.editPhoto)))); }
  if (tab === 'catalog') { const {data:items=[]} = await supabase.from('catalog_items').select('*').order('type').order('sort_order'); box.innerHTML = `<form class="admin-form" id="catalogForm"><label>Tipo<select name="type"><option value="service">Servicio</option><option value="product">Producto</option><option value="price">Precio / paquete</option></select></label><label>Nombre<input required name="name"></label><label>Descripción<textarea required name="description"></textarea></label><label>Precio (solo paquete)<input name="price" placeholder="$99.900"></label><button class="button">Guardar elemento <span>→</span></button></form><hr><table class="data-table"><tr><th>Tipo</th><th>Nombre</th><th>Precio</th><th></th></tr>${items.map(x=>`<tr><td>${x.type}</td><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.price||'—')}</td><td><button class="text-button" data-edit-catalog="${x.id}">Editar</button> <button class="danger" data-delete-catalog="${x.id}">Eliminar</button></td></tr>`).join('')}</table>`; $('#catalogForm').addEventListener('submit', addCatalog); $$('[data-delete-catalog]').forEach(b=>b.addEventListener('click',()=>deleteCatalog(b.dataset.deleteCatalog))); $$('[data-edit-catalog]').forEach(b=>b.addEventListener('click',()=>editCatalog(items.find(x=>x.id===b.dataset.editCatalog)))); }
  if (tab === 'appointments') { const {data:items=[]} = await supabase.from('appointments').select('*').order('created_at',{ascending:false}); box.innerHTML = `<table class="data-table"><tr><th>Cliente</th><th>Sesión</th><th>Fecha ideal</th><th>Mensaje</th></tr>${items.map(x=>`<tr><td><b>${escapeHtml(x.name)}</b><br>${escapeHtml(x.phone)}<br>${escapeHtml(x.email)}</td><td>${escapeHtml(x.service||'—')}</td><td>${escapeHtml(x.preferred_date||'—')}</td><td>${escapeHtml(x.message||'—')}</td></tr>`).join('') || '<tr><td>No hay solicitudes todavía.</td></tr>'}</table>`; }
  if (tab === 'settings') { const {data:s={}}=await supabase.from('site_settings').select('*').eq('id',1).maybeSingle(); box.innerHTML=`<form class="admin-form" id="settingsForm"><label>Nombre del estudio<input name="studio_name" value="${escapeHtml(s?.studio_name||'')}"></label><label>Ciudad<input name="city" value="${escapeHtml(s?.city||'')}"></label><label>WhatsApp (internacional)<input name="whatsapp_number" value="${escapeHtml(s?.whatsapp_number||'')}"></label><label>Correo de contacto<input type="email" name="email" value="${escapeHtml(s?.email||'')}"></label><button class="button">Guardar contacto <span>→</span></button></form>`; $('#settingsForm').addEventListener('submit', saveSettings); }
}
async function uploadPhoto(e) { e.preventDefault(); const f=e.currentTarget, file=f.file.files[0], path=`${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'-')}`; const {error:uploadError}=await supabase.storage.from('photos').upload(path,file); if(uploadError)return alert('No se pudo subir la imagen.'); const {data:url}=supabase.storage.from('photos').getPublicUrl(path); const {error}=await supabase.from('photos').insert({url:url.publicUrl,storage_path:path,category:f.category.value,alt:f.alt.value,featured:f.featured.checked}); if(error)return alert('No se pudo guardar la foto.'); await loadContent(); renderAdmin('photos'); }
async function deletePhoto(id) { if(!confirm('¿Eliminar esta fotografía?')) return; const {data:p}=await supabase.from('photos').select('storage_path').eq('id',id).single(); if(p?.storage_path) await supabase.storage.from('photos').remove([p.storage_path]); await supabase.from('photos').delete().eq('id',id); await loadContent(); renderAdmin('photos'); }
async function editPhoto(p) { const category=prompt('Categoría:',p.category||''); if(category===null)return; const alt=prompt('Texto alternativo:',p.alt||''); if(alt===null)return; const featured=confirm('¿Mostrar esta foto en la página principal?'); await supabase.from('photos').update({category,alt,featured}).eq('id',p.id); await loadContent(); renderAdmin('photos'); }
async function addCatalog(e) { e.preventDefault(); const x=Object.fromEntries(new FormData(e.currentTarget)); const {error}=await supabase.from('catalog_items').insert(x); if(error)return alert('No se pudo guardar.'); await loadContent(); renderAdmin('catalog'); }
async function deleteCatalog(id) { if(!confirm('¿Eliminar este elemento?'))return; await supabase.from('catalog_items').delete().eq('id',id); await loadContent(); renderAdmin('catalog'); }
async function editCatalog(x) { const name=prompt('Nombre:',x.name); if(name===null)return; const description=prompt('Descripción:',x.description); if(description===null)return; const price=prompt('Precio (déjalo vacío si no aplica):',x.price||''); if(price===null)return; await supabase.from('catalog_items').update({name,description,price}).eq('id',x.id); await loadContent(); renderAdmin('catalog'); }
async function saveSettings(e) { e.preventDefault(); const values=Object.fromEntries(new FormData(e.currentTarget)); await supabase.from('site_settings').upsert({id:1,...values}); await loadContent(); alert('Información de contacto actualizada.'); }
setContact(); setupMenu(); setupBooking(); setupAdmin(); loadContent();
