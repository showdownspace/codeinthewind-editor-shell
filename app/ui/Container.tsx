export interface Container {
  children?: React.ReactNode;
}

export function Container(props: Container) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="mb-6 pb-1 border-b border-b-slate-700 text-slate-500">
        Code in the Wind
      </h1>
      {props.children}
    </div>
  );
}
