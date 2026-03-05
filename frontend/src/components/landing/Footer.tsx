export function Footer() {
  return (
    <footer className="border-t border-foreground/5 px-6 py-8 lg:px-8">
      <div className="mx-auto flex max-w-4xl items-center justify-between text-sm text-muted">
        <span className="font-semibold text-foreground">FullCut</span>
        <span>&copy; {new Date().getFullYear()} FullCut</span>
      </div>
    </footer>
  );
}
