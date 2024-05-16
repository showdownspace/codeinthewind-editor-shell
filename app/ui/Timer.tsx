import { useNow } from "~/utils/useNow";

export interface Timer {
  endTime: number | null | undefined;
  children?: (time: string) => React.ReactNode;
}

export function Timer(props: Timer) {
  const now = useNow();
  const time = (() => {
    if (!props.endTime) {
      return "--:--";
    } else if (props.endTime < now) {
      return "00:00";
    } else {
      const minutes = Math.floor((props.endTime - now) / 60000);
      const seconds = Math.floor((props.endTime - now) / 1000) % 60;
      return [
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
      ].join(":");
    }
  })();
  return <>{props.children ? props.children(time) : time}</>;
}
