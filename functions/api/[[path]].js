const BACKEND_PREFIX = "/api";

export async function onRequest(context) {
    try {
        const { request, params, env } = context;

        const path = Array.isArray(params.path)
            ? params.path.join("/")
            : (params.path || "");

        const backendOrigin = env.BACKEND_ORIGIN || "http://static.44.52.233.167.clients.your-server.de:8080";
        const incomingUrl = new URL(request.url);
        const base = backendOrigin.replace(/\/+$/, "");
        const prefix = BACKEND_PREFIX.replace(/\/+$/, "");
        const targetUrl = `${base}${prefix}/${path}${incomingUrl.search}`;

        const headers = new Headers(request.headers);
        headers.delete("host");
        headers.delete("origin");
        headers.delete("referer");

        for (const key of [...headers.keys()]) {
            if (key.toLowerCase().startsWith("sec-")) headers.delete(key);
        }

        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
            redirect: "manual",
        });

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    } catch (err) {
        return new Response(`Proxy error: ${err?.message || String(err)}`, {
            status: 500,
        });
    }
}