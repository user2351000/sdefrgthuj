const form = document.getElementById("launcherForm");
const input = document.getElementById("targetUrl");
const status = document.getElementById("status");

function validateTarget(raw) {
  let url;

  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("URLの形式が正しくありません。");
  }

  const hostname = url.hostname.toLowerCase();
  const suffix = ".trycloudflare.com";

  if (url.protocol !== "https:") {
    throw new Error("HTTPSのURLを入力してください。");
  }

  // Require a real subdomain; the bare trycloudflare.com domain is excluded.
  if (!hostname.endsWith(suffix) || hostname.length <= suffix.length) {
    throw new Error("*.trycloudflare.com のURLだけを指定できます。");
  }

  if (url.username || url.password) {
    throw new Error("ユーザー名・パスワード付きURLには対応していません。");
  }

  return url.href;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = "";

  let destination;
  try {
    destination = validateTarget(input.value);
  } catch (error) {
    status.textContent = error.message;
    return;
  }

  // Open synchronously from the user's click to reduce popup-blocker issues.
  const opened = window.open(destination, "_blank", "popup,width=1200,height=800");

  if (opened) {
    status.textContent = "新しいウィンドウで開きました。";
  } else {
    status.textContent = "ポップアップがブロックされました。新しいタブで開きます。";
    window.open(destination, "_blank");
  }
});

// Optional PWA service worker. The launcher itself remains usable without installation.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
