import { createClient } from '@supabase/supabase-js';

export default async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const body = await request.json();
    const required = ['name', 'phone', 'email'];
    if (required.some((key) => !String(body[key] || '').trim())) return Response.json({ error: 'Completa los campos obligatorios.' }, { status: 400 });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase.from('appointments').insert({
      name: body.name.trim(), phone: body.phone.trim(), email: body.email.trim(), service: body.service || null,
      preferred_date: body.preferredDate || null, message: String(body.message || '').trim()
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) { return Response.json({ error: 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.' }, { status: 500 }); }
};
