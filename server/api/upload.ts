import { Client, Server } from "nextcloud-node-client";
import { randomUUID } from "node:crypto";

export default defineEventHandler(async (event) => {
  const server = new Server({
    basicAuth: {
      username: useRuntimeConfig().ncUser,
      password: useRuntimeConfig().ncPassword,
    },
    url: useRuntimeConfig().public.ncUrl,
  });
  const body = await readBody(event);
  if (
    !body ||
    typeof body.data !== "string" ||
    typeof body.filename !== "string"
  ) {
    setResponseStatus(400);
    return "Body should contain a JSON-encoded object with a data property that is a base64-encoded PDF file, and a filename property that is a string.";
  }
  const client = new Client(server);
  const folder = await client.getFolder("/Anmeldungen_automatisiert");
  if (!folder) {
    setResponseStatus(500);
    return;
  }
  const existingFile = await folder.getFile(`${body.filename}`);
  if (existingFile) {
    // We can't check if every number is used, so just quickly append a random 5 character string
    const randomString = randomUUID().slice(0, 5);
    const file = await folder.createFile(
      `${body.filename.slice(0, -4)}_${randomString}.pdf`,
      Buffer.from(body.data, "base64")
    );
    return {
      success: true,
    };
  } else {
    const file = await folder.createFile(
      `${body.filename}`,
      Buffer.from(body.data, "base64")
    );
    return {
      success: true,
    };
  }
});
