const BACKEND_ORIGIN = "http://167.233.52.44:8080";

export async function onRequest(context) {
    try {
        const { request, params } = context;

        const path = Array.isArray(params.path)
            ? params.path.join("/")
            : (params.path || "");

        const incomingUrl = new URL(request.url);
        const base = BACKEND_ORIGIN.replace(/\/+$/, "");
        const targetUrl = `${base}/${path}${incomingUrl.search}`;

        const headers = new Headers(request.headers);
        headers.delete("host");

        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
            redirect: "follow",
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