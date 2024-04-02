import { useEffect, useRef } from "react";
import TailwindWorker from "../utils/tailwindcss.worker?worker";

export const previewerCode = [
  `<!DOCTYPE html><html><head><meta charset="utf-8">`,
  '<base href="https://codeinthewind-editor-core.showdown.space/">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100;200;300;400;500;600;700;800;900&family=Noto+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap">',
  '<style id="style"></style>',
  "</head>",
  '<body id="htmlbody">',
  "</body></html>",
].join("");

export interface Previewer {
  html: string;
}

let worker: Worker;
const getWorker = () => {
  worker ??= new TailwindWorker();
  return worker;
};

export function Previewer(props: Previewer) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const worker = getWorker();
    const id = crypto.randomUUID();
    const start = Date.now();
    const onMessage = (event: MessageEvent) => {
      if (event.data.id !== id) {
        return;
      }
      const { result } = event.data;
      if (result) {
        console.log("Compiled in", Date.now() - start, "ms");
        if (ref.current) {
          ref.current.contentWindow!.document.getElementById(
            "style"
          )!.textContent = result.css;
          ref.current.contentWindow!.document.getElementById(
            "htmlbody"
          )!.innerHTML = props.html;
        }
      }
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({
      tailwindcss: {
        htmlInput: props.html,
        cssInput: `body { font-family: Noto Sans, Noto Sans Thai, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; } @tailwind base; @tailwind components; @tailwind utilities;`,
      },
      id,
    });
    return () => {
      worker.removeEventListener("message", onMessage);
    };
  }, [props.html]);
  return (
    <iframe
      title="Previewer"
      ref={ref}
      srcDoc={previewerCode}
      sandbox="allow-same-origin"
      style={{
        width: "540px",
        height: "720px",
      }}
      className="bg-white"
    />
  );
}
