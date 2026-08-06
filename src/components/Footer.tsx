interface FooterProps {
  leftText?: string;
  rightText?: string;
}

export default function Footer({ leftText, rightText }: FooterProps) {
  return (
    <footer>
      <div className="wrapper" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span>{leftText || `© ${new Date().getFullYear()} Farovon Group — Все права защищены`}</span>
        <span>{rightText || 'Корпоративная премия «Farovon Awards»'}</span>
      </div>
    </footer>
  );
}
