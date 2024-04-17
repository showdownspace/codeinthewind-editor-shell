export interface UserId {
  id: string;
}
export function UserId(props: UserId) {
  let back = "";
  const front = props.id.replace(/....$/, (match) => {
    back = match;
    return "";
  });
  return (
    <>
      {front}
      <u>{back}</u>
    </>
  );
}
