export function FooterSection() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          {/* Left */}
          <div className="flex items-center gap-2">
            <span className="font-Zhi_Mang_Xing text-base font-semibold text-foreground">
              半栈人生
            </span>
            <span className="hidden sm:inline">© 2014–2025</span>
          </div>

          {/* Right */}
          <div className="text-center md:text-right">
            <span>Copyright © 2014–2025</span>{" "}
            <span className="font-medium text-foreground">
              Zexiang
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
