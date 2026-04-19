import { useEffect, useMemo, useState, useCallback } from 'react';
import { tracer } from './tracing.js';

const TOKEN_KEY = 'rwa_eudr_token';

function LoginScreen({ onSubmit, error, busy }) {
  const [username, setUsername] = useState('operador');
  const [password, setPassword] = useState('operador123');

  return (
    <section className="panel" style={{ maxWidth: 420, margin: '48px auto' }}>
      <h2 style={{ marginTop: 0 }}>Acceso RWA EUDR</h2>
      <p style={{ color: '#666' }}>Credenciales demo: operador/operador123 o admin/admin123</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(username, password);
        }}
        style={{ display: 'grid', gap: 10 }}
      >
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
        {error && <p style={{ color: '#e74c3c', margin: 0 }}>{error}</p>}
        <button disabled={busy}>{busy ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
    </section>
  );
}

function PanelCard({ title, value, description, color }) {
  return (
    <article className="card" style={color ? { borderLeft: `4px solid ${color}` } : {}}>
      <h2>{title}</h2>
      <p className="large">{value}</p>
      <p>{description}</p>
    </article>
  );
}

function ComplianceCard({ report }) {
  const statusColors = { COMPLIANT: '#27ae60', PARTIAL: '#f39c12', NON_COMPLIANT: '#e74c3c' };
  const color = statusColors[report.status] || '#95a5a6';
  return (
    <div className="panel-box" style={{ borderLeft: `4px solid ${color}`, marginBottom: '10px' }}>
      <strong>{report.lotId}</strong> - <span style={{ color }}>{report.status}</span> - {report.weightedScore}%
      <div style={{ fontSize: 12, color: '#666' }}>{new Date(report.timestamp).toLocaleString()}</div>
    </div>
  );
}

function DdsCard({ dds }) {
  const ok = dds.status === 'READY_FOR_REVIEW';
  return (
    <div className="panel-box" style={{ borderLeft: `4px solid ${ok ? '#27ae60' : '#f39c12'}`, marginBottom: '10px' }}>
      <strong>{dds.id}</strong> - {dds.status}
      <div style={{ fontSize: 12, color: '#666' }}>
        Lote: {dds.lotId} | Geo: {dds.geolocationEvidence?.hasCoordinates ? 'OK' : 'Pendiente'} | Hash: {(dds.hash || '').slice(0, 10)}...
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loginBusy, setLoginBusy] = useState(false);

  const [panel, setPanel] = useState('dashboard');
  const [data, setData] = useState({ producers: [], lots: [], marketStats: {} });
  const [traces, setTraces] = useState([]);
  const [services, setServices] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [blockchain, setBlockchain] = useState({ height: 0, lastHash: '', chain: [] });
  const [complianceReports, setComplianceReports] = useState([]);
  const [complianceSummary, setComplianceSummary] = useState({});
  const [ddsReports, setDdsReports] = useState([]);

  const [selectedLot, setSelectedLot] = useState(null);
  const [checking, setChecking] = useState(false);
  const [creatingDds, setCreatingDds] = useState(false);
  const [isLoading, setIsLoading] = useState(!!token);
  const [error, setError] = useState(null);

  const authHeaders = useCallback((t = token) => (t ? { Authorization: `Bearer ${t}` } : {}), [token]);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const h = authHeaders(token);
      const [dataRes, tracesRes, servicesRes, alertsRes, blockchainRes, complianceRes, summaryRes, ddsRes] = await Promise.all([
        fetch('/api/data', { headers: h }),
        fetch('/api/traces'),
        fetch('/api/services/status', { headers: h }),
        fetch('/api/alerts', { headers: h }),
        fetch('/api/blockchain', { headers: h }),
        fetch('/api/compliance/reports', { headers: h }),
        fetch('/api/compliance/summary', { headers: h }),
        fetch('/api/eudr/due-diligence', { headers: h })
      ]);

      if ([dataRes, servicesRes, alertsRes, blockchainRes, complianceRes, summaryRes, ddsRes].some((r) => r.status === 401)) {
        clearSession();
        setAuthError('Sesión no válida o expirada.');
        setIsLoading(false);
        return;
      }

      if (dataRes.ok) {
        const d = await dataRes.json();
        setData(d);
        setSelectedLot((prev) => prev ?? d.lots?.[0] ?? null);
      }
      if (tracesRes.ok) setTraces((await tracesRes.json()).traces || []);
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (alertsRes.ok) setAlerts((await alertsRes.json()).alerts || []);
      if (blockchainRes.ok) setBlockchain(await blockchainRes.json());
      if (complianceRes.ok) setComplianceReports((await complianceRes.json()).reports || []);
      if (summaryRes.ok) setComplianceSummary((await summaryRes.json()).summary || {});
      if (ddsRes.ok) setDdsReports((await ddsRes.json()).ddsReports || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, authHeaders, clearSession]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/me', { headers: authHeaders(token) })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('401'))))
      .then((j) => setUser(j.user))
      .catch(() => {
        clearSession();
        setAuthError('Sesión no válida o expirada.');
      });
  }, [token, authHeaders, clearSession]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    tracer.startSpan('app.init');
    setIsLoading(true);
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [token, loadData]);

  const handleLogin = async (username, password) => {
    setLoginBusy(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.token) {
        setAuthError(body.error || 'Credenciales inválidas');
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, body.token);
      setToken(body.token);
      setUser(body.user || null);
      setIsLoading(true);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: authHeaders() });
    } catch {
      // ignore
    }
    clearSession();
  };

  const handleComplianceCheck = async () => {
    if (!selectedLot || !token) return;
    setChecking(true);
    try {
      const res = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          lotId: selectedLot.id,
          parcelId: selectedLot.parcel,
          product: selectedLot.product,
          lat: selectedLot.lat,
          lon: selectedLot.lon,
          region: selectedLot.producer
        })
      });
      if (res.ok) {
        const report = await res.json();
        setComplianceReports((prev) => [report, ...prev].slice(0, 20));
        await loadData();
      }
    } finally {
      setChecking(false);
    }
  };

  const handleCreateDds = async () => {
    if (!selectedLot || !token) return;
    setCreatingDds(true);
    try {
      const res = await fetch(`/api/eudr/due-diligence/${selectedLot.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ operator: user?.username })
      });
      if (res.ok) {
        const payload = await res.json();
        setDdsReports((prev) => [payload.dds, ...prev].slice(0, 20));
      }
    } finally {
      setCreatingDds(false);
    }
  };

  const traceCards = useMemo(() => [
    { title: 'Estado EUDR', value: `${complianceSummary.avgScore || 0}%`, description: 'Score promedio', color: '#27ae60' },
    { title: 'Productores', value: data.producers?.length || 0, description: 'Registrados' },
    { title: 'Lotes', value: data.lots?.length || 0, description: 'Con trazabilidad' },
    { title: 'Alertas', value: alerts.filter((a) => !a.read).length, description: 'No leídas', color: '#e74c3c' }
  ], [data, alerts, complianceSummary]);

  if (!token) return <LoginScreen onSubmit={handleLogin} error={authError} busy={loginBusy} />;

  return (
    <>
      <section className="panel cards">
        {traceCards.map((card) => (
          <PanelCard key={card.title} {...card} />
        ))}
      </section>

      <section className="panel hero-panel">
        <div className="panel-header">
          <div>
            <h2>RWA EUDR - Trazabilidad Agroexportadora</h2>
            <p>Usuario: {user?.username || 'N/A'} ({user?.role || 'N/A'})</p>
          </div>
          <div className="hero-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setPanel('dashboard')} className={panel === 'dashboard' ? 'active' : ''}>Dashboard</button>
            <button onClick={() => setPanel('traceability')} className={panel === 'traceability' ? 'active' : ''}>Trazabilidad</button>
            <button onClick={() => setPanel('compliance')} className={panel === 'compliance' ? 'active' : ''}>Compliance</button>
            <button onClick={() => setPanel('alerts')} className={panel === 'alerts' ? 'active' : ''}>Alertas</button>
            <button onClick={handleLogout}>Salir</button>
          </div>
        </div>
      </section>

      {isLoading && <section className="panel"><p>Cargando...</p></section>}
      {error && <section className="panel"><p style={{ color: '#e74c3c' }}>Error: {error}</p></section>}

      {!isLoading && !error && panel === 'dashboard' && (
        <section className="panel">
          <div className="grid-2">
            <div className="panel-box">
              <h3>Mercado</h3>
              <p>Cacao: ${(data.marketStats?.cacao?.export2025 / 1000000000 || 0).toFixed(1)}B</p>
              <p>Café: ${(data.marketStats?.cafe?.export2025 / 1000000000 || 0).toFixed(1)}B</p>
              <p>Trazas: {traces.length}</p>
            </div>
            <div className="panel-box">
              <h3>Blockchain</h3>
              <p>Bloques: {blockchain.height || 0}</p>
              <p style={{ fontFamily: 'monospace', fontSize: 12 }}>Hash: {(blockchain.lastHash || '').slice(0, 20)}...</p>
            </div>
          </div>
        </section>
      )}

      {!isLoading && !error && panel === 'traceability' && (
        <section className="panel">
          <div className="grid-2">
            <div className="panel-box">
              <h3>Productores</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.producers?.map((p) => (
                  <li key={p.id} style={{ padding: 6, borderBottom: '1px solid #eee' }}>{p.name} - {p.region}</li>
                ))}
              </ul>
            </div>
            <div className="panel-box">
              <h3>Lotes</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.lots?.map((l) => (
                  <li key={l.id} style={{ padding: 6, borderBottom: '1px solid #eee' }}>{l.id} - {l.product} - {l.eudr}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {!isLoading && !error && panel === 'compliance' && (
        <section className="panel">
          <div style={{ marginBottom: 12 }}>
            <select
              value={selectedLot?.id || ''}
              onChange={(e) => setSelectedLot(data.lots?.find((l) => l.id === e.target.value))}
              style={{ padding: 8, width: 320, marginRight: 8 }}
            >
              {data.lots?.map((lot) => (
                <option key={lot.id} value={lot.id}>{lot.id} - {lot.product}</option>
              ))}
            </select>
            <button onClick={handleComplianceCheck} disabled={checking || !selectedLot}>{checking ? 'Verificando...' : 'Verificar Compliance'}</button>
            <button onClick={handleCreateDds} disabled={creatingDds || !selectedLot} style={{ marginLeft: 8 }}>
              {creatingDds ? 'Generando DDS...' : 'Generar DDS'}
            </button>
          </div>

          <h3>Reportes de Compliance</h3>
          {complianceReports.slice(0, 5).map((report) => (
            <ComplianceCard key={report.id} report={report} />
          ))}

          <h3 style={{ marginTop: 16 }}>Declaraciones DDS</h3>
          {ddsReports.slice(0, 5).map((dds) => (
            <DdsCard key={dds.id} dds={dds} />
          ))}
        </section>
      )}

      {!isLoading && !error && panel === 'alerts' && (
        <section className="panel">
          <h3>Alertas ({alerts.filter((a) => !a.read).length} no leídas)</h3>
          {alerts.slice(0, 10).map((a) => (
            <div key={a.id} className="panel-box" style={{ marginBottom: 8 }}>
              <strong>{a.type}</strong> - {a.message}
            </div>
          ))}
        </section>
      )}
    </>
  );
}

export default App;
