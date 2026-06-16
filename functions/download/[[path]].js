export async function onRequest(context) {
    const { request, env, params } = context;

    const segments = (Array.isArray(params.path) ? params.path : [params.path]).filter(Boolean);

    // If the request is for the main download page (e.g. /download/<token> or /download/),
    // we want to serve the frontend React application's index.html.
    if (segments.length <= 1) {
        const url = new URL(request.url);
        url.pathname = "/";
        return context.next(new Request(url.toString(), request));
    }

    const path = segments.join("/");
    const incomingUrl = new URL(request.url);
    
    // Normalize backend origin (remove trailing slash and trailing /api)
    const backendOriginClean = (env.BACKEND_ORIGIN || "http://static.44.52.233.167.clients.your-server.de:8080")
        .replace(/\/api\/?$/, "")
        .replace(/\/$/, "");

    const targetUrl = `${backendOriginClean}/download/${path}${incomingUrl.search}`;

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
}
