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
import {
  Plus,
  Download,
  RotateCcw,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  Edit3,
  Save,
  X,
  Settings,
  PlusCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import "./modern-design.css";

// Registra i componenti di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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
  "#2563eb", // Blu
  "#059669", // Verde
  "#d97706", // Arancione
  "#dc2626", // Rosso
  "#7c3aed", // Viola
  "#0891b2", // Cyan
  "#ea580c", // Orange scuro
  "#be123c", // Rose
  "#059669", // Emerald
  "#7c2d12", // Orange scuro
];

// Dati servizi ricorrenti
const SERVIZI_RICORRENTI: ServizioRow[] = [
  {
    id: crypto.randomUUID(),
    servizio: "Firebase Hosting",
    costo1000: 0,
    costo10000: 0,
    costo100000: 2,
  },
  {
    id: crypto.randomUUID(),
    servizio: "Superbase",
    costo1000: 30,
    costo10000: 30,
    costo100000: 30,
  },
  {
    id: crypto.randomUUID(),
    servizio: "AWS EC2",
    costo1000: 15,
    costo10000: 15,
    costo100000: 30,
  },
  {
    id: crypto.randomUUID(),
    servizio: "Crossmint",
    costo1000: 15,
    costo10000: 15,
    costo100000: 15,
  },
  {
    id: crypto.randomUUID(),
    servizio: "Verify(KYC)",
    costo1000: 60,
    costo10000: 60,
    costo100000: 60,
  },
  {
    id: crypto.randomUUID(),
    servizio: "FlutterFlow",
    costo1000: 50,
    costo10000: 50,
    costo100000: 50,
  },
];

// Scenari predefiniti
const SCENARI_DEFAULT: ScenarioCustom[] = [
  {
    id: "scenario-1k",
    nome: "1K Utenti",
    utenti: 1000,
    colore: "#2563eb",
    ordinamento: 1,
  },
  {
    id: "scenario-10k",
    nome: "10K Utenti",
    utenti: 10000,
    colore: "#059669",
    ordinamento: 2,
  },
  {
    id: "scenario-100k",
    nome: "100K Utenti",
    utenti: 100000,
    colore: "#d97706",
    ordinamento: 3,
  },
];

export default function DashboardServizi() {
  const [serviziRicorrenti, setServiziRicorrenti] =
    useState<ServizioRow[]>(SERVIZI_RICORRENTI);
  const [scenariCustom, setScenariCustom] =
    useState<ScenarioCustom[]>(SCENARI_DEFAULT);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [showScenarioForm, setShowScenarioForm] = useState(false);
  const [nuovoScenario, setNuovoScenario] = useState({
    nome: "",
    utenti: 0,
    colore: COLORI_SCENARI[3],
  });

  // State per parametri di Crossmint
  const [percentualeUtentiAttivi, setPercentualeUtentiAttivi] = useState(50); // Percentuale degli utenti attivi
  const [numeroUpdateMint, setNumeroUpdateMint] = useState(2);

  // State per parametri di Verify(KYC)
  const [percentualeCertificatori, setPercentualeCertificatori] = useState(10); // Percentuale degli utenti certificatori

  // Funzione per calcolare il costo di Verify(KYC)
  const calcolaCostoVerify = (numeroUtenti: number) => {
    // Formula: (49 + (numero totale di utenti certificatori * 0.80)) / 12
    const utentiCertificatori = (numeroUtenti * percentualeCertificatori) / 100;
    return (49 + utentiCertificatori * 0.8) / 12;
  };

  // Funzione per calcolare il costo di Crossmint
  const calcolaCostoCrossmint = (numeroUtenti: number) => {
    // Formula: ((numeroutenti*0.10) /12)+ (utentiAttivi% * numeroUtenti * 0.05 * numeroUpdateMint)
    const costoFisso = (numeroUtenti * 0.1) / 12;
    const utentiAttiviEffettivi =
      (numeroUtenti * percentualeUtentiAttivi) / 100;
    const costoVariabile = utentiAttiviEffettivi * 0.05 * numeroUpdateMint;
    return costoFisso + costoVariabile;
  };

  // Scenari ordinati
  const scenariOrdinati = useMemo(
    () => scenariCustom.sort((a, b) => a.ordinamento - b.ordinamento),
    [scenariCustom],
  );

  // Calcoli totali per tutti gli scenari
  const totaliScenari = useMemo(() => {
    const totali: { [key: string]: { mensile: number; annuale: number } } = {};

    scenariOrdinati.forEach((scenario) => {
      const colonnaKey = `costo${scenario.utenti}` as keyof ServizioRow;
      let totale = 0;

      // Se è uno scenario predefinito, usa le colonne esistenti
      if (scenario.utenti === 1000) {
        totale = serviziRicorrenti.reduce((sum, s) => {
          let costo = s.costo1000 || 0;
          // Applica la formula speciale per Crossmint
          if (s.servizio === "Crossmint") {
            costo = calcolaCostoCrossmint(1000);
          }
          // Applica la formula speciale per Verify(KYC)
          if (s.servizio === "Verify(KYC)") {
            costo = calcolaCostoVerify(1000);
          }
          return sum + costo;
        }, 0);
      } else if (scenario.utenti === 10000) {
        totale = serviziRicorrenti.reduce((sum, s) => {
          let costo = s.costo10000 || 0;
          // Applica la formula speciale per Crossmint
          if (s.servizio === "Crossmint") {
            costo = calcolaCostoCrossmint(10000);
          }
          // Applica la formula speciale per Verify(KYC)
          if (s.servizio === "Verify(KYC)") {
            costo = calcolaCostoVerify(10000);
          }
          return sum + costo;
        }, 0);
      } else if (scenario.utenti === 100000) {
        totale = serviziRicorrenti.reduce((sum, s) => {
          let costo = s.costo100000 || 0;
          // Applica la formula speciale per Crossmint
          if (s.servizio === "Crossmint") {
            costo = calcolaCostoCrossmint(100000);
          }
          // Applica la formula speciale per Verify(KYC)
          if (s.servizio === "Verify(KYC)") {
            costo = calcolaCostoVerify(100000);
          }
          return sum + costo;
        }, 0);
      } else {
        // Per scenari custom, usa la colonna dinamica
        totale = serviziRicorrenti.reduce((sum, s) => {
          let costo = Number(s[colonnaKey]) || 0;
          // Applica la formula speciale per Crossmint
          if (s.servizio === "Crossmint") {
            costo = calcolaCostoCrossmint(scenario.utenti);
          }
          // Applica la formula speciale per Verify(KYC)
          if (s.servizio === "Verify(KYC)") {
            costo = calcolaCostoVerify(scenario.utenti);
          }
          return sum + costo;
        }, 0);
      }

      totali[scenario.id] = {
        mensile: totale,
        annuale: totale * 12,
      };
    });

    return totali;
  }, [
    serviziRicorrenti,
    scenariOrdinati,
    percentualeUtentiAttivi,
    numeroUpdateMint,
    percentualeCertificatori,
    calcolaCostoCrossmint,
    calcolaCostoVerify,
  ]);

  // Configurazione grafici Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 16,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: { parsed: { y: number } }) {
            return `€${context.parsed.y.toLocaleString()}`;
          },
        },
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
            family: "Inter",
          },
          color: "#6b7280",
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
          drawBorder: false,
        },
        ticks: {
          callback: function (value: string | number) {
            return "€" + Number(value).toLocaleString();
          },
          font: {
            size: 11,
            family: "Inter",
          },
          color: "#6b7280",
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
      labels: serviziRicorrenti.map((s) =>
        s.servizio.length > 8 ? s.servizio.substring(0, 8) + "..." : s.servizio,
      ),
      datasets: [
        {
          data: serviziRicorrenti.map((s) => {
            if (scenario.utenti === 1000) return s.costo1000;
            if (scenario.utenti === 10000) return s.costo10000;
            if (scenario.utenti === 100000) return s.costo100000;
            return Number(s[colonnaKey]) || 0;
          }),
          backgroundColor: scenario.colore,
          hoverBackgroundColor: scenario.colore + "dd",
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
    if (field === "servizio") {
      setServiziRicorrenti((prev) =>
        prev.map((r) => (r.id === id ? { ...r, servizio: value } : r)),
      );
    } else {
      const numValue = Number(value) || 0;
      setServiziRicorrenti((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: numValue } : r)),
      );
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
      costo100000: 0,
    };

    // Aggiungi colonne per scenari custom esistenti
    scenariCustom.forEach((scenario) => {
      if (![1000, 10000, 100000].includes(scenario.utenti)) {
        nuovoServizio[`costo${scenario.utenti}`] = 0;
      }
    });

    setServiziRicorrenti((prev) => [...prev, nuovoServizio]);
  };

  const removeServizio = (id: string) => {
    setServiziRicorrenti((prev) => prev.filter((r) => r.id !== id));
  };

  const addScenarioCustom = () => {
    if (!nuovoScenario.nome || nuovoScenario.utenti <= 0) {
      alert("Inserisci un nome valido e un numero di utenti maggiore di 0");
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
      ordinamento: scenariCustom.length + 1,
    };

    setScenariCustom((prev) => [...prev, scenario]);

    // Aggiungi la nuova colonna a tutti i servizi esistenti
    setServiziRicorrenti((prev) =>
      prev.map((servizio) => ({
        ...servizio,
        [colonnaKey]: 0,
      })),
    );

    // Reset form
    setNuovoScenario({
      nome: "",
      utenti: 0,
      colore: COLORI_SCENARI[scenariCustom.length % COLORI_SCENARI.length],
    });
    setShowScenarioForm(false);
  };

  const removeScenario = (scenarioId: string) => {
    const scenario = scenariCustom.find((s) => s.id === scenarioId);
    if (!scenario) return;

    // Non permettere di rimuovere scenari predefiniti
    if ([1000, 10000, 100000].includes(scenario.utenti)) {
      alert("Non puoi rimuovere gli scenari predefiniti");
      return;
    }

    const colonnaKey = `costo${scenario.utenti}`;

    // Rimuovi scenario
    setScenariCustom((prev) => prev.filter((s) => s.id !== scenarioId));

    // Rimuovi colonna da tutti i servizi
    setServiziRicorrenti((prev) =>
      prev.map((servizio) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [colonnaKey]: _, ...resto } = servizio;
        return resto as ServizioRow;
      }),
    );
  };

  const reset = () => {
    setServiziRicorrenti(
      SERVIZI_RICORRENTI.map((r) => ({ ...r, id: crypto.randomUUID() })),
    );
    setScenariCustom(SCENARI_DEFAULT);
    setShowScenarioForm(false);
  };

  const exportCSV = () => {
    const data = serviziRicorrenti.map((servizio) => {
      const row: { [key: string]: string | number } = {
        Servizio: servizio.servizio,
      };
      scenariOrdinati.forEach((scenario) => {
        if (scenario.utenti === 1000) row[scenario.nome] = servizio.costo1000;
        else if (scenario.utenti === 10000)
          row[scenario.nome] = servizio.costo10000;
        else if (scenario.utenti === 100000)
          row[scenario.nome] = servizio.costo100000;
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
              <h1 className="header-title">JECT Cost Calculator</h1>
              <p className="header-subtitle">
                Analizza costi con scenari personalizzabili
              </p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setShowScenarioForm(true)}
                className="btn btn-primary"
                title="Aggiungi scenario personalizzato"
              >
                <PlusCircle className="btn-icon" />
                Nuovo Scenario
              </button>
              <button onClick={addServizio} className="btn btn-secondary">
                <Plus className="btn-icon" />
                Servizio
              </button>
              <button onClick={reset} className="btn btn-secondary">
                <RotateCcw className="btn-icon" />
                Reset
              </button>
              <button onClick={exportCSV} className="btn btn-secondary">
                <Download className="btn-icon" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Form Nuovo Scenario */}
        {showScenarioForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Crea Scenario Personalizzato</h3>

              <div className="form-group">
                <label className="form-label">Nome Scenario</label>
                <input
                  type="text"
                  value={nuovoScenario.nome}
                  onChange={(e) =>
                    setNuovoScenario((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="es. 5K Utenti, Startup, Enterprise..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Numero Utenti</label>
                <input
                  type="number"
                  value={nuovoScenario.utenti || ""}
                  onChange={(e) =>
                    setNuovoScenario((prev) => ({
                      ...prev,
                      utenti: Number(e.target.value),
                    }))
                  }
                  placeholder="5000"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Colore</label>
                <div className="color-picker">
                  {COLORI_SCENARI.map((colore, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setNuovoScenario((prev) => ({ ...prev, colore }))
                      }
                      className={`color-option ${nuovoScenario.colore === colore ? "selected" : ""}`}
                      style={{ backgroundColor: colore }}
                      title={`Colore ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={() => setShowScenarioForm(false)}
                  className="btn btn-secondary"
                >
                  Annulla
                </button>
                <button onClick={addScenarioCustom} className="btn btn-primary">
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
                      style={{
                        backgroundColor: scenario.colore + "20",
                        color: scenario.colore,
                      }}
                    >
                      {index === 0 ? (
                        <Users size={24} />
                      ) : index === 1 ? (
                        <TrendingUp size={24} />
                      ) : (
                        <DollarSign size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="stat-title">{scenario.nome}</h3>
                      <div className="stat-value">
                        €
                        {totaliScenari[scenario.id]?.mensile.toLocaleString() ||
                          "0"}
                        /MESE
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stat-footer">
                  <div className="stat-footer-text">
                    <span className="stat-highlight">
                      {scenario.utenti.toLocaleString()} utenti
                    </span>{" "}
                    • €
                    {totaliScenari[scenario.id]?.annuale.toLocaleString() ||
                      "0"}{" "}
                    all'anno
                    {![1000, 10000, 100000].includes(scenario.utenti) && (
                      <button
                        onClick={() => removeScenario(scenario.id)}
                        style={{
                          marginLeft: "0.5rem",
                          color: "var(--danger-color)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                        title="Rimuovi scenario"
                      >
                        <Trash2 size={12} />
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

              {/* Controlli Crossmint */}
              <div className="crossmint-controls">
                <h3 className="crossmint-title">⚙️ Parametri Dinamici</h3>

                <div className="crossmint-inputs">
                  <div className="crossmint-input-group">
                    <label className="crossmint-label">
                      Percentuale Utenti Attivi (%)
                    </label>
                    <input
                      type="number"
                      value={percentualeUtentiAttivi}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 100) {
                          setPercentualeUtentiAttivi(value);
                        }
                      }}
                      className="crossmint-input"
                      placeholder="50"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="crossmint-input-group">
                    <label className="crossmint-label">
                      Numero Update Mint Mensile
                    </label>
                    <input
                      type="number"
                      value={numeroUpdateMint}
                      onChange={(e) =>
                        setNumeroUpdateMint(Number(e.target.value))
                      }
                      className="crossmint-input"
                      placeholder="2"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="crossmint-input-group">
                    <label className="crossmint-label">
                      Percentuale Utenti Certificatori (%)
                    </label>
                    <input
                      type="number"
                      value={percentualeCertificatori}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 100) {
                          setPercentualeCertificatori(value);
                        }
                      }}
                      className="crossmint-input"
                      placeholder="10"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div className="crossmint-preview">
                    <div className="crossmint-preview-title">
                      Anteprima Costi:
                    </div>
                    <div className="crossmint-preview-values">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--gray-700)",
                            }}
                          >
                            Crossmint ({percentualeUtentiAttivi}% attivi):
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                              marginTop: "0.5rem",
                            }}
                          >
                            <span style={{ fontSize: "0.8rem" }}>
                              1K: €{calcolaCostoCrossmint(1000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              10K: €{calcolaCostoCrossmint(10000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              100K: €{calcolaCostoCrossmint(100000).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <strong
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--gray-700)",
                            }}
                          >
                            Verify(KYC) ({percentualeCertificatori}%
                            certificatori):
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.25rem",
                              marginTop: "0.5rem",
                            }}
                          >
                            <span style={{ fontSize: "0.8rem" }}>
                              1K: €{calcolaCostoVerify(1000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              10K: €{calcolaCostoVerify(10000).toFixed(2)}
                            </span>
                            <span style={{ fontSize: "0.8rem" }}>
                              100K: €{calcolaCostoVerify(100000).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Servizio</th>
                      {scenariOrdinati.map((scenario) => (
                        <th key={scenario.id} className="text-center">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <div
                              style={{
                                width: "0.75rem",
                                height: "0.75rem",
                                backgroundColor: scenario.colore,
                                borderRadius: "50%",
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
                                  onClick={() =>
                                    saveEdit(servizio.id, "servizio", tempValue)
                                  }
                                  className="edit-btn edit-btn-save"
                                >
                                  <Save size={12} />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="edit-btn edit-btn-cancel"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="editable-cell"
                              onClick={() =>
                                startEditing(
                                  `${servizio.id}-servizio`,
                                  servizio.servizio,
                                )
                              }
                            >
                              <strong>{servizio.servizio}</strong>
                              <Edit3 className="edit-icon" />
                            </div>
                          )}
                        </td>

                        {/* Colonne dinamiche per ogni scenario */}
                        {scenariOrdinati.map((scenario, index) => {
                          const colonnaKey =
                            scenario.utenti === 1000
                              ? "costo1000"
                              : scenario.utenti === 10000
                                ? "costo10000"
                                : scenario.utenti === 100000
                                  ? "costo100000"
                                  : `costo${scenario.utenti}`;

                          let valore =
                            scenario.utenti === 1000
                              ? servizio.costo1000
                              : scenario.utenti === 10000
                                ? servizio.costo10000
                                : scenario.utenti === 100000
                                  ? servizio.costo100000
                                  : Number(servizio[colonnaKey]) || 0;

                          // Applica la formula speciale per Crossmint
                          if (servizio.servizio === "Crossmint") {
                            valore = calcolaCostoCrossmint(scenario.utenti);
                          }
                          // Applica la formula speciale per Verify(KYC)
                          if (servizio.servizio === "Verify(KYC)") {
                            valore = calcolaCostoVerify(scenario.utenti);
                          }

                          const badgeClass =
                            index === 0
                              ? "cost-badge-primary"
                              : index === 1
                                ? "cost-badge-success"
                                : "cost-badge-warning";

                          return (
                            <td
                              key={scenario.id}
                              style={{ textAlign: "center" }}
                            >
                              {servizio.servizio === "Crossmint" ||
                              servizio.servizio === "Verify(KYC)" ? (
                                <span
                                  className={`cost-badge ${badgeClass}`}
                                  style={{
                                    backgroundColor: scenario.colore + "20",
                                    color: scenario.colore,
                                    borderColor: scenario.colore + "40",
                                    cursor: "default",
                                  }}
                                  title="Calcolato automaticamente con formula personalizzata"
                                >
                                  €{valore.toFixed(2)}
                                </span>
                              ) : editingCell ===
                                `${servizio.id}-${colonnaKey}` ? (
                                <div className="edit-form">
                                  <input
                                    type="number"
                                    value={tempValue}
                                    onChange={(e) =>
                                      setTempValue(e.target.value)
                                    }
                                    className="edit-input"
                                    autoFocus
                                    placeholder="0"
                                    style={{ textAlign: "center" }}
                                  />
                                  <div className="edit-actions">
                                    <button
                                      onClick={() =>
                                        saveEdit(
                                          servizio.id,
                                          colonnaKey,
                                          tempValue,
                                        )
                                      }
                                      className="edit-btn edit-btn-save"
                                    >
                                      <Save size={12} />
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="edit-btn edit-btn-cancel"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span
                                  className={`cost-badge ${badgeClass}`}
                                  onClick={() =>
                                    startEditing(
                                      `${servizio.id}-${colonnaKey}`,
                                      valore,
                                    )
                                  }
                                  style={{
                                    backgroundColor: scenario.colore + "20",
                                    color: scenario.colore,
                                    borderColor: scenario.colore + "40",
                                  }}
                                >
                                  €{valore.toLocaleString()}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* Azioni */}
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => removeServizio(servizio.id)}
                            className="edit-btn edit-btn-cancel"
                            title="Rimuovi servizio"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Riga totali */}
                    <tr
                      style={{
                        backgroundColor: "var(--gray-50)",
                        fontWeight: "bold",
                      }}
                    >
                      <td>
                        <strong>💰 TOTALE MENSILE</strong>
                      </td>
                      {scenariOrdinati.map((scenario, index) => {
                        const badgeClass =
                          index === 0
                            ? "cost-badge-primary"
                            : index === 1
                              ? "cost-badge-success"
                              : "cost-badge-warning";
                        return (
                          <td key={scenario.id} style={{ textAlign: "center" }}>
                            <span
                              className={`cost-badge ${badgeClass} cost-badge-total`}
                              style={{
                                backgroundColor: scenario.colore + "20",
                                color: scenario.colore,
                                borderColor: scenario.colore + "40",
                              }}
                            >
                              €
                              {totaliScenari[
                                scenario.id
                              ]?.mensile.toLocaleString() || "0"}
                            </span>
                          </td>
                        );
                      })}
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sezione Totali Annuali */}
              <div
                style={{
                  padding: "1.5rem",
                  borderTop: "2px solid var(--gray-200)",
                  backgroundColor: "var(--gray-50)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "var(--gray-900)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  📅 Totali Costi Annuali
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${scenariOrdinati.length}, 1fr)`,
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  {scenariOrdinati.map((scenario, index) => {
                    const totaleAnnuale =
                      totaliScenari[scenario.id]?.annuale || 0;
                    const totaleMensile =
                      totaliScenari[scenario.id]?.mensile || 0;
                    const differenzaPercentuale =
                      index > 0
                        ? ((totaleAnnuale -
                            (totaliScenari[scenariOrdinati[0].id]?.annuale ||
                              0)) /
                            (totaliScenari[scenariOrdinati[0].id]?.annuale ||
                              1)) *
                          100
                        : 0;

                    return (
                      <div
                        key={scenario.id}
                        style={{
                          background: "white",
                          borderRadius: "var(--border-radius-lg)",
                          padding: "1.25rem",
                          boxShadow: "var(--shadow)",
                          border: `2px solid ${scenario.colore}20`,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: scenario.colore,
                          }}
                        />

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: scenario.colore,
                              borderRadius: "50%",
                            }}
                          />
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "var(--gray-800)",
                            }}
                          >
                            {scenario.nome}
                          </h4>
                        </div>

                        <div style={{ marginBottom: "0.75rem" }}>
                          <div
                            style={{
                              fontSize: "1.75rem",
                              fontWeight: "800",
                              color: scenario.colore,
                              marginBottom: "0.25rem",
                            }}
                          >
                            €{totaleAnnuale.toLocaleString()}
                          </div>
                          <div
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--gray-600)",
                              fontWeight: "500",
                            }}
                          >
                            €{totaleMensile.toLocaleString()}/mese × 12
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--gray-500)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {scenario.utenti.toLocaleString()} utenti
                        </div>

                        {index > 0 && differenzaPercentuale !== 0 && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "50px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              backgroundColor:
                                differenzaPercentuale > 0
                                  ? "rgba(220, 38, 38, 0.1)"
                                  : "rgba(34, 197, 94, 0.1)",
                              color:
                                differenzaPercentuale > 0
                                  ? "var(--danger-color)"
                                  : "var(--success-color)",
                            }}
                          >
                            {differenzaPercentuale > 0 ? "↗️" : "↘️"}
                            {Math.abs(differenzaPercentuale).toFixed(0)}% vs{" "}
                            {scenariOrdinati[0].nome}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Riepilogo Comparativo */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)",
                    border: "1px solid rgba(37, 99, 235, 0.1)",
                    borderRadius: "var(--border-radius-lg)",
                    padding: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <TrendingUp
                      size={16}
                      style={{ color: "var(--primary-color)" }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "var(--primary-color)",
                      }}
                    >
                      Analisi Comparativa Annuale
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "0.75rem",
                      fontSize: "0.8125rem",
                      color: "var(--gray-700)",
                    }}
                  >
                    <div>
                      <strong>Scenario più economico:</strong>
                      <br />
                      {
                        scenariOrdinati.reduce((min, scenario) =>
                          (totaliScenari[scenario.id]?.annuale || 0) <
                          (totaliScenari[min.id]?.annuale || Infinity)
                            ? scenario
                            : min,
                        ).nome
                      }{" "}
                      - €
                      {Math.min(
                        ...scenariOrdinati.map(
                          (s) => totaliScenari[s.id]?.annuale || 0,
                        ),
                      ).toLocaleString()}
                    </div>

                    <div>
                      <strong>Scenario più costoso:</strong>
                      <br />
                      {
                        scenariOrdinati.reduce((max, scenario) =>
                          (totaliScenari[scenario.id]?.annuale || 0) >
                          (totaliScenari[max.id]?.annuale || 0)
                            ? scenario
                            : max,
                        ).nome
                      }{" "}
                      - €
                      {Math.max(
                        ...scenariOrdinati.map(
                          (s) => totaliScenari[s.id]?.annuale || 0,
                        ),
                      ).toLocaleString()}
                    </div>

                    <div>
                      <strong>Differenza massima:</strong>
                      <br />€
                      {(
                        Math.max(
                          ...scenariOrdinati.map(
                            (s) => totaliScenari[s.id]?.annuale || 0,
                          ),
                        ) -
                        Math.min(
                          ...scenariOrdinati.map(
                            (s) => totaliScenari[s.id]?.annuale || 0,
                          ),
                        )
                      ).toLocaleString()}{" "}
                      annui
                    </div>

                    <div>
                      <strong>Media annuale:</strong>
                      <br />€
                      {Math.round(
                        scenariOrdinati.reduce(
                          (sum, s) => sum + (totaliScenari[s.id]?.annuale || 0),
                          0,
                        ) / scenariOrdinati.length,
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
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
                        €
                        {totaliScenari[scenario.id]?.mensile.toLocaleString() ||
                          "0"}
                        /mese
                      </p>
                    </div>
                    {![1000, 10000, 100000].includes(scenario.utenti) && (
                      <button
                        onClick={() => removeScenario(scenario.id)}
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--danger-color)",
                        }}
                        title="Rimuovi scenario"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="chart-body">
                    <Bar
                      data={getChartDataForScenario(scenario)}
                      options={chartOptions}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Planning Strategy Section */}
          <div className="business-strategy-section">
            <div className="strategy-header">
              <div className="strategy-icon">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="strategy-title">
                  🎯 Strategia Business Planning
                </h2>
                <p className="strategy-subtitle">
                  Piano strategico basato sui tuoi scenari di costo
                </p>
              </div>
            </div>

            {/* Fasi della Strategia */}
            <div className="strategy-phases">
              {/* Fase 1: Analisi Scenari */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">1</div>
                  <h3 className="phase-title">
                    📈 Analisi Scenari di Crescita
                  </h3>
                </div>
                <div className="phase-content">
                  <div className="phase-grid">
                    <div className="phase-card">
                      <h4>🎯 Scenari Strategici Raccomandati</h4>
                      <ul>
                        <li>
                          <strong>MVP Launch:</strong> 500-1K utenti
                        </li>
                        <li>
                          <strong>Product-Market Fit:</strong> 5K-10K utenti
                        </li>
                        <li>
                          <strong>Scale-Up:</strong> 50K utenti
                        </li>
                        <li>
                          <strong>Market Leader:</strong> 100K+ utenti
                        </li>
                      </ul>
                    </div>
                    <div className="phase-card">
                      <h4>💰 Break-Even Analysis</h4>
                      <div className="metric-row">
                        <span>ARPU Target:</span>
                        <input
                          type="number"
                          placeholder="€50"
                          className="metric-input"
                          style={{ width: "80px" }}
                        />
                      </div>
                      {scenariOrdinati.map((scenario) => {
                        const costoPerUtente =
                          (totaliScenari[scenario.id]?.mensile || 0) /
                          scenario.utenti;
                        return (
                          <div key={scenario.id} className="metric-row">
                            <span>{scenario.nome} CPU:</span>
                            <span className="metric-value">
                              €{costoPerUtente.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fase 2: Ottimizzazione Costi */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">2</div>
                  <h3 className="phase-title">💰 Ottimizzazione Costi</h3>
                </div>
                <div className="phase-content">
                  <div className="phase-grid">
                    <div className="phase-card">
                      <h4>🔴 Priorità Alta - Servizi Costosi</h4>
                      {serviziRicorrenti
                        .filter((s) => s.costo100000 > 50)
                        .sort((a, b) => b.costo100000 - a.costo100000)
                        .slice(0, 3)
                        .map((servizio) => (
                          <div key={servizio.id} className="priority-item high">
                            <strong>{servizio.servizio}</strong>
                            <span>€{servizio.costo100000}/mese</span>
                            <small>Negozia contratti volume</small>
                          </div>
                        ))}
                    </div>
                    <div className="phase-card">
                      <h4>🟡 Priorità Media - Crescita Variabile</h4>
                      {serviziRicorrenti
                        .filter((s) => {
                          const crescita = s.costo100000 / (s.costo1000 || 1);
                          return crescita > 1.5 && crescita < 3;
                        })
                        .slice(0, 3)
                        .map((servizio) => (
                          <div
                            key={servizio.id}
                            className="priority-item medium"
                          >
                            <strong>{servizio.servizio}</strong>
                            <span>
                              Crescita:{" "}
                              {(
                                (servizio.costo100000 /
                                  (servizio.costo1000 || 1)) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                            <small>Ottimizza utilizzo</small>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fase 3: Financial Planning */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">3</div>
                  <h3 className="phase-title">📊 Financial Planning</h3>
                </div>
                <div className="phase-content">
                  <div className="financial-timeline">
                    {scenariOrdinati.map((scenario, index) => (
                      <div key={scenario.id} className="timeline-item">
                        <div
                          className="timeline-marker"
                          style={{ backgroundColor: scenario.colore }}
                        ></div>
                        <div className="timeline-content">
                          <h4>
                            Anno {index + 1}: {scenario.nome}
                          </h4>
                          <div className="timeline-metrics">
                            <div className="timeline-metric">
                              <span>Budget IT:</span>
                              <strong>
                                €
                                {totaliScenari[
                                  scenario.id
                                ]?.annuale.toLocaleString()}
                              </strong>
                            </div>
                            <div className="timeline-metric">
                              <span>Buffer (+30%):</span>
                              <strong>
                                €
                                {Math.round(
                                  (totaliScenari[scenario.id]?.annuale || 0) *
                                    1.3,
                                ).toLocaleString()}
                              </strong>
                            </div>
                            <div className="timeline-metric">
                              <span>Investimenti:</span>
                              <strong>
                                €
                                {Math.round(
                                  (totaliScenari[scenario.id]?.annuale || 0) *
                                    0.2,
                                ).toLocaleString()}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fase 4: Risk Management */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">4</div>
                  <h3 className="phase-title">⚠️ Risk Management</h3>
                </div>
                <div className="phase-content">
                  <div className="risk-matrix">
                    <div className="risk-card high-risk">
                      <h4>🔴 Alto Rischio</h4>
                      <p>
                        <strong>Crescita Accelerata (+200%)</strong>
                      </p>
                      <p>
                        Budget necessario: €
                        {Math.round(
                          (totaliScenari[
                            scenariOrdinati[scenariOrdinati.length - 1]?.id
                          ]?.annuale || 0) * 2,
                        ).toLocaleString()}
                      </p>
                      <small>Prepara contratti scalabili</small>
                    </div>
                    <div className="risk-card medium-risk">
                      <h4>🟡 Medio Rischio</h4>
                      <p>
                        <strong>Stagnazione Crescita</strong>
                      </p>
                      <p>Ottimizzazione: -30% costi</p>
                      <small>Rivedi servizi non essenziali</small>
                    </div>
                    <div className="risk-card low-risk">
                      <h4>🟢 Basso Rischio</h4>
                      <p>
                        <strong>Crescita Lineare</strong>
                      </p>
                      <p>Scenario attuale mantieni</p>
                      <small>Monitoraggio standard</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fase 5: KPI Dashboard */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">5</div>
                  <h3 className="phase-title">📋 KPI Dashboard</h3>
                </div>
                <div className="phase-content">
                  <div className="kpi-grid">
                    {scenariOrdinati.map((scenario) => {
                      const costoPerUtente =
                        (totaliScenari[scenario.id]?.mensile || 0) /
                        scenario.utenti;
                      const efficiencyRatio = 50 / costoPerUtente; // Assumendo ARPU €50

                      return (
                        <div key={scenario.id} className="kpi-card">
                          <h4>{scenario.nome}</h4>
                          <div className="kpi-metrics">
                            <div className="kpi-metric">
                              <span>Cost per User</span>
                              <strong
                                style={{
                                  color:
                                    costoPerUtente > 15
                                      ? "var(--danger-color)"
                                      : "var(--success-color)",
                                }}
                              >
                                €{costoPerUtente.toFixed(2)}
                              </strong>
                            </div>
                            <div className="kpi-metric">
                              <span>Efficiency Ratio</span>
                              <strong
                                style={{
                                  color:
                                    efficiencyRatio > 2
                                      ? "var(--success-color)"
                                      : "var(--warning-color)",
                                }}
                              >
                                {efficiencyRatio.toFixed(1)}x
                              </strong>
                            </div>
                            <div className="kpi-metric">
                              <span>Budget Status</span>
                              <div
                                className="status-indicator"
                                style={{
                                  backgroundColor:
                                    costoPerUtente < 10
                                      ? "var(--success-color)"
                                      : costoPerUtente < 20
                                        ? "var(--warning-color)"
                                        : "var(--danger-color)",
                                }}
                              >
                                {costoPerUtente < 10
                                  ? "✅ Ottimo"
                                  : costoPerUtente < 20
                                    ? "⚠️ Attenzione"
                                    : "🔴 Critico"}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Fase 6: Action Plan */}
              <div className="strategy-phase">
                <div className="phase-header">
                  <div className="phase-number">6</div>
                  <h3 className="phase-title">🚀 Action Plan</h3>
                </div>
                <div className="phase-content">
                  <div className="action-timeline">
                    <div className="action-item">
                      <div className="action-period">Settimana 1-2</div>
                      <div className="action-tasks">
                        <div className="action-task">
                          ✅ Setup scenari nel calculator
                        </div>
                        <div className="action-task">
                          📊 Ricerca benchmark industry
                        </div>
                        <div className="action-task">💰 Define ARPU target</div>
                      </div>
                    </div>
                    <div className="action-item">
                      <div className="action-period">Settimana 3-4</div>
                      <div className="action-tasks">
                        <div className="action-task">🔍 Analisi gap costi</div>
                        <div className="action-task">🤝 Vendor negotiation</div>
                        <div className="action-task">⚠️ Risk assessment</div>
                      </div>
                    </div>
                    <div className="action-item">
                      <div className="action-period">Mese 2</div>
                      <div className="action-tasks">
                        <div className="action-task">✅ Budget approval</div>
                        <div className="action-task">
                          📈 KPI dashboard setup
                        </div>
                        <div className="action-task">
                          🔄 Monthly review processo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Framework */}
            <div className="decision-framework">
              <h3>🎯 Decision Framework</h3>
              <div className="decision-grid">
                <div className="decision-card go">
                  <h4>✅ GO Criteria</h4>
                  <ul>
                    <li>Cost per User &lt; 30% ARPU</li>
                    <li>Break-even &lt; 12 mesi</li>
                    <li>Budget variance &lt; 20%</li>
                  </ul>
                </div>
                <div className="decision-card no-go">
                  <h4>❌ NO-GO Criteria</h4>
                  <ul>
                    <li>Costi crescono &gt;2x vs utenti</li>
                    <li>ROI negativo &gt;18 mesi</li>
                    <li>Dipendenza critica 1 vendor</li>
                  </ul>
                </div>
              </div>
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
                <strong>Scenari custom:</strong>{" "}
                {
                  scenariCustom.filter(
                    (s) => ![1000, 10000, 100000].includes(s.utenti),
                  ).length
                }
              </div>
              <div className="info-item">
                <strong>Servizi monitorati:</strong> {serviziRicorrenti.length}
              </div>
              <div className="info-item">
                <strong>Tip:</strong> Usa la strategia sopra per ottimizzare i
                costi
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-info">
              <div className="status-dot"></div>
              Ultima modifica: {new Date().toLocaleString("it-IT")}
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
