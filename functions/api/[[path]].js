export async function onRequest(context) {
    const { request, env, params } = context;

    const path = Array.isArray(params.path)
        ? params.path.join("/")
        : (params.path || "");

    const incomingUrl = new URL(request.url);
    
    // Normalize backend origin (remove trailing slash and trailing /api)
    const backendOriginClean = (env.BACKEND_ORIGIN || "")
        .replace(/\/api\/?$/, "")
        .replace(/\/$/, "");

    // The health check endpoint is at the backend root (/health), while other APIs are under /api
    const targetPath = path === "health" ? "health" : `api/${path}`;
    const targetUrl = `${backendOriginClean}/${targetPath}${incomingUrl.search}`;

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
}