const connection = await Deno.connect(({ port: 8000 }))

const encoder = new TextEncoder();
const msg = await connection.write(encoder.encode("bye"));
console.log(msg)