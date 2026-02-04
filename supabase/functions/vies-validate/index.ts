// VIES VAT Number Validation Proxy
// Proxies requests to EU VIES SOAP API to bypass CORS restrictions
// Deploy with: supabase functions deploy vies-validate

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const VIES_ENDPOINT = 'https://ec.europa.eu/taxation_customs/vies/services/checkVatService';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { countryCode, vatNumber } = await req.json();

    if (!countryCode || !vatNumber) {
      return new Response(JSON.stringify({
        error: 'Missing countryCode or vatNumber'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build SOAP request
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
  <soapenv:Body>
    <urn:checkVat>
      <urn:countryCode>${escapeXml(countryCode)}</urn:countryCode>
      <urn:vatNumber>${escapeXml(vatNumber)}</urn:vatNumber>
    </urn:checkVat>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch(VIES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      body: soapRequest
    });

    if (!response.ok) {
      throw new Error(`VIES returned ${response.status}`);
    }

    const xml = await response.text();

    // Parse SOAP response
    const valid = xml.includes('<valid>true</valid>');
    const nameMatch = xml.match(/<name>([^<]*)<\/name>/);
    const addressMatch = xml.match(/<address>([^<]*)<\/address>/);

    // Check for fault (service unavailable, etc.)
    if (xml.includes('INVALID_INPUT')) {
      return new Response(JSON.stringify({
        valid: false,
        error: 'INVALID_INPUT',
        message: 'El formato del NIF-IVA no es valido para este pais'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (xml.includes('MS_UNAVAILABLE') || xml.includes('SERVICE_UNAVAILABLE')) {
      return new Response(JSON.stringify({
        valid: null,
        error: 'SERVICE_UNAVAILABLE',
        message: 'Servicio VIES no disponible temporalmente'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      valid,
      name: nameMatch?.[1]?.trim() || null,
      address: addressMatch?.[1]?.trim() || null,
      requestDate: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('VIES validation error:', error);
    return new Response(JSON.stringify({
      valid: null,
      error: 'PROXY_ERROR',
      message: 'Error al conectar con el servicio VIES'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Escape XML special characters to prevent injection
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
