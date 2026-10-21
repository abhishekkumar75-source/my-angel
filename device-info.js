window.getDeviceInfo = async function() {
    const userAgent = navigator.userAgent || "";
    const agent = userAgent.toLowerCase();
    let device = "Unknown device";
    if (agent.includes("ipad") || (agent.includes("tablet") && !agent.includes("mobile"))) device = "Tablet";
    else if (agent.includes("iphone")) device = "iPhone";
    else if (agent.includes("android") && agent.includes("mobile")) device = "Android phone";
    else if (agent.includes("android")) device = "Android tablet";
    else if (agent.includes("windows")) device = "Windows computer";
    else if (agent.includes("cros")) device = "Chromebook";
    else if (agent.includes("macintosh") || agent.includes("mac os")) device = "Mac computer";
    else if (agent.includes("linux")) device = "Linux computer";

    let browser = "Unknown browser";
    if (agent.includes("edg/")) browser = "Edge";
    else if (agent.includes("opr/") || agent.includes("opera")) browser = "Opera";
    else if (agent.includes("firefox/")) browser = "Firefox";
    else if (agent.includes("chrome/") || agent.includes("crios/")) browser = "Chrome";
    else if (agent.includes("safari/")) browser = "Safari";

    let model = "";
    if (navigator.userAgentData?.getHighEntropyValues) {
        try {
            const hints = await navigator.userAgentData.getHighEntropyValues(["model"]);
            model = hints.model || "";
        } catch (_error) {}
    }
    if (!model && agent.includes("android")) {
        model = userAgent.match(/Android\s+[^;)]+;\s*([^;)]+?)(?:\s+Build\/[^)]*)?\)/i)?.[1] || "";
    }
    model = model.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
    if (["k", "wv", "android", "unknown"].includes(model.toLowerCase())) model = "";
    if (/^(SM-|GT-|SCH-|SPH-)/i.test(model)) model = `Samsung ${model}`;

    return { device: `${device} / ${browser}`, model: model || "Not available" };
};