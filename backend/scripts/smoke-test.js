const { spawn } = require("child_process");
const http = require("http");

// Simple, fast smoke test:
// 1) Start backend on a temporary port (no Mongo required).
// 2) Hit `/` to confirm Express is up.
// 3) Shut down the process.

function httpGetJSON(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 3000 }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Request timeout"));
    });
  });
}

(async () => {
  const PORT = Number(process.env.PORT_FOR_TEST || 5001);
  const baseUrl = `http://127.0.0.1:${PORT}`;

  const child = spawn(process.execPath, ["server.js"], {
    cwd: __dirname + "/..",
    env: {
      ...process.env,
      PORT,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let lastErr = null;
  try {
    // Wait until `/` responds (up to ~10s).
    for (let i = 0; i < 20; i++) {
      try {
        const res = await httpGetJSON(`${baseUrl}/`);
        if (res.status >= 200 && res.status < 300) {
          child.kill("SIGTERM");
          // eslint-disable-next-line no-console
          console.log("✅ Backend smoke test passed");
          process.exit(0);
        }
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    throw lastErr || new Error("Backend did not start in time");
  } catch (err) {
    try {
      child.kill("SIGTERM");
    } catch {}
    // eslint-disable-next-line no-console
    console.error("❌ Backend smoke test failed:", err.message);
    process.exit(1);
  }
})();

