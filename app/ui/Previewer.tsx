import { useEffect, useRef } from "react";

export const previewerCode = [
  `<!DOCTYPE html><html><head><meta charset="utf-8">`,
  '<base href="https://codeinthewind-editor-core.showdown.space/">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<script src="https://cdn.tailwindcss.com"></script>',
  '<style type="text/tailwindcss">',
  `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100;200;300;400;500;600;700;800;900&family=Noto+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');`,
  `body { font-family: Noto Sans, Noto Sans Thai, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }`,
  "@tailwind base; @tailwind components; @tailwind utilities;",
  "</style>",
  '<body id="htmlbody">',
  `<script>
    parent.postMessage({ previewerReady: true }, '*');
    window.addEventListener('message', (event) => {
      const { setHtml } = event.data;
      if (setHtml) {
        document.getElementById('htmlbody').innerHTML = setHtml.html;
      }
    });
  </script>`,
  "</body></html>",
].join("");

export interface Previewer {
  html: string;
}

export function Previewer(props: Previewer) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const send = () => {
      ref.current?.contentWindow?.postMessage(
        { setHtml: { html: props.html } },
        "*"
      );
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== ref.current?.contentWindow) {
        return;
      }
      if (event.data.previewerReady) {
        send();
      }
    };
    window.addEventListener("message", onMessage);
    send();
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [props.html]);
  return (
    <iframe
      title="Previewer"
      ref={ref}
      srcDoc={previewerCode}
      sandbox="allow-scripts"
      style={{
        width: "540px",
        height: "720px",
      }}
      className="bg-white"
    />
  );
}
