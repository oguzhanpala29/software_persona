import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, Check,
  CheckCircle2, ChevronRight, ClipboardCheck, Download, Factory, FileBarChart,
  Gauge, LayoutDashboard, Menu, Plus, Search, Settings, ShieldCheck, Sparkles,
  Trash2, X, Wrench
} from 'lucide-react';
import './styles.css';

const initialRecords = [
  { id: 'QV-1048', part: 'Hassas Bağlantı Plakası', code: 'PLK-220', machine: 'CNC-04', operator: 'Ahmet Yılmaz', date: '2026-11-16', value: 0.032, tolerance: 0.050, note: 'Ölçüm normal aralıkta.' },
  { id: 'QV-1047', part: 'Mil Yataklama Gövdesi', code: 'MYG-115', machine: 'CNC-02', operator: 'Zeynep Kaya', date: '2026-11-16', value: 0.064, tolerance: 0.050, note: 'Düzlemsellik toleransı aşıldı.' },
  { id: 'QV-1046', part: 'Alüminyum Montaj Bloğu', code: 'AMB-310', machine: 'CNC-01', operator: 'Mehmet Demir', date: '2026-11-15', value: 0.018, tolerance: 0.050, note: 'Ölçüm normal aralıkta.' },
  { id: 'QV-1045', part: 'Sensör Taşıyıcı', code: 'STS-080', machine: 'CNC-03', operator: 'Elif Şahin', date: '2026-11-15', value: 0.051, tolerance: 0.050, note: 'Tolerans sınırının üzerinde.' },
  { id: 'QV-1044', part: 'Hassas Bağlantı Plakası', code: 'PLK-220', machine: 'CNC-04', operator: 'Ahmet Yılmaz', date: '2026-11-14', value: 0.027, tolerance: 0.050, note: 'Ölçüm normal aralıkta.' },
  { id: 'QV-1043', part: 'Flanş Adaptörü', code: 'FAD-090', machine: 'CNC-05', operator: 'Can Arslan', date: '2026-11-14', value: 0.043, tolerance: 0.050, note: 'Ölçüm normal aralıkta.' }
];

const trendData = [
  { day: '10 Kas', pass: 34, fail: 5 }, { day: '11 Kas', pass: 41, fail: 4 },
  { day: '12 Kas', pass: 38, fail: 7 }, { day: '13 Kas', pass: 46, fail: 3 },
  { day: '14 Kas', pass: 43, fail: 6 }, { day: '15 Kas', pass: 49, fail: 4 },
  { day: '16 Kas', pass: 52, fail: 3 }
];

const navigation = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'records', label: 'Ölçüm Kayıtları', icon: ClipboardCheck },
  { id: 'analytics', label: 'Analiz & Raporlar', icon: FileBarChart }
];

const formatValue = value => Number(value).toFixed(3);
const getStatus = record => Number(record.value) <= Number(record.tolerance) ? 'PASS' : 'FAIL';

function App() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('qv-inspections');
      return saved ? JSON.parse(saved) : initialRecords;
    } catch {
      return initialRecords;
    }
  });
  const [page, setPage] = useState('overview');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    part: '', code: '', machine: 'CNC-01', operator: '',
    date: new Date().toISOString().slice(0, 10), value: '', tolerance: '0.050', note: ''
  });

  const stats = useMemo(() => {
    const passed = records.filter(record => getStatus(record) === 'PASS').length;
    const failed = records.length - passed;
    return {
      total: records.length,
      passed,
      failed,
      rate: records.length ? Math.round((passed / records.length) * 100) : 0
    };
  }, [records]);

  const visibleRecords = records.filter(record => {
    const matchesFilter = filter === 'ALL' || getStatus(record) === filter;
    const searchable = [record.id, record.part, record.code, record.machine, record.operator]
      .join(' ').toLocaleLowerCase('tr');
    return matchesFilter && searchable.includes(search.toLocaleLowerCase('tr'));
  });

  const notify = message => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };

  const saveRecords = nextRecords => {
    setRecords(nextRecords);
    localStorage.setItem('qv-inspections', JSON.stringify(nextRecords));
  };

  const addRecord = event => {
    event.preventDefault();
    const value = Number(form.value);
    const tolerance = Number(form.tolerance);
    if (!form.part.trim() || !form.code.trim() || !form.operator.trim() ||
        !Number.isFinite(value) || value < 0 || !Number.isFinite(tolerance) || tolerance <= 0) {
      notify('Lütfen zorunlu alanları kontrol edin.');
      return;
    }

    const record = {
      ...form,
      id: 'QV-' + (1049 + records.length),
      value,
      tolerance
    };
    saveRecords([record, ...records]);
    setShowModal(false);
    setForm({
      part: '', code: '', machine: 'CNC-01', operator: '',
      date: new Date().toISOString().slice(0, 10), value: '', tolerance: '0.050', note: ''
    });
    notify(getStatus(record) === 'PASS' ? 'Ölçüm kaydı eklendi: PASS' : 'Ölçüm kaydı eklendi: FAIL');
  };

  const deleteRecord = id => {
    if (window.confirm(id + ' kaydı silinsin mi?')) {
      saveRecords(records.filter(record => record.id !== id));
      notify('Ölçüm kaydı silindi.');
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Kayıt No', 'Parça', 'Parça Kodu', 'Makine', 'Operatör', 'Tarih', 'Ölçüm (mm)', 'Tolerans (mm)', 'Sonuç'],
      ...records.map(record => [
        record.id, record.part, record.code, record.machine, record.operator,
        record.date, record.value, record.tolerance, getStatus(record)
      ])
    ];
    const csv = '\uFEFF' + rows.map(row =>
      row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(';')
    ).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'qualityvision-olcum-raporu.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    notify('CSV raporu indirildi.');
  };

  const resetDemo = () => {
    if (window.confirm('Demo verileri ilk haline döndürülsün mü?')) {
      saveRecords(initialRecords);
      notify('Demo verileri yenilendi.');
    }
  };

  const currentLabel = navigation.find(item => item.id === page)?.label || 'Genel Bakış';

  return (
    <div className="app-shell">
      <aside className={'sidebar ' + (mobileNav ? 'open' : '')}>
        <div className="brand">
          <div className="brand-mark"><Gauge size={21} /></div>
          <div><strong>QualityVision</strong><span>INDUSTRIAL INTELLIGENCE</span></div>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Menüyü kapat"><X size={18} /></button>
        </div>
        <div className="side-label">ÇALIŞMA ALANI</div>
        <div className="workspace">
          <div className="workspace-icon"><Factory size={18} /></div>
          <div><b>Üretim Tesisi</b><small>İstanbul · Fabrika 01</small></div>
          <span className="workspace-chevron">⌄</span>
        </div>
        <div className="side-label">MENÜ</div>
        <nav>
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={'nav-item ' + (page === item.id ? 'active' : '')}
                onClick={() => { setPage(item.id); setMobileNav(false); }}>
                <Icon size={18} /><span>{item.label}</span>
                {item.id === 'records' && <em>{records.length}</em>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <Sparkles size={18} />
            <b>Akıllı kalite takibi</b>
            <p>Ölçüm sonuçlarını kaydedin, tolerans dışı değerleri kolayca görün.</p>
          </div>
          <button className="nav-item settings-link" onClick={() => notify('Ayarlar bu demo sürümünde etkin değil.')}><Settings size={18} />Ayarlar</button>
          <div className="profile"><div className="avatar">OP</div><div><b>Operatör Paneli</b><small>Yönetici</small></div></div>
        </div>
      </aside>

      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}

      <main className="main-content">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Menüyü aç"><Menu size={20} /></button>
            <div className="breadcrumb">Çalışma Alanı <ChevronRight size={14} /> <b>{currentLabel}</b></div>
          </div>
          <div className="top-actions">
            <div className="system-status"><span /> Sistem aktif</div>
            <button className="icon-btn" onClick={() => notify('Yeni bildiriminiz bulunmuyor.')} aria-label="Bildirimler"><Bell size={18} /></button>
            <div className="top-avatar">OP</div>
          </div>
        </header>

        <div className="page-wrap">
          {page === 'overview' && (
            <>
              <PageHeading title="Genel Bakış" description="Üretim kalitenizin güncel durumunu buradan takip edin."
                eyebrow="KALİTE KONTROL MERKEZİ" onAdd={() => setShowModal(true)} />
              <Stats stats={stats} />
              <section className="dashboard-grid">
                <div className="panel chart-panel">
                  <div className="panel-head"><div><h3>Ölçüm Performansı</h3><p>Son 7 günlük örnek kalite kontrol özeti</p></div><Legend /></div>
                  <TrendChart />
                </div>
                <div className="panel quality-panel">
                  <div className="panel-head"><div><h3>Kalite Dağılımı</h3><p>Mevcut ölçüm kayıtları</p></div>
                    <button className="text-btn" onClick={() => setPage('analytics')}>Detaylar <ChevronRight size={14} /></button>
                  </div>
                  <div className="donut-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={[{ name: 'Başarılı', value: stats.passed }, { name: 'Başarısız', value: stats.failed }]}
                        dataKey="value" innerRadius={59} outerRadius={81} paddingAngle={4} stroke="none">
                        <Cell fill="#1caf87" /><Cell fill="#ec7078" />
                      </Pie></PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center"><strong>{stats.rate}%</strong><span>Başarı</span></div>
                  </div>
                  <div className="quality-legend">
                    <div><span><i className="dot-pass" /> Başarılı</span><b>{stats.passed}</b></div>
                    <div><span><i className="dot-fail" /> Başarısız</span><b>{stats.failed}</b></div>
                  </div>
                </div>
              </section>
              <section className="panel recent-panel">
                <div className="panel-head"><div><h3>Son Ölçüm Kayıtları</h3><p>En son gerçekleştirilen kalite kontrolleri</p></div>
                  <button className="text-btn" onClick={() => setPage('records')}>Tüm kayıtları gör <ChevronRight size={14} /></button>
                </div>
                <RecordsTable records={records.slice(0, 5)} onDelete={deleteRecord} compact />
              </section>
              <Insight records={records} />
            </>
          )}

          {page === 'records' && (
            <>
              <PageHeading title="Ölçüm Kayıtları" description="Tüm ölçüm sonuçlarını görüntüleyin ve yönetin."
                eyebrow="KALİTE YÖNETİMİ" onAdd={() => setShowModal(true)} />
              <div className="panel records-panel">
                <div className="toolbar">
                  <div className="search-box"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Parça, kayıt no veya operatör ara..." /></div>
                  <select value={filter} onChange={event => setFilter(event.target.value)}>
                    <option value="ALL">Tüm sonuçlar</option><option value="PASS">Başarılı (PASS)</option><option value="FAIL">Başarısız (FAIL)</option>
                  </select>
                  <button className="secondary-btn" onClick={exportCsv}><Download size={16} /> CSV Dışa Aktar</button>
                </div>
                <RecordsTable records={visibleRecords} onDelete={deleteRecord} />
                <div className="table-footer">Toplam <b>{visibleRecords.length}</b> kayıt gösteriliyor <button onClick={resetDemo}>Demo verilerini sıfırla</button></div>
              </div>
            </>
          )}

          {page === 'analytics' && (
            <>
              <PageHeading title="Analiz & Raporlar" description="Ölçüm verilerinizden kalite göstergeleri elde edin."
                eyebrow="VERİ ODAKLI KARARLAR" onAdd={exportCsv} actionLabel="Raporu İndir" actionIcon="download" />
              <Stats stats={stats} />
              <div className="panel analytics-chart"><div className="panel-head"><div><h3>Günlük Ölçüm Trendleri</h3><p>Arayüzü göstermek için hazırlanmış örnek haftalık veri</p></div></div><TrendChart /></div>
              <Insight records={records} />
              <p className="disclaimer">Not: Grafikteki günlük trend değerleri örnek veridir. Üstteki göstergeler kayıtlarınızdaki verilere göre hesaplanır.</p>
            </>
          )}
        </div>

        <footer className="footer"><span>© 2026 QualityVision AI</span><span>Endüstriyel Kalite Kontrol Platformu <i /> v1.0.0</span></footer>
      </main>

      {showModal && (
        <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowModal(false); }}>
          <form className="modal" onSubmit={addRecord}>
            <div className="modal-head"><div><div className="eyebrow">YENİ KAYIT</div><h2>Ölçüm Ekle</h2><p>Parça ölçüm bilgilerini girin.</p></div>
              <button type="button" className="icon-btn" onClick={() => setShowModal(false)} aria-label="Kapat"><X size={20} /></button>
            </div>
            <div className="form-grid">
              <label className="wide">Parça adı<input required value={form.part} onChange={event => setForm({ ...form, part: event.target.value })} placeholder="Örn. Hassas Bağlantı Plakası" /></label>
              <label>Parça kodu<input required value={form.code} onChange={event => setForm({ ...form, code: event.target.value })} placeholder="PLK-220" /></label>
              <label>Makine<select value={form.machine} onChange={event => setForm({ ...form, machine: event.target.value })}>{['CNC-01', 'CNC-02', 'CNC-03', 'CNC-04', 'CNC-05'].map(machine => <option key={machine}>{machine}</option>)}</select></label>
              <label>Operatör<input required value={form.operator} onChange={event => setForm({ ...form, operator: event.target.value })} placeholder="Ad Soyad" /></label>
              <label>Tarih<input required type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></label>
              <label>Ölçülen değer (mm)<input required type="number" min="0" step="0.001" value={form.value} onChange={event => setForm({ ...form, value: event.target.value })} placeholder="0.032" /></label>
              <label>Tolerans sınırı (mm)<input required type="number" min="0.001" step="0.001" value={form.tolerance} onChange={event => setForm({ ...form, tolerance: event.target.value })} /></label>
              <label className="wide">Not (isteğe bağlı)<textarea rows="2" value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} placeholder="Ölçümle ilgili açıklama..." /></label>
            </div>
            <div className="form-hint"><ShieldCheck size={16} /> Ölçülen değer tolerans sınırına eşit veya küçükse sonuç PASS olur.</div>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Vazgeç</button><button className="primary-btn" type="submit"><Plus size={16} /> Kaydı Oluştur</button></div>
          </form>
        </div>
      )}

      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

function PageHeading({ title, description, eyebrow, onAdd, actionLabel = 'Yeni Ölçüm Ekle', actionIcon }) {
  return (
    <div className="page-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      <button className="primary-btn" onClick={onAdd}>{actionIcon === 'download' ? <Download size={17} /> : <Plus size={17} />}{actionLabel}</button>
    </div>
  );
}

function Stats({ stats }) {
  return (
    <section className="stat-grid">
      <StatCard title="Toplam Ölçüm" value={stats.total} sub="Kayıtlı ölçüm" icon={ClipboardCheck} tone="blue" trend="+12.8%" up />
      <StatCard title="Başarılı Ölçüm" value={stats.passed} sub="Tolerans dahilinde" icon={CheckCircle2} tone="green" trend="+8.2%" up />
      <StatCard title="Başarısız Ölçüm" value={stats.failed} sub="İnceleme gerekiyor" icon={AlertTriangle} tone="red" trend="-2.4%" />
      <StatCard title="Başarı Oranı" value={stats.rate + '%'} sub="Genel kalite oranı" icon={Activity} tone="purple" trend="+3.6%" up />
    </section>
  );
}

function StatCard({ title, value, sub, icon: Icon, tone, trend, up }) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span>{title}</span><div className={'stat-icon ' + tone}><Icon size={18} /></div></div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom"><span>{sub}</span><em className={up ? 'positive' : 'negative'}>{up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{trend}</em></div>
    </div>
  );
}

function Legend() {
  return <div className="legend"><span><i className="dot-pass" /> Başarılı</span><span><i className="dot-fail" /> Başarısız</span></div>;
}

function TrendChart() {
  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="passFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#23b58a" stopOpacity={0.2} /><stop offset="100%" stopColor="#23b58a" stopOpacity={0} /></linearGradient>
            <linearGradient id="failFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef6b73" stopOpacity={0.16} /><stop offset="100%" stopColor="#ef6b73" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf0f4" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 11 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 11 }} />
          <Tooltip contentStyle={{ border: '1px solid #edf0f4', borderRadius: 10, fontSize: 12 }} />
          <Area type="monotone" dataKey="pass" name="Başarılı" stroke="#20ae84" strokeWidth={2.5} fill="url(#passFill)" />
          <Area type="monotone" dataKey="fail" name="Başarısız" stroke="#e76b73" strokeWidth={2.5} fill="url(#failFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Status({ status }) {
  return <span className={'status ' + (status === 'PASS' ? 'pass' : 'fail')}><i />{status === 'PASS' ? 'Başarılı' : 'Başarısız'}</span>;
}

function RecordsTable({ records, onDelete, compact = false }) {
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>KAYIT NO</th><th>PARÇA / KOD</th><th>MAKİNE</th><th>ÖLÇÜM</th><th>TOLERANS</th><th>SONUÇ</th><th>TARİH</th>{!compact && <th />}</tr></thead>
        <tbody>
          {records.length === 0 ? <tr><td colSpan="8" className="empty">Aramanızla eşleşen kayıt bulunamadı.</td></tr> :
            records.map(record => (
              <tr key={record.id}>
                <td><b className="record-id">{record.id}</b></td>
                <td><div className="part-name">{record.part}</div><small className="muted">{record.code}</small></td>
                <td><span className="machine"><Wrench size={13} />{record.machine}</span></td>
                <td><b className={getStatus(record) === 'FAIL' ? 'bad-value' : ''}>{formatValue(record.value)} <small>mm</small></b></td>
                <td>{formatValue(record.tolerance)} <small>mm</small></td>
                <td><Status status={getStatus(record)} /></td>
                <td className="date-cell">{new Date(record.date + 'T12:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                {!compact && <td><button className="delete-btn" title="Kaydı sil" onClick={() => onDelete(record.id)}><Trash2 size={15} /></button></td>}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

function Insight({ records }) {
  const failures = records.filter(record => getStatus(record) === 'FAIL');
  const worst = failures.length ? failures.reduce((a, b) => a.value / a.tolerance > b.value / b.tolerance ? a : b) : null;
  return (
    <section className="insight">
      <div className="insight-icon"><Sparkles size={19} /></div>
      <div>
        <div className="insight-title">Akıllı Kalite Özeti <span>KURAL TABANLI ANALİZ</span></div>
        {worst
          ? <p><b>{worst.part}</b> için {formatValue(worst.value)} mm ölçüm değeri, {formatValue(worst.tolerance)} mm tolerans sınırını aşıyor. İlgili parçanın üretim ve ölçüm koşullarını kontrol etmeniz önerilir. Bu değerlendirme kayıt verilerine dayalı kural tabanlı bir uyarıdır.</p>
          : <p>Mevcut kayıtlarda tolerans dışı ölçüm bulunmuyor. Yeni ölçüm eklendikçe bu alan otomatik güncellenir.</p>}
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
