import { compile } from "@dtinth/tailwindcss-standalone";

addEventListener("message", async (event) => {
  const { tailwindcss, id } = event.data;
  const result = await compile(tailwindcss);
  postMessage({ result, id });
});
