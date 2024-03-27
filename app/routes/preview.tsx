import { Textarea } from "flowbite-react";
import { useState } from "react";
import { Previewer } from "../ui/Previewer";

const testHtml = `<div class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
<img src="/img/beams.jpg" alt="" class="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" width="1308" />
<div class="absolute inset-0 bg-[url(/img/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
<div class="relative mx-auto max-w-xs rounded-lg bg-white px-6 pt-8 pb-8 shadow-xl ring-1 ring-gray-900/5">
  <strong>Code in the Wind!</strong>
</div>
</div>`;

export default function PreviewPage() {
  const [html, setHtml] = useState(testHtml);
  return (
    <div className="flex gap-3">
      <div className="flex-none">
        <Previewer html={html} />
      </div>
      <Textarea
        placeholder="HTML"
        required
        rows={12}
        value={html}
        onChange={(e) => setHtml(e.target.value)}
      />
    </div>
  );
}
