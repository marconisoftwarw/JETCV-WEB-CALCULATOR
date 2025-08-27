import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Plus, Download, RotateCcw, Trash2, TrendingUp, DollarSign, Users, Edit3, Save, X, Settings, PlusCircle } from "lucide-react";
import * as XLSX from "xlsx";
import "./modern-design.css";

// Registra i componenti di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Tipi di dato
interface ServizioRow {
  id: string;
  servizio: string;
  costo1000: number;
  costo10000: number;
  costo100000: number;
  [key: string]: string | number; // Per scenari custom
}

interface ScenarioCustom {
  id: string;
  nome: string;
  utenti: number;
  colore: string;
  ordinamento: number;
}

// Colori predefiniti per gli scenari
const COLORI_SCENARI = [
  '#2563eb', // Blu
  '#059669', // Verde
  '#d97706', // Arancione
  '#dc2626', // Rosso
  '#7c3aed', // Viola
  '#0891b2', // Cyan
  '#ea580c', // Orange scuro
  '#be123c', // Rose
  '#059669', // Emerald
  '#7c2d12', // Orange scuro
];

// Dati servizi ricorrenti
const SERVIZI_RICORRENTI: ServizioRow[] = [
  { id: crypto.randomUUID(), servizio: "Firebase Hosting", costo1000: 0, costo10000: 0, costo100000: 2 },
  { id: crypto.randomUUID(), servizio: "Superbase", costo1000: 30, costo10000: 30, costo100000: 30 },
  { id: crypto.randomUUID(), servizio: "AWS EC2", costo1000: 15, costo10000: 15, costo100000: 30 },
  { id: crypto.randomUUID(), servizio: "Crossmint", costo1000: 15, costo10000: 15, costo100000: 15 },
  { id: crypto.randomUUID(), servizio: "Verify(KYC)", costo1000: 60, costo10000: 60, costo100000: 60 },
  { id: crypto.randomUUID(), servizio: "FlutterFlow", costo1000: 50, costo10000: 50, costo100000: 50 },
];

// Scenari predefiniti
const SCENARI_DEFAULT: ScenarioCustom[] = [
  { id: 'scenario-1k', nome: '1K Utenti', utenti: 1000, colore: '#2563eb', ordinamento: 1 },
  { id: 'scenario-10k', nome: '10K Utenti', utenti: 10000, colore: '#059669', ordinamento: 2 },
  { id: 'scenario-100k', nome: '100K Utenti', utenti: 100000, colore: '#d97706', ordinamento: 3 },
];

export default function DashboardServizi() {
  const [serviziRicorrenti, setServiziRicorrenti] = useState<ServizioRow[]>(SERVIZI_RICORRENTI);
  const [scenariCustom, setScenariCustom] = useState<ScenarioCustom[]>(SCENARI_DEFAULT);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [showScenarioForm, setShowScenarioForm] = useState(false);
  const [nuovoScenario, setNuovoScenario] = useState({
    nome: '',
    utenti: 0,
    colore: COLORI_SCENARI[3]
  });

  // Scenari ordinati
  const scenariOrdinati = useMemo(() => 
    scenariCustom.sort((a, b) => a.ordinamento - b.ordinamento)
  , [scenariCustom]);

  // Calcoli totali per tutti gli scenari
  const totaliScenari = useMemo(() => {
    const totali: { [key: string]: { mensile: number; annuale: number } } = {};
    
    scenariOrdinati.forEach(scenario => {
      const colonnaKey = `costo${scenario.utenti}` as keyof ServizioRow;
      let totale = 0;
      
      // Se è uno scenario predefinito, usa le colonne esistenti
      if (scenario.utenti === 1000) {
        totale = serviziRicorrenti.reduce((sum, s) => sum + (s.costo1000 || 0), 0);
      } else if (scenario.utenti === 10000) {
        totale = serviziRicorrenti.reduce((sum, s) => sum + (s.costo10000 || 0), 0);
      } else if (scenario.utenti === 100000) {
        totale = serviziRicorrenti.reduce((sum, s) => sum + (s.costo100000 || 0), 0);
      } else {
        // Per scenari custom, usa la colonna dinamica
        totale = serviziRicorrenti.reduce((sum, s) => sum + (Number(s[colonnaKey]) || 0), 0);
      }
      
      totali[scenario.id] = {
        mensile: totale,
        annuale: totale * 12
      };
    });
    
    return totali;
  }, [serviziRicorrenti, scenariOrdinati]);

  // Configurazione grafici Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 16,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return `€${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter',
          },
          color: '#6b7280',
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        ticks: {
          callback: function(value: string | number) {
            return '€' + Number(value).toLocaleString();
          },
          font: {
            size: 11,
            family: 'Inter',
          },
          color: '#6b7280',
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
    },
  };

  // Genera dati per grafico di uno scenario specifico
  const getChartDataForScenario = (scenario: ScenarioCustom) => {
    const colonnaKey = `costo${scenario.utenti}` as keyof ServizioRow;
    
    return {
      labels: serviziRicorrenti.map(s => s.servizio.length > 8 ? s.servizio.substring(0, 8) + "..." : s.servizio),
      datasets: [
        {
          data: serviziRicorrenti.map(s => {
            if (scenario.utenti === 1000) return s.costo1000;
            if (scenario.utenti === 10000) return s.costo10000;
            if (scenario.utenti === 100000) return s.costo100000;
            return Number(s[colonnaKey]) || 0;
          }),
          backgroundColor: scenario.colore,
          hoverBackgroundColor: scenario.colore + 'dd',
          borderRadius: 4,
        },
      ],
    };
  };

  // Handlers
  const startEditing = (cellId: string, currentValue: string | number) => {
    setEditingCell(cellId);
    setTempValue(String(currentValue));
  };

  const saveEdit = (id: string, field: string, value: string) => {
    if (field === 'servizio') {
      setServiziRicorrenti(prev => prev.map(r => 
        r.id === id ? { ...r, servizio: value } : r
      ));
    } else {
      const numValue = Number(value) || 0;
      setServiziRicorrenti(prev => prev.map(r => 
        r.id === id ? { ...r, [field]: numValue } : r
      ));
    }
    setEditingCell(null);
    setTempValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setTempValue("");
  };

  const addServizio = () => {
    const nuovoServizio: ServizioRow = {
      id: crypto.randomUUID(),
      servizio: "Nuovo servizio",
      costo1000: 0,
      costo10000: 0,
      costo100000: 0
    };

    // Aggiungi colonne per scenari custom esistenti
    scenariCustom.forEach(scenario => {
      if (![1000, 10000, 100000].includes(scenario.utenti)) {
        nuovoServizio[`costo${scenario.utenti}`] = 0;
      }
    });

    setServiziRicorrenti(prev => [...prev, nuovoServizio]);
  };

  const removeServizio = (id: string) => {
    setServiziRicorrenti(prev => prev.filter(r => r.id !== id));
  };

  const addScenarioCustom = () => {
    if (!nuovoScenario.nome || nuovoScenario.utenti <= 0) {
      alert('Inserisci un nome valido e un numero di utenti maggiore di 0');
      return;
    }

    const nuovoId = `scenario-${Date.now()}`;
    const colonnaKey = `costo${nuovoScenario.utenti}`;
    
    // Aggiungi il nuovo scenario
    const scenario: ScenarioCustom = {
      id: nuovoId,
      nome: nuovoScenario.nome,
      utenti: nuovoScenario.utenti,
      colore: nuovoScenario.colore,
      ordinamento: scenariCustom.length + 1
    };

    setScenariCustom(prev => [...prev, scenario]);

    // Aggiungi la nuova colonna a tutti i servizi esistenti
    setServiziRicorrenti(prev => prev.map(servizio => ({
      ...servizio,
      [colonnaKey]: 0
    })));

    // Reset form
    setNuovoScenario({
      nome: '',
      utenti: 0,
      colore: COLORI_SCENARI[scenariCustom.length % COLORI_SCENARI.length]
    });
    setShowScenarioForm(false);
  };

  const removeScenario = (scenarioId: string) => {
    const scenario = scenariCustom.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Non permettere di rimuovere scenari predefiniti
    if ([1000, 10000, 100000].includes(scenario.utenti)) {
      alert('Non puoi rimuovere gli scenari predefiniti');
      return;
    }

    const colonnaKey = `costo${scenario.utenti}`;
    
    // Rimuovi scenario
    setScenariCustom(prev => prev.filter(s => s.id !== scenarioId));

    // Rimuovi colonna da tutti i servizi
    setServiziRicorrenti(prev => prev.map(servizio => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [colonnaKey]: _, ...resto } = servizio;
      return resto as ServizioRow;
    }));
  };

  const reset = () => {
    setServiziRicorrenti(SERVIZI_RICORRENTI.map(r => ({ ...r, id: crypto.randomUUID() })));
    setScenariCustom(SCENARI_DEFAULT);
    setShowScenarioForm(false);
  };

  const exportCSV = () => {
    const data = serviziRicorrenti.map(servizio => {
      const row: { [key: string]: string | number } = { Servizio: servizio.servizio };
      scenariOrdinati.forEach(scenario => {
        if (scenario.utenti === 1000) row[scenario.nome] = servizio.costo1000;
        else if (scenario.utenti === 10000) row[scenario.nome] = servizio.costo10000;
        else if (scenario.utenti === 100000) row[scenario.nome] = servizio.costo100000;
        else row[scenario.nome] = servizio[`costo${scenario.utenti}`] || 0;
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Costi Servizi");
    XLSX.writeFile(wb, "costi-servizi-custom.csv");
  };

  return (
    <div className="app-container">
      <div className="main-content">
        
        {/* Header */}
        <div className="header">
          <div className="header-content">
          <div>
              <h1 className="header-title">Cloud Cost Calculator</h1>
              <p className="header-subtitle">Analizza costi con scenari personalizzabili</p>
            </div>
            <div className="header-actions">
              <button 
                onClick={() => setShowScenarioForm(true)} 
                className="btn btn-primary"
                title="Aggiungi scenario personalizzato"
              >
                <PlusCircle className="btn-icon"/>
                Nuovo Scenario
              </button>
              <button onClick={addServizio} className="btn btn-secondary">
                <Plus className="btn-icon"/>
                Servizio
              </button>
              <button onClick={reset} className="btn btn-secondary">
                <RotateCcw className="btn-icon"/>
                Reset
              </button>
              <button onClick={exportCSV} className="btn btn-secondary">
                <Download className="btn-icon"/>
                Export
              </button>
          </div>
          </div>
        </div>

        {/* Form Nuovo Scenario */}
        {showScenarioForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-xl)',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                Crea Scenario Personalizzato
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Nome Scenario
                </label>
                <input
                  type="text"
                  value={nuovoScenario.nome}
                  onChange={(e) => setNuovoScenario(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="es. 5K Utenti, Startup, Enterprise..."
                  className="edit-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Numero Utenti
                </label>
                <input
                  type="number"
                  value={nuovoScenario.utenti || ''}
                  onChange={(e) => setNuovoScenario(prev => ({ ...prev, utenti: Number(e.target.value) }))}
                  placeholder="5000"
                  className="edit-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Colore
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {COLORI_SCENARI.map((colore, index) => (
                    <button
                      key={index}
                      onClick={() => setNuovoScenario(prev => ({ ...prev, colore }))}
                      style={{
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: colore,
                        border: nuovoScenario.colore === colore ? '3px solid #333' : '2px solid #ddd',
                        borderRadius: '50%',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowScenarioForm(false)}
                  className="btn btn-secondary"
                >
                  Annulla
                </button>
                <button 
                  onClick={addScenarioCustom}
                  className="btn btn-primary"
                >
                  Crea Scenario
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content">
          
          {/* Stats Cards Dinamiche */}
          <div className="stats-grid">
            {scenariOrdinati.map((scenario, index) => (
              <div key={scenario.id} className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-header">
                    <div 
                      className="stat-icon"
                      style={{ backgroundColor: scenario.colore + '20', color: scenario.colore }}
                    >
                      {index === 0 ? <Users size={24} /> : 
                       index === 1 ? <TrendingUp size={24} /> : 
                       <DollarSign size={24} />}
                    </div>
                    <div>
                      <h3 className="stat-title">{scenario.nome}</h3>
                      <div className="stat-value">€{totaliScenari[scenario.id]?.mensile.toLocaleString() || '0'}</div>
                    </div>
                  </div>
                  </div>
                <div className="stat-footer">
                  <div className="stat-footer-text">
                    <span className="stat-highlight">{scenario.utenti.toLocaleString()} utenti</span> • 
                    €{totaliScenari[scenario.id]?.annuale.toLocaleString() || '0'} all'anno
                    {![1000, 10000, 100000].includes(scenario.utenti) && (
                      <button 
                        onClick={() => removeScenario(scenario.id)}
                        style={{ 
                          marginLeft: '0.5rem', 
                          color: 'var(--danger-color)', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                        title="Rimuovi scenario"
                      >
                        <Trash2 size={12}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Layout principale */}
          <div className="main-layout">
            
            {/* Tabella Editabile Dinamica */}
            <div className="table-section">
              <div className="table-header">
                <h2 className="table-title">Tabella Costi Multi-Scenario</h2>
                <p className="table-description">
                  Gestisci costi per tutti gli scenari. Clicca per modificare.
                </p>
        </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Servizio</th>
                      {scenariOrdinati.map(scenario => (
                        <th key={scenario.id} className="text-center">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <div 
                              style={{
                                width: '0.75rem',
                                height: '0.75rem',
                                backgroundColor: scenario.colore,
                                borderRadius: '50%'
                              }}
                            />
                            {scenario.nome}
                          </div>
                        </th>
                      ))}
                      <th className="text-center">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviziRicorrenti.map((servizio) => (
                      <tr key={servizio.id}>
                        <td>
                          {editingCell === `${servizio.id}-servizio` ? (
                            <div className="edit-form">
                              <input
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="edit-input"
                                autoFocus
                                placeholder="Nome servizio"
                              />
                              <div className="edit-actions">
                                <button
                                  onClick={() => saveEdit(servizio.id, 'servizio', tempValue)}
                                  className="edit-btn edit-btn-save"
                                >
                                  <Save size={12}/>
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="edit-btn edit-btn-cancel"
                                >
                                  <X size={12}/>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="editable-cell"
                              onClick={() => startEditing(`${servizio.id}-servizio`, servizio.servizio)}
                            >
                              <strong>{servizio.servizio}</strong>
                              <Edit3 className="edit-icon"/>
                            </div>
                          )}
                        </td>
                        
                        {/* Colonne dinamiche per ogni scenario */}
                        {scenariOrdinati.map((scenario, index) => {
                          const colonnaKey = scenario.utenti === 1000 ? 'costo1000' :
                                           scenario.utenti === 10000 ? 'costo10000' :
                                           scenario.utenti === 100000 ? 'costo100000' :
                                           `costo${scenario.utenti}`;
                          
                          const valore = scenario.utenti === 1000 ? servizio.costo1000 :
                                        scenario.utenti === 10000 ? servizio.costo10000 :
                                        scenario.utenti === 100000 ? servizio.costo100000 :
                                        Number(servizio[colonnaKey]) || 0;

                          const badgeClass = index === 0 ? 'cost-badge-primary' :
                                            index === 1 ? 'cost-badge-success' :
                                            'cost-badge-warning';

                          return (
                            <td key={scenario.id} style={{ textAlign: 'center' }}>
                              {editingCell === `${servizio.id}-${colonnaKey}` ? (
                                <div className="edit-form">
                                  <input
                                    type="number"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="edit-input"
                                    autoFocus
                                    placeholder="0"
                                    style={{ textAlign: 'center' }}
                                  />
                                  <div className="edit-actions">
                                    <button
                                      onClick={() => saveEdit(servizio.id, colonnaKey, tempValue)}
                                      className="edit-btn edit-btn-save"
                                    >
                                      <Save size={12}/>
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="edit-btn edit-btn-cancel"
                                    >
                                      <X size={12}/>
                                    </button>
                                  </div>
                </div>
                              ) : (
                                <span 
                                  className={`cost-badge ${badgeClass}`}
                                  onClick={() => startEditing(`${servizio.id}-${colonnaKey}`, valore)}
                                  style={{ 
                                    backgroundColor: scenario.colore + '20',
                                    color: scenario.colore,
                                    borderColor: scenario.colore + '40'
                                  }}
                                >
                                  €{valore.toLocaleString()}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        
                        {/* Azioni */}
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => removeServizio(servizio.id)}
                            className="edit-btn edit-btn-cancel"
                            title="Rimuovi servizio"
                          >
                            <Trash2 size={12}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Riga totali */}
                    <tr style={{ backgroundColor: 'var(--gray-50)', fontWeight: 'bold' }}>
                      <td>
                        <strong>💰 TOTALE MENSILE</strong>
                      </td>
                      {scenariOrdinati.map((scenario, index) => {
                        const badgeClass = index === 0 ? 'cost-badge-primary' :
                                          index === 1 ? 'cost-badge-success' :
                                          'cost-badge-warning';
                        return (
                          <td key={scenario.id} style={{ textAlign: 'center' }}>
                            <span 
                              className={`cost-badge ${badgeClass} cost-badge-total`}
                              style={{ 
                                backgroundColor: scenario.colore + '20',
                                color: scenario.colore,
                                borderColor: scenario.colore + '40'
                              }}
                            >
                              €{totaliScenari[scenario.id]?.mensile.toLocaleString() || '0'}
                            </span>
                          </td>
                        );
                      })}
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
                </div>

            {/* Grafici Dinamici */}
            <div className="charts-section">
              {scenariOrdinati.map((scenario) => (
                <div key={scenario.id} className="chart-card">
                  <div className="chart-header">
                    <div 
                      className="chart-indicator"
                      style={{ backgroundColor: scenario.colore }}
                    />
                    <div>
                      <h3 className="chart-title">{scenario.nome}</h3>
                      <p className="chart-subtitle">
                        €{totaliScenari[scenario.id]?.mensile.toLocaleString() || '0'}/mese
                      </p>
                    </div>
                    {![1000, 10000, 100000].includes(scenario.utenti) && (
                      <button 
                        onClick={() => removeScenario(scenario.id)}
                        style={{ 
                          marginLeft: 'auto',
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          color: 'var(--danger-color)'
                        }}
                        title="Rimuovi scenario"
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                  <div className="chart-body">
                    <Bar data={getChartDataForScenario(scenario)} options={chartOptions} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="info-header">
              <div className="info-icon">
                <Settings size={20} />
              </div>
              <h3 className="info-title">Gestione Scenari Personalizzati</h3>
            </div>
            <div className="info-content">
              <div className="info-item">
                <strong>Scenari attivi:</strong> {scenariCustom.length}
              </div>
              <div className="info-item">
                <strong>Scenari custom:</strong> {scenariCustom.filter(s => ![1000, 10000, 100000].includes(s.utenti)).length}
              </div>
              <div className="info-item">
                <strong>Servizi monitorati:</strong> {serviziRicorrenti.length}
              </div>
              <div className="info-item">
                <strong>Tip:</strong> Crea scenari per startup, scale-up, enterprise
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-info">
              <div className="status-dot"></div>
              Ultima modifica: {new Date().toLocaleString('it-IT')}
            </div>
            <div className="footer-info">
              {scenariCustom.length} scenari configurati
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}