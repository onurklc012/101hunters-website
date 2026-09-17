// Cloudflare Pages Function: /api/apply
// Forwards candidate pilot applications to Discord Webhook without being affected by local ISP blocks

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1550260989973373038/LrL1oAkuX3K3YGJbVCnoLKTtKkRZjT1IGzP6p_8LD2v8c-m6UYUzYrNQ8kbBd4Sfynq9";

export async function onRequestPost(context) {
    try {
        const payload = await context.request.json();

        // Validate basic fields
        if (!payload || !payload.embeds || payload.embeds.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid payload" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "101HunterHQ-ApplicationProxy/1.0"
            },
            body: JSON.stringify(payload)
        });

        if (discordRes.ok) {
            return new Response(JSON.stringify({ success: true, message: "Application received" }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        } else {
            const errorText = await discordRes.text();
            return new Response(JSON.stringify({ success: false, status: discordRes.status, error: errorText }), {
                status: discordRes.status,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
