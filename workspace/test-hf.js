import fetch from "node-fetch";

async function test() {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: "Olá mundo",
      }),
    });
    console.log(response.status);
    console.log(await response.text());
  } catch (e) {
    console.error(e);
  }
}
test();
