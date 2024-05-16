/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import clsx from "clsx";
import { Suspense, lazy, useState } from "react";
import { usePtr } from "~/ZDbRef";
import { getRoom } from "~/getRoomRef";
import { Previewer } from "~/ui/Previewer";
import { Timer } from "~/ui/Timer";
import { useContestantHtml } from "../utils/useContestantHtml";
import { useStage } from "../utils/useStage";

const itemWidth = 360;
// const totalWidth = itemWidth * 4 + 32 * 3;
const itemHeight = 480;
const totalHeight = itemHeight * 2 + 32;

export default function AdminStagePage() {
  const userIds = useStage();
  return (
    <div className="fixed inset-0 bg-black">
      <div className="w-[1920px] h-[1080px] bg-gradient-to-b from-black to-neutral-800 relative">
        {userIds.map((x, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const pX = (1080 - totalHeight) / 2 + col * (itemWidth + 32);
          const pY = (1080 - totalHeight) / 2 + row * (itemHeight + 32);
          return <Slot key={i} userId={x} pX={pX} pY={pY} />;
        })}
        <TimerView />
      </div>
    </div>
  );
}

function TimerView() {
  const endTimePtr = getRoom().child("settings").child("timerEndTime");
  const endTime = usePtr(endTimePtr).data;
  return (
    <>
      <div className="absolute top-[44px] right-[44px] h-[60px] w-[280px] flex flex-col items-center justify-center my-font-mono text-7xl">
        <Timer endTime={endTime} />
      </div>
    </>
  );
}

export interface Slot {
  userId: string;
  pX: number;
  pY: number;
}
export function Slot(props: Slot) {
  const [show, setShow] = useState(false);
  const hasUser = props.userId && props.userId !== "-";
  return (
    <>
      <div
        className={clsx(
          "inset-0 absolute bg-black/90 z-[1] transition-opacity duration-500",
          show ? "opacity-100" : "opacity-0",
          show ? "" : "pointer-events-none"
        )}
      >
        {hasUser ? (
          <div
            className={clsx(
              "absolute left-[180px] top-[180px] bottom-[180px] w-[960px] transition-all duration-500",
              show ? "translate-x-0" : "-translate-x-40"
            )}
          >
            <div className="absolute -inset-1 bg-gradient-to-bl from-green-300 to-green-700">
              <div className="absolute inset-1 overflow-auto bg-[#24292e] p-3">
                <ContestantHtml userId={props.userId} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div
        style={
          {
            "--x": show ? "1200px" : props.pX + "px",
            "--y": show ? "180px" : props.pY + "px",
            "--s": show ? "1" : "0.666667",
          } as React.CSSProperties
        }
        className={clsx(
          "absolute w-[360px] h-[480px] top-0 left-0 translate-x-[--x] translate-y-[--y] transition-all duration-500",
          show ? "z-20" : "z-0"
        )}
        onClick={() => setShow((x) => (hasUser ? !x : false))}
      >
        <div className="origin-top-left scale-[--s] top-0 left-0 w-[540px] h-[720px] transition-all duration-500">
          {hasUser ? (
            <div className="absolute -inset-1 shadow-lg transition-all duration-500 bg-gradient-to-br from-[#A1FDF6] to-[#2C4653]">
              <div className="absolute inset-1 bg-black">
                <ContestantPreview userId={props.userId} />
              </div>
              <div className="absolute inset-0 cursor-pointer"></div>
            </div>
          ) : (
            <div className="absolute -inset-1 bg-black/20 border-dashed border-4 border-white/20 transition-all duration-500" />
          )}
        </div>
      </div>
    </>
  );
}

export interface ContestantPreview {
  userId: string;
}

const defaultHtml =
  '<div class="bg-slate-700 text-white fixed inset-0 flex flex-col text-center justify-center"><div class="text-5xl">No signal</div></div>';

export function ContestantPreview(props: ContestantPreview) {
  const html = useContestantHtml(props.userId);
  return <Previewer html={html || defaultHtml} />;
  //   <>
  //     {props.children(
  //       ,
  //     )}
  //   </>
  // );
}

export interface ContestantHtml {
  userId: string;
}

const HighlightedHtml = lazy(() => import("~/ui/HighlightedHtml"));

export function ContestantHtml(props: ContestantHtml) {
  const html = useContestantHtml(props.userId);
  return (
    <>
      <Suspense fallback="Loading...">
        <HighlightedHtml html={html} />
      </Suspense>
    </>
  );
}
