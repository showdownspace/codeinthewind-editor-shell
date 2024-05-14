import { useStore } from "@nanostores/react";
import { redirect, useLoaderData } from "@remix-run/react";
import { get, serverTimestamp, set } from "firebase/database";
import { atom } from "nanostores";
import { useEffect, useRef } from "react";
import { getCurrentUser } from "~/getCurrentUser";
import { UserId } from "~/ui/UserId";
import { getRoom } from "../getRoomRef";

const $status = atom("…");

const defaultHtml = `<!--
  Welcome to Code in the Wind Editor.
  This editor is based on <https://play.tailwindcss.com/>.
-->
<div class="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
  <img src="/img/beams.jpg" alt="" class="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" width="1308" />
  <div class="absolute inset-0 bg-[url(/img/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
  <div class="relative mx-auto max-w-xs rounded-lg bg-white px-6 pt-8 pb-8 shadow-xl ring-1 ring-gray-900/5">
    <strong>Code in the Wind!</strong>
  </div>
</div>`;

const sync = (() => {
  let onChange: (html: string) => void = () => {};
  let onUpdatePresence: () => void = () => {};

  return {
    init: async (user: { uid: string }) => {
      const roomPtr = getRoom();
      const submissionPtr = roomPtr.child("privateSubmissions").child(user.uid);
      const initialData = await get(submissionPtr.ref);
      let initialHtml = defaultHtml;
      let savedVersion = 0;
      if (initialData.exists()) {
        const data = JSON.parse(initialData.child("data").val() || "{}");
        initialHtml = data.html || initialHtml;
        savedVersion = Number(data.version) || savedVersion;
      }
      $status.set("Ready");

      let targetHtml = initialHtml;
      let targetVersion = 0;
      onChange = (newHtml) => {
        targetHtml = newHtml;
        targetVersion++;
      };
      onUpdatePresence = () => {
        const presenceRef = roomPtr.child("presence").child(user.uid).ref;
        set(presenceRef, serverTimestamp());
      };
      setInterval(async () => {
        if (savedVersion === targetVersion || !targetHtml) {
          return;
        }
        try {
          const version = targetVersion;
          const html = targetHtml;
          await set(submissionPtr.ref, {
            data: JSON.stringify({ html, version }),
            submittedAt: serverTimestamp(),
          });
          const now = new Date();
          const z = (x: number) => (x < 10 ? "0" + x : x);
          const time =
            now.getHours() +
            ":" +
            z(now.getMinutes()) +
            ":" +
            z(now.getSeconds());
          savedVersion = version;
          $status.set(`Saved at ${time} (v${version}, size=${html.length})`);
        } catch (error) {
          console.error(error);
          $status.set("Failed to save");
        }
      }, 3000);

      return { html: initialHtml };
    },
    setHtml: (html: string) => {
      onChange(html);
    },
    updatePresence: async () => {
      onUpdatePresence();
    },
  };
})();

export const clientLoader = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw redirect("/");
  }
  const { html } = await sync.init(user);
  return { user, html };
};

export default function Editor() {
  const loaderData = useLoaderData<typeof clientLoader>();
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let editorId = "";
    const listener = (event: MessageEvent) => {
      const iframeWindow = ref.current?.contentWindow;
      if (!iframeWindow || event.source !== iframeWindow) {
        return;
      }
      const data = event.data;
      if (!data) {
        return;
      }
      if (data.editorLoaded) {
        editorId = data.editorLoaded.editorId;
        iframeWindow.postMessage(
          { initializeEditorSync: { editorId, initialCode: loaderData.html } },
          "*"
        );
        return;
      }
      if (
        data.editorContentChanged &&
        data.editorContentChanged.editorId === editorId &&
        data.editorContentChanged.uri === "file:///HTML"
      ) {
        sync.setHtml(data.editorContentChanged.code);
      }
    };
    window.addEventListener("message", listener);
    const interval = setInterval(() => {
      sync.updatePresence();
    }, 10000);
    sync.updatePresence();
    return () => {
      window.removeEventListener("message", listener);
      clearInterval(interval);
    };
  }, [loaderData.html]);

  return (
    <div className="fixed inset-0">
      <iframe
        ref={ref}
        src="https://codeinthewind-editor-core.showdown.space/"
        title="Editor"
        className="absolute top-0 left-0 w-full h-full"
      />
      <Header></Header>
    </div>
  );
}

export function Header() {
  const status = useStore($status);
  const { user } = useLoaderData<typeof clientLoader>();
  return (
    <>
      <div className="absolute top-2 left-5 pl-0.5">
        <div className="text-sm">
          <strong>Code in the Wind</strong>
          <span className="text-gray-400"> - {status}</span>
        </div>
        <div className="text-sky-400">
          {user.name}{" "}
          <span className="text-green-400">
            <UserId id={user.uid} compact />
          </span>
        </div>
      </div>
    </>
  );
}
