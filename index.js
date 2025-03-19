const listener = Deno.listen({ port: 8000 });
let connectionId = 0;
const clients = [];

for await (const connection of listener) {
  console.log("server listening");
  const clientId = connectionId++;
  clients.push({ conn: connection, id: clientId });
  handleConnection(connection, clientId);
}

async function handleConnection(connection, clientId) {
  try {
    while (true) {
      const buf = new Uint8Array(1024);
      const bytesCount = await connection.read(buf);
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      const msg = decoder.decode(buf.slice(0, bytesCount));
      console.log(` ${clientId}) ${msg}`);

      if (msg.trim() === "exit") {
        await connection.write(encoder.encode("Bye\n"));
        connection.close();
        removeClient(connection);
        return;
      }
      const broadCast = prompt("Server broadcast: ");

      for (const c of clients) {
        await c.conn.write(encoder.encode(`Server saying: ${broadCast}\n`));
      }

      const reply = prompt("Enter the reply");

      connection.write(
        encoder.encode(`Server > Client ${clientId}: ${reply}\n`)
      );
    }
  } catch {
    return;
  }
}

function removeClient(conn) {
  const index = clients.findIndex((c) => c.conn === conn);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}
