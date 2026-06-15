export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const tunnelUrl = "https://ms-f80f143f.serveo.net";
  const url = new URL(request.url);
  const targetUrl = new URL(tunnelUrl + url.pathname + url.search);

  const headers = new Headers(request.headers);
  headers.set("Host", targetUrl.host);
  headers.delete("x-forwarded-host");

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'manual'
    });

    if (response.status === 302 || response.status === 301 || response.status === 307 || response.status === 308) {
      const location = response.headers.get('location');
      if (location && (location.includes('serveo.net') || location === 'https://serveo.net/')) {
        return serveOfflinePage();
      }
    }

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('connection');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    console.error("Proxy edge error:", error);
    return serveOfflinePage();
  }
}

function serveOfflinePage() {
  const html = "<!DOCTYPE html>\n<html lang=\"pl\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Serwer Offline | Mobile Server http</title>\n    <script src=\"https://cdn.tailwindcss.com\"></script>\n    <link href=\"https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap\" rel=\"stylesheet\">\n    <style>\n        body {\n            font-family: 'Outfit', sans-serif;\n            background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%);\n        }\n    </style>\n</head>\n<body class=\"flex items-center justify-center min-h-screen text-slate-100 p-6\">\n    <div class=\"max-w-md w-full bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden\">\n        <div class=\"absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl\"></div>\n        <div class=\"absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl\"></div>\n        \n        <div class=\"inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-6 animate-pulse\">\n            <svg class=\"w-10 h-10 text-red-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z\"></path>\n            </svg>\n        </div>\n        \n        <h1 class=\"text-3xl font-extrabold text-white mb-3\">Serwer Offline</h1>\n        <p class=\"text-slate-400 text-sm leading-relaxed mb-8\">\n            Połączenie z Twoim telefonem nie mogło zostać nawiązane. Upewnij się, że serwer oraz udostępnianie globalne są włączone w aplikacji mobilnej.\n        </p>\n        \n        <div class=\"space-y-4\">\n            <div class=\"flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-left text-xs\">\n                <span class=\"text-slate-500\">Status tunelu:</span>\n                <span class=\"px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold uppercase tracking-wider\">Rozłączony</span>\n            </div>\n            \n            <button onclick=\"window.location.reload()\" class=\"w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl transition duration-300 shadow-lg shadow-indigo-500/20 active:scale-[0.98]\">\n                Spróbuj ponownie\n            </button>\n        </div>\n        \n        <div class=\"mt-8 text-[11px] text-slate-600 font-medium uppercase tracking-[0.2em]\">\n            Mobile Server http\n        </div>\n    </div>\n</body>\n</html>";
  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}