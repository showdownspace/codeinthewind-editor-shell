export interface UserId {
  id: string;
  compact?: boolean;
}
export function UserId(props: UserId) {
  let back = "";
  const front = props.id.replace(/....$/, (match) => {
    back = match;
    return "";
  });
  return props.compact ? (
    <>{back}</>
  ) : (
    <>
      {front}
      <u>{back}</u>
    </>
  );
}
