export default function Footer() {
  return (
    <footer>
      <div className="wrapper" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span>© {new Date().getFullYear()} Farovon Group — Все права защищены</span>
        <span>Корпоративная премия «Farovon Awards»</span>
      </div>
    </footer>
  );
}
