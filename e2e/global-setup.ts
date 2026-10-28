import { createServer } from "node:http";

export default async function globalSetup() {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("ok");
  });
  await new Promise<void>((resolve) => {
    server.listen(3999, "127.0.0.1", () => resolve());
  });
  return async () => {
    await new Promise((resolve) => server.close(() => resolve(undefined)));
  };
}
