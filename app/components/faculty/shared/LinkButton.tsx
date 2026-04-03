type LinkButtonProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean; // If true, adds target="_blank" rel="noreferrer"
};

export function LinkButton({
  href,
  children,
  external = false,
}: LinkButtonProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="w-full block text-center py-3 bg-[#C0E0FF] text-[#0B99FF] rounded-lg font-semibold text-xs"
    >
      {children}
    </a>
  );
}
