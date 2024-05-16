import { admin, db } from "./_lib";

async function worker(uid: string) {
  for (;;) {
    const sleepMs = Math.random() * 10000;
    await new Promise((resolve) => setTimeout(resolve, sleepMs));
    const bgs = [
      "red",
      "orange",
      "amber",
      "yellow",
      "green",
      "teal",
      "cyan",
      "blue",
      "indigo",
      "violet",
      "purple",
      "pink",
    ];
    const bg = "bg-" + bgs[Math.floor(Math.random() * bgs.length)] + "-500";
    db.ref(`rooms/citw2/privateSubmissions/${uid}`).set({
      data: JSON.stringify({
        html:
          '<div class="relative flex min-h-screen flex-col justify-center overflow-hidden ' +
          bg +
          ' py-6 sm:py-12">\n  <img src="/img/beams.jpg" alt="" class="absolute mix-blend-multiply top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" width="1308" />\n  <div class="absolute inset-0 bg-[url(/img/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>\n  <div class="relative mx-auto max-w-xs rounded-lg bg-white px-6 pt-8 pb-8 shadow-xl ring-1 ring-gray-900/5">\n    <strong>\n      ' +
          new Date().toISOString() +
          "\n    </strong><br>\n    Editor is working, I guess?<br />\n    Tailwind CSS is pretty cool.\n  </div>\n</div>",
        version: 0,
      }),
      submittedAt: admin.database.ServerValue.TIMESTAMP,
    });
  }
}

for (let i = 1; i <= 20; i++) {
  const uid = `fuzzer-${i.toString().padStart(4, "0")}`;
  const num = i.toString().padStart(2, "0");
  db.ref(`rooms/citw2/profiles/${uid}`).set({ name: "Fuzz" + num });
  worker(uid);
}
