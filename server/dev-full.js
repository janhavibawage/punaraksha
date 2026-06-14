import { spawn } from "node:child_process";

const commands = [
  { name: "api", command: "node", args: ["server/index.js"] },
  { name: "web", command: "npx", args: ["vite", "--host", "127.0.0.1", "--port", "5173"] },
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --preserve-symlinks --preserve-symlinks-main`.trim(),
    },
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
      stopAll();
    }
  });

  return child;
});

process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);

function stopAll() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}
