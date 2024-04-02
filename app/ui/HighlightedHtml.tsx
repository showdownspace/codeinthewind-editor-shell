import { useEffect, useState } from "react";
import { codeToHtml } from "shiki/bundle/web";

export interface HighlightedHtml {
  html: string;
}
export default function HighlightedHtml(props: HighlightedHtml) {
  const [highlighted, setHighlighted] = useState<string>("");
  useEffect(() => {
    let canceled = false;
    const start = Date.now();
    const promise = codeToHtml(props.html, {
      lang: "html",
      theme: "github-dark",
    });
    promise.then((r) => {
      const finish = Date.now();
      console.log("Highlighted in", finish - start, "ms");
      if (canceled) return;
      setHighlighted(r);
    });
    return () => {
      canceled = true;
    };
  }, [props.html]);
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  );
}
