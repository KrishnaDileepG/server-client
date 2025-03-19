const listener = Deno.listen({ port: 8000 });
let connectionId = 0;
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const clients = new Map();

for await (const connection of listener) {
  const clientId = connectionId++;
  await connection.write(encoder.encode("Enter your Name: "));

  const buf = new Uint8Array(1024);
  const bytesRead = await connection.read(buf);
  const name = decoder.decode(buf.slice(0, bytesRead)).trim();
  clients.set(clientId, { connection, name });

  handleConnection(connection, clientId, name);
}

async function handleConnection(connection, senderId, senderName) {
  while (true) {
    const buf = new Uint8Array(1024);
    const bytesCount = await connection.read(buf);
    const msg = decoder.decode(buf.slice(0, bytesCount));
    console.log(` ${senderId}): ${msg}`);

    clients.forEach(async ({ connection, name }, id) => {
      if (name !== senderName) {
        await connection.write(encoder.encode(`${senderName}: ${msg}\n`));
      }
    });
  }
}
