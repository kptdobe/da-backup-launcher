async function runBackup(env) {
  const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/slurper/jobs`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: {
            vendor: "r2",
            bucket: env.SOURCE_BUCKET,
            secret: {
              accessKeyId: env.SOURCE_R2_ACCESS_KEY_ID,
              secretAccessKey: env.SOURCE_R2_SECRET_ACCESS_KEY,
            },
          },
          target: {
            vendor: "r2",
            bucket: env.DESTINATION_BUCKET,
            secret: {
              accessKeyId: env.DESTINATION_R2_ACCESS_KEY_ID,
              secretAccessKey: env.DESTINATION_R2_SECRET_ACCESS_KEY,
            },
          },
          overwriteFiles: "overwrite",
        }),
      }
    );

  const data = await resp.json();
  if (!resp.ok) {
    const raw = data.error ?? [];
    let errors = raw;
    if (typeof raw === "string") {
      try {
        errors = JSON.parse(raw);
      } catch {
        errors = [];
      }
    }
    const readable = Array.isArray(errors)
      ? errors
          .map((e) => `${(e.path ?? []).join(".") || "request"}: ${e.message ?? e.code ?? ""}`.trim())
          .filter(Boolean)
          .join("; ")
      : String(raw);
    const msg = `Failed to start backup job: ${readable || JSON.stringify(data)}`;
    console.error(msg);
    return {success: false, msg};
  } else {
    const msg = `Backup job started, ID: ${data.id}`;
    console.log(msg);
    return {success: true, msg};
  }
}

export default {
  // enable for local development and text the worker.
  // Use /run to trigger the backup job.

  // async fetch(request, env, ctx) {
  //   const url = new URL(request.url);
  //   if (url.pathname === "/run" && request.method === "GET") {
  //     const {success, msg} = await runBackup(env);
  //     return new Response(msg, { status: success ? 200 : 500, headers: { "Content-Type": "text/plain" } });
  //   }
  //   return new Response("OK", { status: 200, headers: { "Content-Type": "text/plain" } });
  // },

  async scheduled(event, env, ctx) {
    await runBackup(env);
  },
};