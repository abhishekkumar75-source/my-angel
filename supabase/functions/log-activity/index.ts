const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};

Deno.serve(async request => {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
    }

    try {
        const payload = await request.json();
        const eventType = payload?.type;
        const answer = payload?.answer;
        const isGalleryEntry = eventType === "gallery_entry";
        const isGalleryResponse = eventType === "gallery_prompt_response";
        if (isGalleryResponse && answer !== "yes" && answer !== "no") {
            return Response.json({ error: "Invalid response" }, { status: 400, headers: corsHeaders });
        }

        const device = typeof payload?.device === "string" ? payload.device.trim().slice(0, 100) : "";
        const model = typeof payload?.model === "string" ? payload.model.trim().slice(0, 80) : "Not available";
        if (!device || (
            eventType !== "visit" &&
            eventType !== "gallery_password_failure" &&
            !isGalleryEntry &&
            !isGalleryResponse
        )) {
            return Response.json({ error: "Invalid activity" }, { status: 400, headers: corsHeaders });
        }

        const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        const ipAddress = (
            request.headers.get("cf-connecting-ip") ||
            forwardedFor ||
            request.headers.get("x-real-ip") ||
            "Unavailable"
        ).slice(0, 64);
        const table = eventType === "visit"
            ? "visits"
            : eventType === "gallery_password_failure"
                ? "gallery_password_attempts"
                : "gallery_activity";
        const projectUrl = Deno.env.get("SUPABASE_URL");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (!projectUrl || !serviceKey) throw new Error("Supabase server credentials are unavailable.");

        const response = await fetch(`${projectUrl}/rest/v1/${table}`, {
            method: "POST",
            headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal"
            },
            body: JSON.stringify({
                ...(isGalleryEntry || isGalleryResponse
                    ? { activity: isGalleryEntry ? "gallery_entry" : answer }
                    : {}),
                device,
                model: model || "Not available",
                ip_address: ipAddress
            })
        });
        if (!response.ok) throw new Error(`Activity insert failed (${response.status}).`);

        return Response.json({ ok: true }, { status: 202, headers: corsHeaders });
    } catch (error) {
        console.error("Activity logging failed:", error instanceof Error ? error.message : "Unknown error");
        return Response.json({ error: "Unable to record activity" }, { status: 500, headers: corsHeaders });
    }
});